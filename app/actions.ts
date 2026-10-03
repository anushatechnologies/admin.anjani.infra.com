'use server';

import { revalidatePath } from 'next/cache';
import { readFile, writeFile, mkdir, readdir, stat, unlink } from 'fs/promises';
import path from 'path';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { BlogArticle } from '@/data/blogs';
import { extractYouTubeEmbedUrl } from '@/lib/youtube';

export interface BannerItem {
  id: string;
  title: string;
  tagline: string;
  subtitle: string;
  image: string;
  link: string;
  buttonText: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  priority: number;
  placement: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface MediaFile {
  name: string;
  url: string;
  size: number;
  updatedAt: string;
  isUploaded?: boolean;
}

export interface ProjectItem {
  id: string | number;
  dbId?: string;
  name: string;
  location: string;
  type: string;
  area: string;
  category: string;
  featured: boolean;
  image: string;
  client: string;
  year: string;
  startDate?: string;
  completionDate?: string;
  description: string;
  specs: string[];
  gallery: string[];
}

export interface OfferItem {
  id: string;
  title: string;
  subtitle: string;
  badge: string;
  image: string;
  startDate: string;
  endDate: string;
  discount: string;
  ctaText: string;
  ctaLink: string;
  isActive: boolean;
  createdAt?: string;
}

export interface TestimonialItem {
  id: string;
  name: string;
  location: string;
  text: string;
  image: string;
  rating?: number;
  isActive?: boolean;
  displayOrder?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface VideoShowcaseItem {
  id: string;
  title: string;
  subtitle: string;
  badgeText: string;
  videoType: 'youtube' | 'direct';
  videoUrl: string;
  embedUrl: string;
  directVideoUrl?: string;
  posterImage?: string;
  isActive: boolean;
  updatedAt?: string;
}

// ──────────────── Helper File Readers ────────────────
const bannersPath = path.join(process.cwd(), 'data', 'banners.json');
const projectsPath = path.join(process.cwd(), 'data', 'projects.json');
const offersPath = path.join(process.cwd(), 'data', 'offers.json');
const blogsPath = path.join(process.cwd(), 'data', 'blogs.json');
const testimonialsPath = path.join(process.cwd(), 'data', 'testimonials.json');
const videoPath = path.join(process.cwd(), 'data', 'video.json');

async function readJsonFile<T>(filePath: string, fallback: T): Promise<T> {
  try {
    const data = await readFile(filePath, 'utf8');
    return JSON.parse(data) as T;
  } catch (error) {
    return fallback;
  }
}

async function writeJsonFile(filePath: string, data: any) {
  const dir = path.dirname(filePath);
  await mkdir(dir, { recursive: true });
  await writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
}

// ──────────────── 1. Media & Upload Server Actions ────────────────

export async function uploadImageServerAction(formData: FormData) {
  try {
    const file = formData.get('file') as File | null;
    if (!file || typeof file === 'string') {
      return { success: false, message: 'No valid file provided' };
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const timestamp = Date.now();
    const finalFilename = `${timestamp}-${safeName}`;

    // Determine mime type
    let inferredMime = file.type;
    if (!inferredMime || inferredMime === 'application/octet-stream') {
      const ext = path.extname(safeName).toLowerCase();
      if (ext === '.mp4') inferredMime = 'video/mp4';
      else if (ext === '.webm') inferredMime = 'video/webm';
      else if (ext === '.mp3') inferredMime = 'audio/mpeg';
      else if (ext === '.m4a') inferredMime = 'audio/mp4';
      else if (ext === '.png') inferredMime = 'image/png';
      else if (ext === '.jpg' || ext === '.jpeg') inferredMime = 'image/jpeg';
      else if (ext === '.webp') inferredMime = 'image/webp';
      else inferredMime = 'image/jpeg';
    }

    // 1. Upload to Supabase Storage bucket 'anjani-media'
    let publicUrl = `/uploads/${finalFilename}`;
    try {
      const { data: uploadData, error: uploadErr } = await supabaseAdmin.storage
        .from('anjani-media')
        .upload(finalFilename, buffer, {
          contentType: inferredMime,
          upsert: true,
        });

      if (!uploadErr && uploadData) {
        const { data: urlData } = supabaseAdmin.storage
          .from('anjani-media')
          .getPublicUrl(finalFilename);
        publicUrl = urlData.publicUrl;

        // Save record to media_library table
        await supabaseAdmin.from('media_library').insert({
          filename: finalFilename,
          file_url: publicUrl,
          file_size: file.size,
          mime_type: file.type,
          storage_path: uploadData.path,
        });
      }
    } catch (e: any) {
      console.warn('[Supabase Storage] Notice:', e.message);
    }

    // 2. Backup to local uploads directory (and mirror to customer website)
    try {
      const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
      await mkdir(uploadsDir, { recursive: true });
      await writeFile(path.join(uploadsDir, finalFilename), buffer);

      // Mirror to customer website public/uploads
      const customerUploadsDir = 'c:/Anjina/public/uploads';
      if (fs.existsSync('c:/Anjina/public')) {
        await mkdir(customerUploadsDir, { recursive: true });
        await writeFile(path.join(customerUploadsDir, finalFilename), buffer);
      }
    } catch {
      // Ignored if file write fails in serverless environments
    }

    revalidatePath('/admin');
    revalidatePath('/');

    return {
      success: true,
      url: publicUrl,
      filename: finalFilename,
      size: file.size,
      message: 'Image uploaded successfully to Supabase Storage & CDN',
    };
  } catch (error: any) {
    console.error('uploadImageServerAction error:', error);
    return { success: false, message: error.message || 'Image upload failed' };
  }
}

export async function getMediaFilesServerAction(): Promise<MediaFile[]> {
  const files: MediaFile[] = [];

  // Try fetching from Supabase Storage
  try {
    const { data: remoteFiles, error } = await supabaseAdmin.storage
      .from('anjani-media')
      .list('', { limit: 100, sortBy: { column: 'created_at', order: 'desc' } });

    if (!error && remoteFiles) {
      for (const rf of remoteFiles) {
        if (rf.name && !rf.name.startsWith('.')) {
          const { data } = supabaseAdmin.storage.from('anjani-media').getPublicUrl(rf.name);
          files.push({
            name: rf.name,
            url: data.publicUrl,
            size: rf.metadata?.size || 0,
            updatedAt: rf.updated_at || new Date().toISOString(),
            isUploaded: true,
          });
        }
      }
    }
  } catch (e: any) {
    console.warn('[Supabase] Warning fetching media:', e.message);
  }

  // Also include local uploads as fallback
  try {
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    const entries = await readdir(uploadsDir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isFile() && !files.some((f) => f.name === entry.name)) {
        const filePath = path.join(uploadsDir, entry.name);
        const fileStat = await stat(filePath);
        files.push({
          name: entry.name,
          url: `/uploads/${entry.name}`,
          size: fileStat.size,
          updatedAt: fileStat.mtime.toISOString(),
          isUploaded: true,
        });
      }
    }
  } catch {
    // Local directory empty or not created
  }

  return files.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
}

export async function deleteMediaServerAction(filename: string) {
  try {
    const safeFilename = path.basename(filename);

    // Remove from Supabase Storage
    try {
      await supabaseAdmin.storage.from('anjani-media').remove([safeFilename]);
      await supabaseAdmin.from('media_library').delete().eq('filename', safeFilename);
    } catch (e: any) {
      console.warn('[Supabase Storage] Delete error:', e.message);
    }

    // Remove from local file system
    try {
      const targetPath = path.join(process.cwd(), 'public', 'uploads', safeFilename);
      await unlink(targetPath);
    } catch {
      // Ignored
    }

    revalidatePath('/admin');
    return { success: true, message: 'Image deleted from Supabase & Storage' };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

// ──────────────── 2. Banners Server Actions ────────────────

export async function getBannersServerAction(): Promise<BannerItem[]> {
  // Try Supabase first
  try {
    const { data: dbBanners, error } = await supabaseAdmin
      .from('banners')
      .select('*')
      .order('display_order', { ascending: true });

    if (!error && dbBanners && dbBanners.length > 0) {
      return dbBanners.map((b: any) => ({
        id: b.id,
        title: b.title,
        tagline: b.tag || '',
        subtitle: b.subtitle || '',
        image: b.image_url,
        link: b.link_url || '/contact',
        buttonText: 'Explore More',
        startDate: b.start_date || '',
        endDate: b.end_date || '',
        isActive: b.is_active ?? true,
        priority: b.display_order || 1,
        placement: 'hero',
        createdAt: b.created_at,
        updatedAt: b.updated_at,
      }));
    }
  } catch (e: any) {
    console.warn('[Supabase] Warning reading banners:', e.message);
  }

  // Fallback to local JSON
  return await readJsonFile<BannerItem[]>(bannersPath, []);
}

export async function saveBannerServerAction(bannerData: Partial<BannerItem>) {
  try {
    const banners = await readJsonFile<BannerItem[]>(bannersPath, []);
    let updatedBanner: BannerItem;

    if (bannerData.id) {
      const index = banners.findIndex((b) => b.id === bannerData.id);
      if (index === -1) {
        return { success: false, message: 'Banner not found' };
      }
      updatedBanner = {
        ...banners[index],
        ...bannerData,
        updatedAt: new Date().toISOString(),
      };
      banners[index] = updatedBanner;
    } else {
      updatedBanner = {
        id: `banner-${Date.now()}`,
        title: bannerData.title || 'Untitled Banner',
        tagline: bannerData.tagline || '',
        subtitle: bannerData.subtitle || '',
        image: bannerData.image || '/projects/proj1.jpg',
        link: bannerData.link || '/customized-interiors',
        buttonText: bannerData.buttonText || 'Explore More',
        startDate: bannerData.startDate || new Date().toISOString().split('T')[0],
        endDate: bannerData.endDate || '2030-12-31',
        isActive: bannerData.isActive !== undefined ? bannerData.isActive : true,
        priority: Number(bannerData.priority) || banners.length + 1,
        placement: bannerData.placement || 'hero',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      banners.push(updatedBanner);
    }

    // Save to local JSON file
    await writeJsonFile(bannersPath, banners);

    // Sync to Supabase
    try {
      await supabaseAdmin.from('banners').upsert({
        id: updatedBanner.id,
        title: updatedBanner.title,
        subtitle: updatedBanner.subtitle,
        tag: updatedBanner.tagline,
        image_url: updatedBanner.image,
        link_url: updatedBanner.link,
        start_date: updatedBanner.startDate || null,
        end_date: updatedBanner.endDate || null,
        is_active: updatedBanner.isActive,
        display_order: updatedBanner.priority,
        updated_at: new Date().toISOString(),
      });
    } catch (e: any) {
      console.warn('[Supabase] Warning syncing banner:', e.message);
    }

    revalidatePath('/admin');
    revalidatePath('/');

    return { success: true, banner: updatedBanner, banners };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

export async function deleteBannerServerAction(id: string) {
  try {
    // 1. Delete from Supabase FIRST
    const { error: dbError } = await supabaseAdmin.from('banners').delete().eq('id', id);
    if (dbError) {
      console.error('[Supabase] Error deleting banner:', dbError.message);
      return { success: false, message: `Database delete failed: ${dbError.message}` };
    }

    // 2. Update local fallback JSON
    let banners = await readJsonFile<BannerItem[]>(bannersPath, []);
    banners = banners.filter((b) => b.id !== id);
    await writeJsonFile(bannersPath, banners);

    try {
      const customerBannersPath = 'c:/Anjina/data/banners.json';
      if (fs.existsSync('c:/Anjina/data')) {
        await writeJsonFile(customerBannersPath, banners);
      }
    } catch {}

    revalidatePath('/admin');
    revalidatePath('/');

    return { success: true, message: 'Banner deleted permanently from database and admin' };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

// ──────────────── 3. Projects Server Actions ────────────────

export async function getProjectsServerAction(): Promise<ProjectItem[]> {
  try {
    const { data: dbProjects, error } = await supabaseAdmin
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && dbProjects && dbProjects.length > 0) {
      const mapped: ProjectItem[] = dbProjects.map((p: any) => ({
        id: p.id,
        dbId: p.id,
        name: p.title || 'Untitled Project',
        location: p.location || 'Hyderabad',
        type: p.category || 'Interior Fitout',
        area: p.budget || '',
        category: p.category || 'Civil',
        featured: Boolean(p.is_featured),
        image: p.image_url || '/projects/proj1.jpg',
        client: 'Private Client',
        year: '2026',
        startDate: '',
        completionDate: p.completion_days || '40 Days',
        description: p.description || '',
        specs: [],
        gallery: [p.image_url || '/projects/proj1.jpg'],
      }));

      // Keep local projects.json synchronized
      try {
        await writeJsonFile(projectsPath, mapped);
      } catch {}

      return mapped;
    }
  } catch (e: any) {
    console.warn('[Supabase] Warning reading projects:', e.message);
  }

  return await readJsonFile<ProjectItem[]>(projectsPath, []);
}

export async function saveProjectServerAction(projectData: Partial<ProjectItem>) {
  try {
    let projects = await getProjectsServerAction();
    let updatedProj: ProjectItem;

    if (projectData.id) {
      const targetId = String(projectData.dbId || projectData.id);
      const index = projects.findIndex((p) => String(p.id) === targetId || String(p.dbId) === targetId);
      const existing = index !== -1 ? projects[index] : ({} as any);

      updatedProj = {
        ...existing,
        ...projectData,
        id: targetId,
        dbId: targetId,
        specs: Array.isArray(projectData.specs) ? projectData.specs : existing.specs || [],
        gallery: Array.isArray(projectData.gallery)
          ? projectData.gallery
          : existing.gallery || (projectData.image ? [projectData.image] : ['/projects/proj1.jpg']),
      };

      if (index !== -1) {
        projects[index] = updatedProj;
      } else {
        projects.unshift(updatedProj);
      }
    } else {
      const generatedId = `proj-${Date.now()}`;
      updatedProj = {
        id: generatedId,
        dbId: generatedId,
        name: projectData.name || 'Untitled Project',
        location: projectData.location || 'Hyderabad',
        type: projectData.type || 'Interior Fitout',
        area: projectData.area || '1,000 Sq.Ft.',
        category: projectData.category || 'Civil',
        featured: Boolean(projectData.featured),
        image: projectData.image || '/projects/proj1.jpg',
        client: projectData.client || 'Private Client',
        year: projectData.year || new Date().getFullYear().toString(),
        startDate: projectData.startDate || '',
        completionDate: projectData.completionDate || '40 Days',
        description: projectData.description || '',
        specs: Array.isArray(projectData.specs) ? projectData.specs : [],
        gallery: Array.isArray(projectData.gallery)
          ? projectData.gallery
          : projectData.image
          ? [projectData.image]
          : ['/projects/proj1.jpg'],
      };
      projects.unshift(updatedProj);
    }

    // 1. Sync to Supabase DB FIRST
    const dbPayload = {
      id: updatedProj.dbId || String(updatedProj.id),
      title: updatedProj.name,
      category: updatedProj.category,
      location: updatedProj.location,
      image_url: updatedProj.image,
      budget: updatedProj.area,
      completion_days: updatedProj.completionDate || '40 Days',
      description: updatedProj.description,
      is_featured: updatedProj.featured,
      updated_at: new Date().toISOString(),
    };

    const { error: dbErr } = await supabaseAdmin.from('projects').upsert(dbPayload);
    if (dbErr) {
      console.error('[Supabase] Error saving project to DB:', dbErr.message);
      return { success: false, message: `Database error: ${dbErr.message}` };
    }

    // 2. Write to local JSON fallback
    await writeJsonFile(projectsPath, projects);
    try {
      const customerProjectsPath = 'c:/Anjina/data/projects.json';
      if (fs.existsSync('c:/Anjina/data')) {
        await writeJsonFile(customerProjectsPath, projects);
      }
    } catch {}

    revalidatePath('/admin');
    revalidatePath('/');
    revalidatePath('/projects');

    return { success: true, project: updatedProj, projects };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

export async function deleteProjectServerAction(id: string | number) {
  try {
    const rawId = String(id).trim();
    const idWithPrefix = rawId.startsWith('proj-') ? rawId : `proj-${rawId}`;
    const idWithoutPrefix = rawId.replace(/^proj-/, '');

    // 1. Delete from Supabase FIRST and verify deletion
    const { data: deletedRows, error: dbError } = await supabaseAdmin
      .from('projects')
      .delete()
      .or(`id.eq.${rawId},id.eq.${idWithPrefix},id.eq.${idWithoutPrefix}`)
      .select();

    if (dbError) {
      console.error('[Supabase] Error deleting project from DB:', dbError.message);
      return { success: false, message: `Failed to delete from database: ${dbError.message}` };
    }

    console.log(`[Supabase] Successfully deleted ${deletedRows?.length || 0} project row(s) from database`);

    // 2. Also delete from local fallback JSON (admin and customer site)
    let projects = await readJsonFile<ProjectItem[]>(projectsPath, []);
    projects = projects.filter(
      (p) => String(p.id) !== rawId && String(p.id) !== idWithPrefix && String(p.id) !== idWithoutPrefix
    );
    await writeJsonFile(projectsPath, projects);

    try {
      const customerProjectsPath = 'c:/Anjina/data/projects.json';
      if (fs.existsSync('c:/Anjina/data')) {
        await writeJsonFile(customerProjectsPath, projects);
      }
    } catch {}

    revalidatePath('/admin');
    revalidatePath('/');
    revalidatePath('/projects');

    return { success: true, message: 'Project deleted permanently from database and admin' };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

// ──────────────── 4. Offers Server Actions ────────────────

export async function getOffersServerAction(): Promise<OfferItem[]> {
  try {
    const { data: dbOffers, error } = await supabaseAdmin.from('offers').select('*');
    if (!error && dbOffers && dbOffers.length > 0) {
      return dbOffers.map((o: any) => ({
        id: o.id,
        title: o.title,
        subtitle: o.description || '',
        badge: 'SPECIAL OFFER',
        image: '/customized-home-kitchen.jpg',
        startDate: o.created_at?.split('T')[0] || '',
        endDate: o.valid_until || '2030-12-31',
        discount: `${o.discount_pct}% OFF`,
        ctaText: 'Claim Offer',
        ctaLink: '/contact',
        isActive: o.is_active ?? true,
        createdAt: o.created_at,
      }));
    }
  } catch (e: any) {
    console.warn('[Supabase] Warning reading offers:', e.message);
  }

  return await readJsonFile<OfferItem[]>(offersPath, []);
}

export async function saveOfferServerAction(offerData: Partial<OfferItem>) {
  try {
    const offers = await readJsonFile<OfferItem[]>(offersPath, []);
    let updatedOffer: OfferItem;

    if (offerData.id) {
      const index = offers.findIndex((o) => o.id === offerData.id);
      if (index === -1) {
        return { success: false, message: 'Offer not found' };
      }
      updatedOffer = {
        ...offers[index],
        ...offerData,
      };
      offers[index] = updatedOffer;
    } else {
      updatedOffer = {
        id: `offer-${Date.now()}`,
        title: offerData.title || 'Untitled Offer',
        subtitle: offerData.subtitle || '',
        badge: offerData.badge || 'PROMOTION',
        image: offerData.image || '/projects/proj1.jpg',
        startDate: offerData.startDate || new Date().toISOString().split('T')[0],
        endDate: offerData.endDate || '2030-12-31',
        discount: offerData.discount || '',
        ctaText: offerData.ctaText || 'Claim Offer',
        ctaLink: offerData.ctaLink || '/contact',
        isActive: offerData.isActive !== undefined ? offerData.isActive : true,
        createdAt: new Date().toISOString(),
      };
      offers.push(updatedOffer);
    }

    await writeJsonFile(offersPath, offers);

    // Sync to Supabase
    try {
      const discountNumber = parseInt((updatedOffer.discount || '').replace(/\D/g, '')) || 30;
      await supabaseAdmin.from('offers').upsert({
        id: updatedOffer.id,
        title: updatedOffer.title,
        description: updatedOffer.subtitle,
        discount_pct: discountNumber,
        valid_until: updatedOffer.endDate || null,
        is_active: updatedOffer.isActive,
        updated_at: new Date().toISOString(),
      });
    } catch (e: any) {
      console.warn('[Supabase] Warning syncing offer:', e.message);
    }

    revalidatePath('/admin');
    revalidatePath('/');

    return { success: true, offer: updatedOffer, offers };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

export async function deleteOfferServerAction(id: string) {
  try {
    // 1. Delete from Supabase FIRST
    const { error: dbError } = await supabaseAdmin.from('offers').delete().eq('id', id);
    if (dbError) {
      console.error('[Supabase] Error deleting offer from DB:', dbError.message);
      return { success: false, message: `Database delete failed: ${dbError.message}` };
    }

    // 2. Update local fallback JSON
    let offers = await readJsonFile<OfferItem[]>(offersPath, []);
    offers = offers.filter((o) => o.id !== id);
    await writeJsonFile(offersPath, offers);

    try {
      const customerOffersPath = 'c:/Anjina/data/offers.json';
      if (fs.existsSync('c:/Anjina/data')) {
        await writeJsonFile(customerOffersPath, offers);
      }
    } catch {}

    revalidatePath('/admin');
    return { success: true, message: 'Offer deleted permanently from database and admin' };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

// ──────────────── 5. Blogs Server Actions ────────────────

export async function getBlogsServerAction(): Promise<BlogArticle[]> {
  try {
    const { data: dbBlogs, error } = await supabaseAdmin
      .from('blogs')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && dbBlogs && dbBlogs.length > 0) {
      return dbBlogs.map((b: any) => ({
        id: b.id,
        slug: b.slug,
        title: b.title,
        date: b.date || '',
        formattedDate: b.formatted_date || b.date || '',
        excerpt: b.excerpt || '',
        category: b.category || 'Apartment Interior Works',
        image: b.image_url || 'https://images.unsplash.com/photo-1616046229478-9901c5536a45?auto=format&fit=crop&w=1200&q=80',
        readTime: b.read_time || '5 min read',
        author: {
          name: b.author_name || 'Anjani Infra Editorial Team',
          role: b.author_role || 'Lead Interior Architect',
          avatar: b.author_avatar || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
        },
        introParagraphs: Array.isArray(b.intro_paragraphs) ? b.intro_paragraphs : [b.excerpt || ''],
        sections: Array.isArray(b.sections) ? b.sections : [],
        conclusion: b.conclusion || '',
        featured: b.featured ?? false,
      }));
    }
  } catch (e: any) {
    console.warn('[Supabase] Warning reading blogs:', e.message);
  }

  return await readJsonFile<BlogArticle[]>(blogsPath, []);
}

export async function saveBlogServerAction(blogData: Partial<BlogArticle>) {
  try {
    const blogs = await readJsonFile<BlogArticle[]>(blogsPath, []);
    let updatedBlog: BlogArticle;

    const now = new Date();
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const shortMonthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const defaultDate = `${shortMonthNames[now.getMonth()]} ${String(now.getDate()).padStart(2, '0')} ${now.getFullYear()}`;
    const defaultFormattedDate = `${monthNames[now.getMonth()]} ${String(now.getDate()).padStart(2, '0')}, ${now.getFullYear()}`;

    // Generate slug from title if not explicitly provided
    let rawSlug = (blogData.slug || blogData.title || `blog-${Date.now()}`)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    if (!rawSlug) {
      rawSlug = `blog-${Date.now()}`;
    }

    if (blogData.id) {
      const index = blogs.findIndex((b) => b.id === blogData.id);
      if (index === -1) {
        return { success: false, message: 'Blog article not found' };
      }
      updatedBlog = {
        ...blogs[index],
        ...blogData,
        slug: rawSlug,
        author: {
          ...blogs[index].author,
          ...(blogData.author || {}),
        },
        introParagraphs: blogData.introParagraphs || blogs[index].introParagraphs,
        sections: blogData.sections || blogs[index].sections,
      };
      blogs[index] = updatedBlog;
    } else {
      updatedBlog = {
        id: `post-${Date.now()}`,
        slug: rawSlug,
        title: blogData.title || 'Untitled Blog',
        date: blogData.date || defaultDate,
        formattedDate: blogData.formattedDate || defaultFormattedDate,
        excerpt: blogData.excerpt || '',
        category: blogData.category || 'Apartment Interior Works',
        image: blogData.image || 'https://images.unsplash.com/photo-1616046229478-9901c5536a45?auto=format&fit=crop&w=1200&q=80',
        readTime: blogData.readTime || '5 min read',
        author: {
          name: blogData.author?.name || 'Anjani Infra Editorial Team',
          role: blogData.author?.role || 'Lead Interior Architect',
          avatar: blogData.author?.avatar || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
        },
        introParagraphs: blogData.introParagraphs || (blogData.excerpt ? [blogData.excerpt] : []),
        sections: blogData.sections || [],
        conclusion: blogData.conclusion || '',
        featured: blogData.featured ?? false,
      };
      blogs.unshift(updatedBlog);
    }

    await writeJsonFile(blogsPath, blogs);

    // Sync to Supabase
    try {
      await supabaseAdmin.from('blogs').upsert({
        id: updatedBlog.id,
        slug: updatedBlog.slug,
        title: updatedBlog.title,
        date: updatedBlog.date,
        formatted_date: updatedBlog.formattedDate,
        excerpt: updatedBlog.excerpt,
        category: updatedBlog.category,
        image_url: updatedBlog.image,
        read_time: updatedBlog.readTime,
        author_name: updatedBlog.author.name,
        author_role: updatedBlog.author.role,
        author_avatar: updatedBlog.author.avatar,
        intro_paragraphs: updatedBlog.introParagraphs,
        sections: updatedBlog.sections,
        conclusion: updatedBlog.conclusion || null,
        featured: updatedBlog.featured,
        updated_at: new Date().toISOString(),
      });
    } catch (e: any) {
      console.warn('[Supabase] Warning syncing blog:', e.message);
    }

    revalidatePath('/admin');
    revalidatePath('/');
    revalidatePath('/blogs');
    revalidatePath(`/blogs/${updatedBlog.slug}`);

    return { success: true, blog: updatedBlog, blogs };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

export async function deleteBlogServerAction(id: string) {
  try {
    // 1. Delete from Supabase FIRST
    const { error: dbError } = await supabaseAdmin.from('blogs').delete().eq('id', id);
    if (dbError) {
      console.error('[Supabase] Error deleting blog from DB:', dbError.message);
      return { success: false, message: `Database delete failed: ${dbError.message}` };
    }

    // 2. Update local fallback JSON
    let blogs = await readJsonFile<BlogArticle[]>(blogsPath, []);
    const target = blogs.find((b) => b.id === id);
    blogs = blogs.filter((b) => b.id !== id);
    await writeJsonFile(blogsPath, blogs);

    try {
      const customerBlogsPath = 'c:/Anjina/data/blogs.json';
      if (fs.existsSync('c:/Anjina/data')) {
        await writeJsonFile(customerBlogsPath, blogs);
      }
    } catch {}

    revalidatePath('/admin');
    revalidatePath('/');
    revalidatePath('/blogs');
    if (target?.slug) {
      revalidatePath(`/blogs/${target.slug}`);
    }

    return { success: true, message: 'Blog article deleted permanently from database and admin' };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

// ──────────────── 6. Testimonials Server Actions ────────────────

export async function getTestimonialsServerAction(): Promise<TestimonialItem[]> {
  try {
    const { data: dbTestimonials, error } = await supabaseAdmin
      .from('testimonials')
      .select('*')
      .order('display_order', { ascending: true });

    if (!error && dbTestimonials && dbTestimonials.length > 0) {
      return dbTestimonials.map((t: any) => ({
        id: t.id,
        name: t.name,
        location: t.location || '',
        text: t.text,
        image: t.image_url || '/testimonial-client-3.jpg',
        rating: t.rating ?? 5,
        isActive: t.is_active ?? true,
        displayOrder: t.display_order ?? 1,
        createdAt: t.created_at,
        updatedAt: t.updated_at,
      }));
    }
  } catch (e: any) {
    console.warn('[Supabase] Warning reading testimonials:', e.message);
  }

  return await readJsonFile<TestimonialItem[]>(testimonialsPath, []);
}

export async function saveTestimonialServerAction(testimonialData: Partial<TestimonialItem>) {
  try {
    const testimonials = await readJsonFile<TestimonialItem[]>(testimonialsPath, []);
    let updatedTestimonial: TestimonialItem;

    if (testimonialData.id) {
      const index = testimonials.findIndex((t) => t.id === testimonialData.id);
      if (index === -1) {
        return { success: false, message: 'Testimonial not found' };
      }
      updatedTestimonial = {
        ...testimonials[index],
        ...testimonialData,
        updatedAt: new Date().toISOString(),
      };
      testimonials[index] = updatedTestimonial;
    } else {
      updatedTestimonial = {
        id: `testim-${Date.now()}`,
        name: testimonialData.name || 'Anonymous Customer',
        location: testimonialData.location || 'Hyderabad',
        text: testimonialData.text || '',
        image: testimonialData.image || '/testimonial-client-3.jpg',
        rating: testimonialData.rating ?? 5,
        isActive: testimonialData.isActive !== undefined ? testimonialData.isActive : true,
        displayOrder: testimonialData.displayOrder ?? testimonials.length + 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      testimonials.push(updatedTestimonial);
    }

    await writeJsonFile(testimonialsPath, testimonials);

    // Sync to Supabase
    try {
      await supabaseAdmin.from('testimonials').upsert({
        id: updatedTestimonial.id,
        name: updatedTestimonial.name,
        location: updatedTestimonial.location,
        text: updatedTestimonial.text,
        image_url: updatedTestimonial.image,
        rating: updatedTestimonial.rating,
        is_active: updatedTestimonial.isActive,
        display_order: updatedTestimonial.displayOrder,
        updated_at: new Date().toISOString(),
      });
    } catch (e: any) {
      console.warn('[Supabase] Warning syncing testimonial:', e.message);
    }

    revalidatePath('/admin');
    revalidatePath('/');

    return { success: true, testimonial: updatedTestimonial, testimonials };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

export async function deleteTestimonialServerAction(id: string) {
  try {
    // 1. Delete from Supabase FIRST
    const { error: dbError } = await supabaseAdmin.from('testimonials').delete().eq('id', id);
    if (dbError) {
      console.error('[Supabase] Error deleting testimonial from DB:', dbError.message);
      return { success: false, message: `Database delete failed: ${dbError.message}` };
    }

    // 2. Update local fallback JSON
    let testimonials = await readJsonFile<TestimonialItem[]>(testimonialsPath, []);
    testimonials = testimonials.filter((t) => t.id !== id);
    await writeJsonFile(testimonialsPath, testimonials);

    try {
      const customerTestimonialsPath = 'c:/Anjina/data/testimonials.json';
      if (fs.existsSync('c:/Anjina/data')) {
        await writeJsonFile(customerTestimonialsPath, testimonials);
      }
    } catch {}

    revalidatePath('/admin');
    revalidatePath('/');

    return { success: true, message: 'Testimonial deleted permanently from database and admin' };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

// ──────────────── 7. Video Showcase Server Actions ────────────────

export async function getVideoShowcaseServerAction(): Promise<VideoShowcaseItem> {
  const fallback: VideoShowcaseItem = {
    id: 'video-showcase-main',
    title: 'Luxury Home Interior Walkthrough & Factory Tour',
    subtitle: 'Anjani Infra Hyderabad • Direct Video Showcase',
    badgeText: 'Plays Directly Here (No New Tabs)',
    videoType: 'youtube',
    videoUrl: 'https://www.youtube.com/watch?v=1rKdfAkygIs',
    embedUrl: 'https://www.youtube-nocookie.com/embed/1rKdfAkygIs?rel=0&modestbranding=1&playsinline=1',
    directVideoUrl: '',
    posterImage: '/projects/proj1.jpg',
    isActive: true,
  };

  try {
    const { data: dbVideo, error } = await supabaseAdmin
      .from('video_showcase')
      .select('*')
      .eq('id', 'video-showcase-main')
      .single();

    if (!error && dbVideo) {
      return {
        id: dbVideo.id,
        title: dbVideo.title,
        subtitle: dbVideo.subtitle,
        badgeText: dbVideo.badge_text || 'Plays Directly Here (No New Tabs)',
        videoType: dbVideo.video_type || 'youtube',
        videoUrl: dbVideo.video_url || '',
        embedUrl: dbVideo.embed_url || extractYouTubeEmbedUrl(dbVideo.video_url || ''),
        directVideoUrl: dbVideo.direct_video_url || '',
        posterImage: dbVideo.poster_image || '/projects/proj1.jpg',
        isActive: dbVideo.is_active ?? true,
        updatedAt: dbVideo.updated_at,
      };
    }
  } catch (e: any) {
    console.warn('[Supabase] Warning reading video showcase:', e.message);
  }

  return await readJsonFile<VideoShowcaseItem>(videoPath, fallback);
}

export async function saveVideoShowcaseServerAction(data: Partial<VideoShowcaseItem>) {
  try {
    const current = await getVideoShowcaseServerAction();

    let computedEmbed = data.embedUrl || current.embedUrl;
    if (data.videoUrl) {
      computedEmbed = extractYouTubeEmbedUrl(data.videoUrl);
    }

    const updated: VideoShowcaseItem = {
      ...current,
      ...data,
      embedUrl: computedEmbed,
      updatedAt: new Date().toISOString(),
    };

    await writeJsonFile(videoPath, updated);

    // Sync to Supabase
    try {
      await supabaseAdmin.from('video_showcase').upsert({
        id: 'video-showcase-main',
        title: updated.title,
        subtitle: updated.subtitle,
        badge_text: updated.badgeText,
        video_type: updated.videoType,
        video_url: updated.videoUrl,
        embed_url: updated.embedUrl,
        direct_video_url: updated.directVideoUrl || null,
        poster_image: updated.posterImage || null,
        is_active: updated.isActive,
        updated_at: updated.updatedAt,
      });
    } catch (e: any) {
      console.warn('[Supabase] Warning syncing video showcase:', e.message);
    }

    revalidatePath('/admin');
    revalidatePath('/');

    return { success: true, video: updated };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}
