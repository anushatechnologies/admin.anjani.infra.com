'use client';

import React, { useState, useEffect, useRef, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Upload,
  Image as ImageIcon,
  Calendar,
  Layers,
  Plus,
  Trash2,
  Edit2,
  Copy,
  Check,
  ExternalLink,
  Eye,
  RefreshCw,
  FolderKanban,
  Search,
  CheckCircle2,
  AlertTriangle,
  BookOpen,
  MessageSquareQuote,
  Star,
  Video,
  Music,
  Play,
  Film,
  X,
  LogOut
} from 'lucide-react';
import {
  BannerItem,
  MediaFile,
  ProjectItem,
  OfferItem,
  TestimonialItem,
  VideoShowcaseItem,
  getBannersServerAction,
  saveBannerServerAction,
  deleteBannerServerAction,
  getMediaFilesServerAction,
  uploadImageServerAction,
  deleteMediaServerAction,
  getProjectsServerAction,
  saveProjectServerAction,
  deleteProjectServerAction,
  getOffersServerAction,
  saveOfferServerAction,
  deleteOfferServerAction,
  getBlogsServerAction,
  saveBlogServerAction,
  deleteBlogServerAction,
  getTestimonialsServerAction,
  saveTestimonialServerAction,
  deleteTestimonialServerAction,
  getVideoShowcaseServerAction,
  saveVideoShowcaseServerAction
} from './actions';
import { extractYouTubeEmbedUrl } from '@/lib/youtube';
import { BlogArticle, BLOG_CATEGORIES } from '@/data/blogs';
import { logoutAdminServerAction } from '@/lib/auth';

export default function AdminPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'banners' | 'media' | 'offers' | 'blogs' | 'testimonials' | 'video'>('banners');
  const [isPending, startTransition] = useTransition();

  // Banners State
  const [banners, setBanners] = useState<BannerItem[]>([]);
  const [loadingBanners, setLoadingBanners] = useState(false);
  const [bannerModalOpen, setBannerModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<BannerItem | null>(null);
  const [bannerForm, setBannerForm] = useState({
    title: '',
    tagline: '',
    subtitle: '',
    image: '',
    link: '/customized-interiors',
    buttonText: 'Explore More',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '2027-12-31',
    isActive: true,
    priority: 1,
    placement: 'hero'
  });

  // Media Library State
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [loadingMedia, setLoadingMedia] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [mediaSearch, setMediaSearch] = useState('');
  const [mediaTypeFilter, setMediaTypeFilter] = useState<'all' | 'images' | 'audio-video'>('all');
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  // Projects State
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [projectModalOpen, setProjectModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<ProjectItem | null>(null);
  const [projectForm, setProjectForm] = useState({
    name: '',
    location: 'Hyderabad, Telangana',
    type: 'Interior Fitout',
    area: '2,500 Sq.Ft.',
    category: 'Interior Fitout',
    featured: true,
    image: '',
    client: '',
    year: new Date().getFullYear().toString(),
    startDate: new Date().toISOString().split('T')[0],
    completionDate: '',
    description: '',
    specs: '',
    galleryText: ''
  });

  // Offers State
  const [offers, setOffers] = useState<OfferItem[]>([]);
  const [loadingOffers, setLoadingOffers] = useState(false);
  const [offerModalOpen, setOfferModalOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState<OfferItem | null>(null);
  const [offerForm, setOfferForm] = useState({
    title: '',
    subtitle: '',
    badge: 'LIMITED TIME OFFER',
    image: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '2027-12-31',
    discount: '15% OFF',
    ctaText: 'Claim Offer',
    ctaLink: '/contact',
    isActive: true
  });

  // Blogs State
  const [blogs, setBlogs] = useState<BlogArticle[]>([]);
  const [loadingBlogs, setLoadingBlogs] = useState(false);
  const [blogModalOpen, setBlogModalOpen] = useState(false);
  const [editingBlog, setEditingBlog] = useState<BlogArticle | null>(null);
  const [blogSearch, setBlogSearch] = useState('');
  const [blogCategoryFilter, setBlogCategoryFilter] = useState('ALL');
  const [blogForm, setBlogForm] = useState({
    title: '',
    slug: '',
    category: 'Apartment Interior Works',
    excerpt: '',
    image: '',
    readTime: '6 min read',
    authorName: 'Anjani Infra Editorial Team',
    authorRole: 'Principal Interior Architect',
    authorAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
    featured: true,
    bodyContent: ''
  });

  // Testimonials State (14000+ Satisfied Customers)
  const [testimonials, setTestimonials] = useState<TestimonialItem[]>([]);
  const [loadingTestimonials, setLoadingTestimonials] = useState(false);
  const [testimonialModalOpen, setTestimonialModalOpen] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState<TestimonialItem | null>(null);
  const [testimonialSearch, setTestimonialSearch] = useState('');
  const [testimonialForm, setTestimonialForm] = useState({
    name: '',
    location: 'Hyderabad',
    text: '',
    image: '/testimonial-client-3.jpg',
    rating: 5,
    isActive: true,
    displayOrder: 1
  });

  // Video Showcase State
  const [videoData, setVideoData] = useState<VideoShowcaseItem>({
    id: 'video-showcase-main',
    title: 'Luxury Home Interior Walkthrough & Factory Tour',
    subtitle: 'Anjani Infra Hyderabad • Direct Video Showcase',
    badgeText: 'Plays Directly Here (No New Tabs)',
    videoType: 'youtube',
    videoUrl: 'https://www.youtube.com/watch?v=1rKdfAkygIs',
    embedUrl: 'https://www.youtube-nocookie.com/embed/1rKdfAkygIs?rel=0&modestbranding=1&playsinline=1',
    directVideoUrl: '',
    posterImage: '/projects/proj1.jpg',
    isActive: true
  });
  const [loadingVideo, setLoadingVideo] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const videoFileInputRef = useRef<HTMLInputElement>(null);
  const posterImageInputRef = useRef<HTMLInputElement>(null);

  // Toast
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const bannerImageInputRef = useRef<HTMLInputElement>(null);
  const projectImageInputRef = useRef<HTMLInputElement>(null);
  const offerImageInputRef = useRef<HTMLInputElement>(null);
  const blogImageInputRef = useRef<HTMLInputElement>(null);
  const testimonialImageInputRef = useRef<HTMLInputElement>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Initial Data Load via Server Actions
  useEffect(() => {
    refreshAllData();
  }, []);

  const refreshAllData = () => {
    startTransition(async () => {
      setLoadingBanners(true);
      setLoadingMedia(true);
      setLoadingProjects(true);
      setLoadingOffers(true);
      setLoadingBlogs(true);
      setLoadingTestimonials(true);
      setLoadingVideo(true);

      try {
        const [loadedBanners, loadedMedia, loadedProjects, loadedOffers, loadedBlogs, loadedTestimonials, loadedVideo] = await Promise.all([
          getBannersServerAction(),
          getMediaFilesServerAction(),
          getProjectsServerAction(),
          getOffersServerAction(),
          getBlogsServerAction(),
          getTestimonialsServerAction(),
          getVideoShowcaseServerAction()
        ]);

        setBanners(loadedBanners);
        setMediaFiles(loadedMedia);
        setProjects(loadedProjects);
        setOffers(loadedOffers);
        setBlogs(loadedBlogs);
        setTestimonials(loadedTestimonials);
        setVideoData(loadedVideo);
      } catch (err: any) {
        showToast('Error loading data: ' + err.message, 'error');
      } finally {
        setLoadingBanners(false);
        setLoadingMedia(false);
        setLoadingProjects(false);
        setLoadingOffers(false);
        setLoadingBlogs(false);
        setLoadingTestimonials(false);
        setLoadingVideo(false);
      }
    });
  };

  // ──────────────── Server Action Upload ────────────────
  const handleServerUpload = async (file: File): Promise<string | null> => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const result = await uploadImageServerAction(formData);
      if (result.success && result.url) {
        showToast(`Uploaded "${file.name}" via Next.js Server Action!`);
        // Refresh media list
        const updatedMedia = await getMediaFilesServerAction();
        setMediaFiles(updatedMedia);
        return result.url;
      } else {
        showToast(result.message || 'Upload failed', 'error');
        return null;
      }
    } catch (err: any) {
      showToast(err.message || 'Server upload error', 'error');
      return null;
    }
  };

  const handleMediaFilesSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setUploading(true);
    const files = Array.from(e.target.files);
    let successCount = 0;

    for (const file of files) {
      const url = await handleServerUpload(file);
      if (url) successCount++;
    }

    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
    showToast(`${successCount} image(s) processed by Next.js Server Action`);
  };

  const handleDeleteMedia = async (filename: string, fileUrl?: string) => {
    if (!confirm(`Delete image "${filename}"?`)) return;
    startTransition(async () => {
      const res = await deleteMediaServerAction(filename, fileUrl);
      if (res.success) {
        showToast('Image deleted');
        const updatedMedia = await getMediaFilesServerAction();
        setMediaFiles(updatedMedia);
      } else {
        showToast(res.message || 'Delete failed', 'error');
      }
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedUrl(text);
    showToast('Image URL copied to clipboard!');
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  // ──────────────── Banner Actions ────────────────
  const handleOpenAddBanner = () => {
    setEditingBanner(null);
    setBannerForm({
      title: '',
      tagline: '',
      subtitle: '',
      image: '',
      link: '/customized-interiors',
      buttonText: 'Explore More',
      startDate: new Date().toISOString().split('T')[0],
      endDate: '2027-12-31',
      isActive: true,
      priority: banners.length + 1,
      placement: 'hero'
    });
    setBannerModalOpen(true);
  };

  const handleOpenEditBanner = (b: BannerItem) => {
    setEditingBanner(b);
    setBannerForm({
      title: b.title,
      tagline: b.tagline || '',
      subtitle: b.subtitle || '',
      image: b.image,
      link: b.link || '/customized-interiors',
      buttonText: b.buttonText || 'Explore More',
      startDate: b.startDate || new Date().toISOString().split('T')[0],
      endDate: b.endDate || '2027-12-31',
      isActive: b.isActive,
      priority: b.priority || 1,
      placement: b.placement || 'hero'
    });
    setBannerModalOpen(true);
  };

  const handleSaveBanner = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bannerForm.title || !bannerForm.image) {
      showToast('Title and Image are required', 'error');
      return;
    }

    startTransition(async () => {
      const payload = editingBanner ? { ...bannerForm, id: editingBanner.id } : bannerForm;
      const res = await saveBannerServerAction(payload);
      if (res.success) {
        showToast(editingBanner ? 'Banner updated via Next.js Server Action!' : 'Banner published!');
        setBannerModalOpen(false);
        const updated = await getBannersServerAction();
        setBanners(updated);
      } else {
        showToast(res.message || 'Failed to save', 'error');
      }
    });
  };

  const handleDeleteBanner = (id: string) => {
    if (!confirm('Are you sure you want to delete this banner?')) return;
    startTransition(async () => {
      const res = await deleteBannerServerAction(id);
      if (res.success) {
        showToast('Banner deleted');
        const updated = await getBannersServerAction();
        setBanners(updated);
      } else {
        showToast(res.message || 'Delete failed', 'error');
      }
    });
  };

  // ──────────────── Project Actions ────────────────
  const handleOpenAddProject = () => {
    setEditingProject(null);
    setProjectForm({
      name: '',
      location: 'Hyderabad, Telangana',
      type: 'Luxury Interior Fitout',
      area: '2,500 Sq.Ft.',
      category: 'Interior Fitout',
      featured: true,
      image: '',
      client: '',
      year: new Date().getFullYear().toString(),
      startDate: new Date().toISOString().split('T')[0],
      completionDate: '',
      description: '',
      specs: 'Post-Tensioned Slabs\nModular Joinery\nItalian Marble',
      galleryText: ''
    });
    setProjectModalOpen(true);
  };

  const handleOpenEditProject = (p: ProjectItem) => {
    setEditingProject(p);
    setProjectForm({
      name: p.name,
      location: p.location,
      type: p.type,
      area: p.area,
      category: p.category,
      featured: p.featured,
      image: p.image,
      client: p.client,
      year: p.year,
      startDate: p.startDate || '',
      completionDate: p.completionDate || '',
      description: p.description,
      specs: (p.specs || []).join('\n'),
      galleryText: (p.gallery || []).join('\n')
    });
    setProjectModalOpen(true);
  };

  const handleSaveProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectForm.name || !projectForm.image) {
      showToast('Project name and image required', 'error');
      return;
    }

    startTransition(async () => {
      const payload: Partial<ProjectItem> = {
        ...(editingProject ? { id: editingProject.id } : {}),
        name: projectForm.name,
        location: projectForm.location,
        type: projectForm.type,
        area: projectForm.area,
        category: projectForm.category,
        featured: projectForm.featured,
        image: projectForm.image,
        client: projectForm.client,
        year: projectForm.year,
        startDate: projectForm.startDate,
        completionDate: projectForm.completionDate,
        description: projectForm.description,
        specs: projectForm.specs.split('\n').map(s => s.trim()).filter(Boolean),
        gallery: projectForm.galleryText.split('\n').map(s => s.trim()).filter(Boolean)
      };

      const res = await saveProjectServerAction(payload);
      if (res.success) {
        showToast(editingProject ? 'Project updated via Server Action!' : 'Project added!');
        setProjectModalOpen(false);
        const updated = await getProjectsServerAction();
        setProjects(updated);
      } else {
        showToast(res.message || 'Save failed', 'error');
      }
    });
  };

  const handleDeleteProject = (id: string | number) => {
    if (!confirm('Are you sure you want to delete this project?')) return;
    startTransition(async () => {
      const res = await deleteProjectServerAction(id);
      if (res.success) {
        showToast('Project deleted');
        const updated = await getProjectsServerAction();
        setProjects(updated);
      } else {
        showToast(res.message || 'Delete failed', 'error');
      }
    });
  };

  // ──────────────── Offer Actions ────────────────
  const handleOpenAddOffer = () => {
    setEditingOffer(null);
    setOfferForm({
      title: '',
      subtitle: '',
      badge: 'LIMITED TIME OFFER',
      image: '',
      startDate: new Date().toISOString().split('T')[0],
      endDate: '2027-12-31',
      discount: '15% OFF',
      ctaText: 'Claim Offer',
      ctaLink: '/contact',
      isActive: true
    });
    setOfferModalOpen(true);
  };

  const handleOpenEditOffer = (o: OfferItem) => {
    setEditingOffer(o);
    setOfferForm({
      title: o.title,
      subtitle: o.subtitle,
      badge: o.badge,
      image: o.image,
      startDate: o.startDate,
      endDate: o.endDate,
      discount: o.discount,
      ctaText: o.ctaText,
      ctaLink: o.ctaLink,
      isActive: o.isActive
    });
    setOfferModalOpen(true);
  };

  const handleSaveOffer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!offerForm.title || !offerForm.image) {
      showToast('Offer title and image required', 'error');
      return;
    }

    startTransition(async () => {
      const payload = editingOffer ? { ...offerForm, id: editingOffer.id } : offerForm;
      const res = await saveOfferServerAction(payload);
      if (res.success) {
        showToast(editingOffer ? 'Campaign updated via Server Action!' : 'Campaign created!');
        setOfferModalOpen(false);
        const updated = await getOffersServerAction();
        setOffers(updated);
      } else {
        showToast(res.message || 'Save failed', 'error');
      }
    });
  };

  const handleDeleteOffer = (id: string) => {
    if (!confirm('Delete this promotional campaign?')) return;
    startTransition(async () => {
      const res = await deleteOfferServerAction(id);
      if (res.success) {
        showToast('Campaign deleted');
        const updated = await getOffersServerAction();
        setOffers(updated);
      } else {
        showToast(res.message || 'Delete failed', 'error');
      }
    });
  };

  // ──────────────── Blog Actions ────────────────
  const handleOpenAddBlog = () => {
    setEditingBlog(null);
    setBlogForm({
      title: '',
      slug: '',
      category: 'Apartment Interior Works',
      excerpt: '',
      image: '',
      readTime: '6 min read',
      authorName: 'Anjani Infra Editorial Team',
      authorRole: 'Principal Interior Architect',
      authorAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
      featured: true,
      bodyContent: ''
    });
    setBlogModalOpen(true);
  };

  const handleOpenEditBlog = (b: BlogArticle) => {
    setEditingBlog(b);
    let text = '';
    if (b.introParagraphs && b.introParagraphs.length > 0) {
      text += b.introParagraphs.join('\n\n') + '\n\n';
    }
    if (b.sections) {
      b.sections.forEach(s => {
        if (s.heading) text += `## ${s.heading}\n\n`;
        if (s.paragraphs) text += s.paragraphs.join('\n\n') + '\n\n';
        if (s.bulletPoints) {
          s.bulletPoints.forEach(bp => (text += `• ${bp}\n`));
          text += '\n';
        }
      });
    }
    if (b.conclusion) {
      text += `## Conclusion\n\n${b.conclusion}`;
    }

    setBlogForm({
      title: b.title,
      slug: b.slug,
      category: b.category,
      excerpt: b.excerpt,
      image: b.image,
      readTime: b.readTime,
      authorName: b.author?.name || 'Anjani Infra Editorial Team',
      authorRole: b.author?.role || 'Principal Interior Architect',
      authorAvatar: b.author?.avatar || '',
      featured: Boolean(b.featured),
      bodyContent: text.trim()
    });
    setBlogModalOpen(true);
  };

  const handleSaveBlog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!blogForm.title || !blogForm.image) {
      showToast('Title and Cover Image are required for blog', 'error');
      return;
    }

    startTransition(async () => {
      const paragraphs = blogForm.bodyContent
        .split(/\n\n+/)
        .map(p => p.trim())
        .filter(Boolean);

      const introParagraphs = paragraphs.length > 0 ? [paragraphs[0]] : [blogForm.excerpt || blogForm.title];
      const remainingParagraphs = paragraphs.slice(1);

      const sections: any[] = [];
      let currentHeading = 'Overview & Architectural Insights';
      let currentPars: string[] = [];
      let currentBullets: string[] = [];

      for (const p of remainingParagraphs) {
        if (p.startsWith('## ')) {
          if (currentPars.length > 0 || currentBullets.length > 0) {
            sections.push({
              heading: currentHeading,
              paragraphs: currentPars,
              bulletPoints: currentBullets.length > 0 ? currentBullets : undefined
            });
            currentPars = [];
            currentBullets = [];
          }
          currentHeading = p.replace(/^##\s+/, '');
        } else if (p.startsWith('• ') || p.startsWith('- ')) {
          const lines = p.split('\n');
          for (const l of lines) {
            if (l.trim().startsWith('• ') || l.trim().startsWith('- ')) {
              currentBullets.push(l.trim().replace(/^[•-]\s+/, ''));
            } else {
              currentPars.push(l.trim());
            }
          }
        } else {
          currentPars.push(p);
        }
      }

      if (currentPars.length > 0 || currentBullets.length > 0) {
        sections.push({
          heading: currentHeading,
          paragraphs: currentPars,
          bulletPoints: currentBullets.length > 0 ? currentBullets : undefined
        });
      }

      const payload: Partial<BlogArticle> = {
        id: editingBlog ? editingBlog.id : undefined,
        title: blogForm.title,
        slug: blogForm.slug || undefined,
        category: blogForm.category,
        excerpt: blogForm.excerpt || (paragraphs[0] ? paragraphs[0].slice(0, 160) + '...' : ''),
        image: blogForm.image,
        readTime: blogForm.readTime || '5 min read',
        author: {
          name: blogForm.authorName || 'Anjani Infra Editorial Team',
          role: blogForm.authorRole || 'Lead Interior Architect',
          avatar: blogForm.authorAvatar || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80'
        },
        featured: blogForm.featured,
        introParagraphs,
        sections: sections.length > 0 ? sections : [
          {
            heading: 'Key Takeaways',
            paragraphs: paragraphs.length > 1 ? paragraphs.slice(1) : [blogForm.excerpt || blogForm.title]
          }
        ]
      };

      const res = await saveBlogServerAction(payload);
      if (res.success) {
        showToast(editingBlog ? 'Blog article updated successfully!' : 'New blog article published!');
        setBlogModalOpen(false);
        const updated = await getBlogsServerAction();
        setBlogs(updated);
      } else {
        showToast(res.message || 'Failed to save blog', 'error');
      }
    });
  };

  const handleDeleteBlog = (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete the blog "${title}"?`)) return;
    startTransition(async () => {
      const res = await deleteBlogServerAction(id);
      if (res.success) {
        showToast('Blog article deleted');
        const updated = await getBlogsServerAction();
        setBlogs(updated);
      } else {
        showToast(res.message || 'Failed to delete blog', 'error');
      }
    });
  };

  // ──────────────── Testimonial Actions ────────────────
  const handleOpenAddTestimonial = () => {
    setEditingTestimonial(null);
    setTestimonialForm({
      name: '',
      location: 'Hyderabad',
      text: '',
      image: '/testimonial-client-3.jpg',
      rating: 5,
      isActive: true,
      displayOrder: testimonials.length + 1
    });
    setTestimonialModalOpen(true);
  };

  const handleOpenEditTestimonial = (t: TestimonialItem) => {
    setEditingTestimonial(t);
    setTestimonialForm({
      name: t.name,
      location: t.location || 'Hyderabad',
      text: t.text,
      image: t.image,
      rating: t.rating ?? 5,
      isActive: t.isActive !== false,
      displayOrder: t.displayOrder ?? 1
    });
    setTestimonialModalOpen(true);
  };

  const handleSaveTestimonial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!testimonialForm.name || !testimonialForm.text) {
      showToast('Client Name and Review Quote are required', 'error');
      return;
    }

    startTransition(async () => {
      const payload: Partial<TestimonialItem> = {
        id: editingTestimonial ? editingTestimonial.id : undefined,
        name: testimonialForm.name,
        location: testimonialForm.location,
        text: testimonialForm.text,
        image: testimonialForm.image || '/testimonial-client-3.jpg',
        rating: testimonialForm.rating,
        isActive: testimonialForm.isActive,
        displayOrder: testimonialForm.displayOrder
      };

      const res = await saveTestimonialServerAction(payload);
      if (res.success) {
        showToast(editingTestimonial ? 'Customer testimonial updated!' : 'New testimonial published to homepage!');
        setTestimonialModalOpen(false);
        const updated = await getTestimonialsServerAction();
        setTestimonials(updated);
      } else {
        showToast(res.message || 'Failed to save testimonial', 'error');
      }
    });
  };

  const handleDeleteTestimonial = (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete the testimonial from "${name}"?`)) return;
    startTransition(async () => {
      const res = await deleteTestimonialServerAction(id);
      if (res.success) {
        showToast('Testimonial deleted');
        const updated = await getTestimonialsServerAction();
        setTestimonials(updated);
      } else {
        showToast(res.message || 'Failed to delete testimonial', 'error');
      }
    });
  };

  // ──────────────── Video Showcase Actions ────────────────
  const handleSaveVideo = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const res = await saveVideoShowcaseServerAction(videoData);
      if (res.success && res.video) {
        setVideoData(res.video);
        showToast('Homepage Video Showcase updated successfully!');
      } else {
        showToast(res.message || 'Failed to update video', 'error');
      }
    });
  };

  const handleLogout = () => {
    startTransition(async () => {
      await logoutAdminServerAction();
      router.push('/login');
      router.refresh();
    });
  };

  const isAudioFile = (filename: string, url: string) => {
    const lower = (filename + ' ' + url).toLowerCase();
    return lower.includes('audio') || /\.(mp3|wav|aac|m4a|ogg)(\?.*)?$/i.test(lower);
  };

  const isVideoFile = (filename: string, url: string) => {
    const lower = (filename + ' ' + url).toLowerCase();
    return !isAudioFile(filename, url) && /\.(mp4|webm|mov|m4v|mkv)(\?.*)?$/i.test(lower);
  };

  const isImageFile = (filename: string, url: string) => {
    return !isAudioFile(filename, url) && !isVideoFile(filename, url);
  };

  const filteredMedia = mediaFiles.filter(f => {
    const matchesSearch = f.name.toLowerCase().includes(mediaSearch.toLowerCase());
    if (!matchesSearch) return false;
    if (mediaTypeFilter === 'images') return isImageFile(f.name, f.url);
    if (mediaTypeFilter === 'audio-video') return isAudioFile(f.name, f.url) || isVideoFile(f.name, f.url);
    return true;
  });

  const filteredBlogs = blogs.filter(b => {
    const matchesSearch =
      blogSearch === '' ||
      b.title.toLowerCase().includes(blogSearch.toLowerCase()) ||
      b.excerpt.toLowerCase().includes(blogSearch.toLowerCase()) ||
      b.category.toLowerCase().includes(blogSearch.toLowerCase());
    const matchesCat =
      blogCategoryFilter === 'ALL' ||
      b.category.toLowerCase() === blogCategoryFilter.toLowerCase();
    return matchesSearch && matchesCat;
  });

  const filteredTestimonials = testimonials.filter(t =>
    testimonialSearch === '' ||
    t.name.toLowerCase().includes(testimonialSearch.toLowerCase()) ||
    t.location.toLowerCase().includes(testimonialSearch.toLowerCase()) ||
    t.text.toLowerCase().includes(testimonialSearch.toLowerCase())
  );

  return (
    <div className="h-screen w-screen flex bg-[#0b1219] text-slate-100 font-sans overflow-hidden">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-[10000] px-5 py-3 rounded-lg shadow-2xl flex items-center gap-3 text-sm font-medium transition-all transform animate-bounce ${
            toast.type === 'success'
              ? 'bg-emerald-600 text-white border border-emerald-400'
              : 'bg-rose-600 text-white border border-rose-400'
          }`}
        >
          {toast.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 shrink-0" />
          ) : (
            <AlertTriangle className="w-5 h-5 shrink-0" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* ──────────────── LEFT SIDEBAR ──────────────── */}
      <aside className="w-64 lg:w-72 bg-[#101b26] border-r border-slate-800 flex flex-col shrink-0 h-full overflow-hidden z-30 select-none">
        {/* Brand / Logo Section */}
        <div className="p-4 lg:p-5 border-b border-slate-800/80 flex items-center gap-3 shrink-0 bg-[#101b26]">
          <div className="w-10 h-10 rounded-lg bg-white/10 p-1 flex items-center justify-center border border-white/20 shadow shrink-0">
            <img src="/anjani-logo.png" alt="Anjani Logo" className="h-full w-auto object-contain" />
          </div>
          <div className="min-w-0">
            <h1 className="text-base font-bold tracking-wide text-white truncate">ANJANI ADMIN</h1>
            <p className="text-[11px] text-slate-400 truncate">Interior Management Portal</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex-1 py-4 px-3 space-y-1.5 overflow-y-auto">
          <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Management Tabs
          </div>

          <button
            onClick={() => setActiveTab('banners')}
            className={`w-full flex items-center justify-between px-3.5 py-3 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer ${
              activeTab === 'banners'
                ? 'bg-[#C5A059]/20 text-[#E5C178] border border-[#C5A059]/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent'
            }`}
          >
            <div className="flex items-center gap-3 min-w-0 truncate">
              <Layers className={`w-4 h-4 shrink-0 ${activeTab === 'banners' ? 'text-[#C5A059]' : 'text-slate-400'}`} />
              <span className="truncate">Banners &amp; Sliders</span>
            </div>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
              activeTab === 'banners' ? 'bg-[#C5A059] text-[#101b26]' : 'bg-slate-800 text-slate-400'
            }`}>
              {banners.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('media')}
            className={`w-full flex items-center justify-between px-3.5 py-3 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer ${
              activeTab === 'media'
                ? 'bg-[#C5A059]/20 text-[#E5C178] border border-[#C5A059]/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent'
            }`}
          >
            <div className="flex items-center gap-3 min-w-0 truncate">
              <Upload className={`w-4 h-4 shrink-0 ${activeTab === 'media' ? 'text-[#C5A059]' : 'text-slate-400'}`} />
              <span className="truncate">Image &amp; Media</span>
            </div>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
              activeTab === 'media' ? 'bg-[#C5A059] text-[#101b26]' : 'bg-slate-800 text-slate-400'
            }`}>
              {mediaFiles.length}
            </span>
          </button>



          <button
            onClick={() => setActiveTab('offers')}
            className={`w-full flex items-center justify-between px-3.5 py-3 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer ${
              activeTab === 'offers'
                ? 'bg-[#C5A059]/20 text-[#E5C178] border border-[#C5A059]/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent'
            }`}
          >
            <div className="flex items-center gap-3 min-w-0 truncate">
              <Calendar className={`w-4 h-4 shrink-0 ${activeTab === 'offers' ? 'text-[#C5A059]' : 'text-slate-400'}`} />
              <span className="truncate">Promos &amp; Offers</span>
            </div>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
              activeTab === 'offers' ? 'bg-[#C5A059] text-[#101b26]' : 'bg-slate-800 text-slate-400'
            }`}>
              {offers.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('blogs')}
            className={`w-full flex items-center justify-between px-3.5 py-3 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer ${
              activeTab === 'blogs'
                ? 'bg-[#C5A059]/20 text-[#E5C178] border border-[#C5A059]/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent'
            }`}
          >
            <div className="flex items-center gap-3 min-w-0 truncate">
              <BookOpen className={`w-4 h-4 shrink-0 ${activeTab === 'blogs' ? 'text-[#C5A059]' : 'text-slate-400'}`} />
              <span className="truncate">Blogs &amp; Articles</span>
            </div>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
              activeTab === 'blogs' ? 'bg-[#C5A059] text-[#101b26]' : 'bg-slate-800 text-slate-400'
            }`}>
              {blogs.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('testimonials')}
            className={`w-full flex items-center justify-between px-3.5 py-3 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer ${
              activeTab === 'testimonials'
                ? 'bg-[#C5A059]/20 text-[#E5C178] border border-[#C5A059]/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent'
            }`}
          >
            <div className="flex items-center gap-3 min-w-0 truncate">
              <MessageSquareQuote className={`w-4 h-4 shrink-0 ${activeTab === 'testimonials' ? 'text-[#C5A059]' : 'text-slate-400'}`} />
              <span className="truncate">14k+ Reviews</span>
            </div>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
              activeTab === 'testimonials' ? 'bg-[#C5A059] text-[#101b26]' : 'bg-slate-800 text-slate-400'
            }`}>
              {testimonials.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('video')}
            className={`w-full flex items-center justify-between px-3.5 py-3 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer ${
              activeTab === 'video'
                ? 'bg-[#C5A059]/20 text-[#E5C178] border border-[#C5A059]/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent'
            }`}
          >
            <div className="flex items-center gap-3 min-w-0 truncate">
              <Video className={`w-4 h-4 shrink-0 ${activeTab === 'video' ? 'text-[#C5A059]' : 'text-slate-400'}`} />
              <span className="truncate">Video Showcase</span>
            </div>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
              activeTab === 'video' ? 'bg-[#C5A059] text-[#101b26]' : 'bg-emerald-500/20 text-emerald-300'
            }`}>
              Live
            </span>
          </button>
        </div>

        {/* Sidebar Footer with Status and Logout */}
        <div className="p-3.5 border-t border-slate-800/80 bg-[#0d1620] space-y-2 shrink-0">
          <div className="flex items-center justify-between px-2 text-xs text-slate-400">
            <span className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${isPending ? 'bg-amber-400 animate-ping' : 'bg-emerald-500 animate-pulse'}`}></span>
              <span>{isPending ? 'Syncing...' : 'Connected'}</span>
            </span>
            <span className="text-[10px] text-slate-500 font-mono">v2.0</span>
          </div>

          <a
            href={process.env.NEXT_PUBLIC_MAIN_WEBSITE_URL || 'http://localhost:3002'}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-slate-800/90 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700/80 transition"
          >
            <ExternalLink className="w-3.5 h-3.5 text-[#C5A059]" />
            <span>View Public Website</span>
          </a>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 hover:text-rose-200 text-xs font-semibold border border-rose-500/30 transition cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* ──────────────── MAIN CONTENT WRAPPER ──────────────── */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden bg-[#0b1219]">
        {/* Top Header Bar */}
        <header className="bg-[#101b26] border-b border-slate-800 px-6 py-3.5 shrink-0 z-20 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="text-xs font-bold text-[#C5A059] uppercase tracking-wider hidden sm:inline">ANJANI ADMIN /</span>
            <h2 className="text-sm sm:text-base font-bold text-white uppercase tracking-wider truncate">
              {activeTab === 'banners' && `Banners & Sliders (${banners.length})`}
              {activeTab === 'media' && `Image Uploader & Media Library (${mediaFiles.length})`}
                            {activeTab === 'offers' && `Special Promos & Offers (${offers.length})`}
              {activeTab === 'blogs' && `Blogs & Articles (${blogs.length})`}
              {activeTab === 'testimonials' && `Client Testimonials & Reviews (${testimonials.length})`}
              {activeTab === 'video' && 'Home Video Showcase'}
            </h2>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <a
              href={process.env.NEXT_PUBLIC_MAIN_WEBSITE_URL || 'http://localhost:3002'}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition"
              title="Open public website in a new tab"
            >
              <ExternalLink className="w-3.5 h-3.5 text-[#C5A059]" />
              <span className="hidden sm:inline">View Website</span>
            </a>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 hover:text-rose-200 text-xs font-semibold border border-rose-500/30 transition cursor-pointer"
              title="Sign out of Admin Portal"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 w-full p-6 lg:p-8 space-y-6 overflow-y-auto">
        {/* ──────────── TAB 1: BANNERS ──────────── */}
        {activeTab === 'banners' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex flex-wrap items-center justify-between gap-4 bg-[#14212e] p-4 rounded-xl border border-slate-800">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Layers className="w-5 h-5 text-[#C5A059]" />
                  Hero Banners &amp; Slider Management
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Powered by Next.js Server Actions with automatic homepage cache revalidation.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={refreshAllData}
                  disabled={loadingBanners}
                  className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
                  title="Refresh data"
                >
                  <RefreshCw className={`w-4 h-4 ${loadingBanners ? 'animate-spin' : ''}`} />
                </button>
                <button
                  onClick={handleOpenAddBanner}
                  className="flex items-center gap-2 bg-[#C5A059] hover:bg-[#b08e4d] text-slate-950 font-bold px-4 py-2 rounded-lg text-xs transition shadow-lg shadow-[#C5A059]/10"
                >
                  <Plus className="w-4 h-4" />
                  Upload &amp; Add New Banner
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {banners.map((banner, idx) => (
                <div
                  key={banner.id}
                  className="bg-[#121c27] rounded-xl border border-slate-800 overflow-hidden flex flex-col group hover:border-[#C5A059]/50 transition duration-300 shadow-md"
                >
                  <div className="relative aspect-[16/9] w-full bg-slate-900 overflow-hidden">
                    <img
                      src={banner.image}
                      alt={banner.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/30" />

                    <div className="absolute top-3 left-3 flex items-center gap-2">
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider backdrop-blur-md ${
                          banner.isActive ? 'bg-emerald-500/80 text-white' : 'bg-rose-500/80 text-white'
                        }`}
                      >
                        {banner.isActive ? 'Active' : 'Inactive'}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-black/60 text-slate-300 backdrop-blur-md">
                        Order #{banner.priority || idx + 1}
                      </span>
                    </div>

                    <a
                      href={banner.image}
                      target="_blank"
                      rel="noreferrer"
                      className="absolute top-3 right-3 p-1.5 rounded bg-black/60 text-slate-300 hover:text-white backdrop-blur-md transition"
                      title="View full image"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </a>

                    {banner.tagline && (
                      <div className="absolute bottom-3 left-3 right-3">
                        <span className="text-[10px] uppercase font-bold tracking-widest text-[#E5C178] bg-black/70 px-2 py-0.5 rounded backdrop-blur-sm inline-block max-w-full truncate">
                          {banner.tagline}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <h3 className="font-bold text-white text-sm line-clamp-1">{banner.title}</h3>
                      {banner.subtitle && (
                        <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                          {banner.subtitle}
                        </p>
                      )}
                    </div>

                    <div className="bg-slate-900/80 rounded-lg p-2.5 border border-slate-800 text-[11px] space-y-1.5">
                      <div className="flex items-center justify-between text-slate-300">
                        <span className="flex items-center gap-1.5 text-slate-400">
                          <Calendar className="w-3.5 h-3.5 text-[#C5A059]" />
                          Display Dates:
                        </span>
                        <span className="font-medium text-emerald-400">
                          {banner.startDate} → {banner.endDate}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-slate-400 text-[10px]">
                        <span>Link: <code className="text-slate-300">{banner.link}</code></span>
                        <span>Button: <strong className="text-white">{banner.buttonText}</strong></span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                      <button
                        onClick={() => copyToClipboard(banner.image)}
                        className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1.5 transition"
                        title="Copy image URL"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        Copy URL
                      </button>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleOpenEditBanner(banner)}
                          className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-amber-400 transition"
                          title="Edit Banner"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteBanner(banner.id)}
                          className="p-1.5 rounded bg-slate-800 hover:bg-rose-900/60 text-rose-400 transition"
                          title="Delete Banner"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ──────────── TAB 2: IMAGE UPLOADER & MEDIA ──────────── */}
        {activeTab === 'media' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Direct Server Action Dropzone */}
            <div className="bg-[#14212e] rounded-xl border-2 border-dashed border-[#C5A059]/40 hover:border-[#C5A059] transition p-8 text-center relative overflow-hidden group">
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={handleMediaFilesSelected}
                className="absolute inset-0 opacity-0 cursor-pointer z-10"
              />
              <div className="max-w-md mx-auto space-y-3 pointer-events-none">
                <div className="w-14 h-14 rounded-full bg-[#C5A059]/10 text-[#C5A059] flex items-center justify-center mx-auto border border-[#C5A059]/30 group-hover:scale-110 transition duration-300">
                  <Upload className="w-7 h-7" />
                </div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11px] font-bold">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>S3 Bucket: anjani-media</span>
                </div>
                <h3 className="text-base font-bold text-white">
                  {uploading ? 'Processing Supabase Upload...' : 'Drag & Drop Images or Click to Upload'}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Files are automatically uploaded to Supabase S3-compatible storage bucket <code className="text-[#C5A059] font-bold">anjani-media</code> and distributed via global CDN.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 bg-[#121c27] p-4 rounded-xl border border-slate-800">
              <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
                <div className="flex items-center gap-2 flex-1 max-w-md bg-slate-900 px-3 py-2 rounded-lg border border-slate-800">
                  <Search className="w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Search uploaded files..."
                    value={mediaSearch}
                    onChange={e => setMediaSearch(e.target.value)}
                    className="bg-transparent text-xs text-white placeholder-slate-500 outline-none w-full"
                  />
                </div>

                <div className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-lg border border-slate-800 text-xs">
                  <button
                    type="button"
                    onClick={() => setMediaTypeFilter('all')}
                    className={`px-3 py-1.5 rounded-md font-medium transition ${
                      mediaTypeFilter === 'all'
                        ? 'bg-[#C5A059] text-slate-950 font-bold'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    All ({mediaFiles.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setMediaTypeFilter('images')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition ${
                      mediaTypeFilter === 'images'
                        ? 'bg-[#C5A059] text-slate-950 font-bold'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <ImageIcon className="w-3.5 h-3.5" />
                    Images ({mediaFiles.filter(f => isImageFile(f.name, f.url)).length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setMediaTypeFilter('audio-video')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition ${
                      mediaTypeFilter === 'audio-video'
                        ? 'bg-[#C5A059] text-slate-950 font-bold'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Film className="w-3.5 h-3.5" />
                    Audio & Video ({mediaFiles.filter(f => !isImageFile(f.name, f.url)).length})
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={refreshAllData}
                  disabled={loadingMedia}
                  className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
                  title="Refresh media"
                >
                  <RefreshCw className={`w-4 h-4 ${loadingMedia ? 'animate-spin' : ''}`} />
                </button>
                <label className="flex items-center gap-2 bg-[#C5A059] hover:bg-[#b08e4d] text-slate-950 font-bold px-4 py-2 rounded-lg text-xs cursor-pointer transition shadow">
                  <Plus className="w-4 h-4" />
                  Select Files
                  <input
                    type="file"
                    multiple
                    accept="image/*,video/*,audio/*"
                    onChange={handleMediaFilesSelected}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {filteredMedia.map(file => {
                const isAudio = isAudioFile(file.name, file.url);
                const isVideo = isVideoFile(file.name, file.url);

                return (
                  <div
                    key={file.url}
                    className="bg-[#121c27] rounded-xl border border-slate-800 overflow-hidden flex flex-col group hover:border-[#C5A059]/60 transition duration-200"
                  >
                    <div className="relative aspect-square w-full bg-slate-900 overflow-hidden flex items-center justify-center">
                      {isAudio ? (
                        <div className="w-full h-full relative bg-gradient-to-br from-indigo-950/70 via-slate-900 to-slate-950 flex flex-col items-center justify-center p-3 text-center">
                          <div className="w-12 h-12 rounded-full bg-indigo-500/20 border border-indigo-400/40 flex items-center justify-center text-indigo-300 mb-2 shadow-inner group-hover:scale-110 transition duration-300">
                            <Music className="w-6 h-6" />
                          </div>
                          <span className="text-[10px] text-indigo-200/90 font-mono truncate max-w-full px-2">
                            Audio Track
                          </span>
                          <span className="absolute top-2 left-2 px-1.5 py-0.5 rounded text-[9px] font-semibold bg-indigo-500/80 text-white uppercase tracking-wider">
                            Audio
                          </span>
                        </div>
                      ) : isVideo ? (
                        <div className="w-full h-full relative bg-slate-950 flex items-center justify-center">
                          <video
                            src={file.url}
                            className="w-full h-full object-cover pointer-events-none"
                            muted
                            playsInline
                            preload="metadata"
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                            <div className="w-10 h-10 rounded-full bg-slate-900/90 border border-[#C5A059]/60 flex items-center justify-center text-[#C5A059] shadow-lg group-hover:scale-110 transition duration-300">
                              <Play className="w-5 h-5 ml-0.5 fill-[#C5A059]" />
                            </div>
                          </div>
                          <span className="absolute top-2 left-2 px-1.5 py-0.5 rounded text-[9px] font-semibold bg-amber-600/80 text-white uppercase tracking-wider">
                            Video
                          </span>
                        </div>
                      ) : (
                        <img
                          src={file.url}
                          alt={file.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                          loading="lazy"
                          onError={e => {
                            (e.target as HTMLImageElement).src =
                              'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="%2394a3b8" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>';
                          }}
                        />
                      )}

                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2 p-2">
                        <button
                          onClick={() => copyToClipboard(file.url)}
                          className="p-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-white transition"
                          title="Copy URL"
                        >
                          {copiedUrl === file.url ? (
                            <Check className="w-4 h-4 text-emerald-400" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                        <a
                          href={file.url}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-white transition"
                          title="Open media"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                        {file.isUploaded && (
                          <button
                            onClick={() => handleDeleteMedia(file.name, file.url)}
                            className="p-1.5 rounded-md bg-rose-900/80 hover:bg-rose-800 text-white transition"
                            title="Delete file"
                          >
                            <Trash2 className="w-4 h-4 text-rose-300" />
                          </button>
                        )}
                      </div>
                    </div>

                  <div className="p-2.5 space-y-1">
                    <p className="text-[11px] font-medium text-slate-200 truncate" title={file.name}>
                      {file.name}
                    </p>
                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <span>{(file.size / 1024).toFixed(0)} KB</span>
                      <button
                        onClick={() => copyToClipboard(file.url)}
                        className="text-[#C5A059] hover:underline"
                      >
                        Copy URL
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          </div>
        )}

        {/* ──────────── TAB 3: PROJECTS ──────────── */}
        {/* ──────────── TAB 4: OFFERS ──────────── */}
        {activeTab === 'offers' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex flex-wrap items-center justify-between gap-4 bg-[#14212e] p-4 rounded-xl border border-slate-800">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-[#C5A059]" />
                  Campaign Banners &amp; Validity Dates
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Launch festive campaigns, countdowns, and discount banners with start and end dates.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={refreshAllData}
                  disabled={loadingOffers}
                  className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
                  title="Refresh offers"
                >
                  <RefreshCw className={`w-4 h-4 ${loadingOffers ? 'animate-spin' : ''}`} />
                </button>
                <button
                  onClick={handleOpenAddOffer}
                  className="flex items-center gap-2 bg-[#C5A059] hover:bg-[#b08e4d] text-slate-950 font-bold px-4 py-2 rounded-lg text-xs transition shadow"
                >
                  <Plus className="w-4 h-4" />
                  Add Campaign Banner
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {offers.map(offer => (
                <div
                  key={offer.id}
                  className="bg-[#121c27] rounded-xl border border-slate-800 overflow-hidden flex flex-col md:flex-row group hover:border-[#C5A059]/40 transition shadow-md"
                >
                  <div className="relative md:w-2/5 aspect-[16/10] md:aspect-auto bg-slate-900">
                    <img
                      src={offer.image}
                      alt={offer.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />
                    <div className="absolute top-2 left-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#C5A059] text-slate-950 uppercase">
                        {offer.badge}
                      </span>
                    </div>
                  </div>

                  <div className="p-4 md:w-3/5 flex flex-col justify-between space-y-3">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-emerald-400">{offer.discount}</span>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                            offer.isActive ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                          }`}
                        >
                          {offer.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <h4 className="font-bold text-white text-sm">{offer.title}</h4>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                        {offer.subtitle}
                      </p>
                    </div>

                    <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800 text-[11px] space-y-1">
                      <div className="flex items-center gap-1.5 text-slate-300">
                        <Calendar className="w-3.5 h-3.5 text-[#C5A059]" />
                        <span>Valid: <strong className="text-emerald-400">{offer.startDate}</strong> to <strong className="text-emerald-400">{offer.endDate}</strong></span>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                      <button
                        onClick={() => handleOpenEditOffer(offer)}
                        className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-amber-400 transition"
                        title="Edit Offer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteOffer(offer.id)}
                        className="p-1.5 rounded bg-slate-800 hover:bg-rose-900/60 text-rose-400 transition"
                        title="Delete Offer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ──────────── TAB 5: BLOGS & ARTICLES ──────────── */}
        {activeTab === 'blogs' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Header & Controls */}
            <div className="flex flex-wrap items-center justify-between gap-4 bg-[#14212e] p-4 rounded-xl border border-slate-800">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-[#C5A059]" />
                  Blogs &amp; Editorial Articles Management
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Published articles appear live on the Homepage Latest Blogs and the /blogs catalog.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={refreshAllData}
                  disabled={loadingBlogs || isPending}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium flex items-center gap-1.5 transition"
                  title="Refresh from Database"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loadingBlogs || isPending ? 'animate-spin' : ''}`} />
                  Refresh
                </button>

                <button
                  onClick={handleOpenAddBlog}
                  className="px-4 py-2 bg-[#C5A059] hover:bg-[#b08e4d] text-slate-950 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-[#C5A059]/20 transition"
                >
                  <Plus className="w-4 h-4" />
                  Write New Blog Article
                </button>
              </div>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 bg-[#111c26] p-3 rounded-lg border border-slate-800/80 text-xs">
              <div className="flex items-center gap-2 flex-1 max-w-md">
                <Search className="w-4 h-4 text-slate-400 shrink-0" />
                <input
                  type="text"
                  placeholder="Search articles by title, excerpt or category..."
                  value={blogSearch}
                  onChange={e => setBlogSearch(e.target.value)}
                  className="w-full bg-transparent text-white outline-none placeholder-slate-500"
                />
                {blogSearch && (
                  <button onClick={() => setBlogSearch('')} className="text-slate-400 hover:text-white">
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="flex items-center gap-3">
                <label className="text-slate-400 font-medium">Category:</label>
                <select
                  value={blogCategoryFilter}
                  onChange={e => setBlogCategoryFilter(e.target.value)}
                  className="bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-slate-200 text-xs outline-none focus:border-[#C5A059]"
                >
                  <option value="ALL">All Categories ({blogs.length})</option>
                  {BLOG_CATEGORIES.filter(c => c !== 'All Articles').map(c => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                <span className="text-slate-500">Showing {filteredBlogs.length} of {blogs.length}</span>
              </div>
            </div>

            {/* Blogs Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredBlogs.map(blog => (
                <div
                  key={blog.id || blog.slug}
                  className="bg-[#14212e] rounded-xl border border-slate-800 overflow-hidden flex flex-col hover:border-slate-700 transition group shadow-md"
                >
                  {/* Thumbnail */}
                  <div className="relative h-48 bg-slate-900 overflow-hidden">
                    <img
                      src={blog.image}
                      alt={blog.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />
                    <div className="absolute top-2.5 left-2.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-black/70 backdrop-blur-md text-[#E5C178] border border-[#C5A059]/30">
                        {blog.category}
                      </span>
                    </div>
                    {blog.featured && (
                      <div className="absolute top-2.5 right-2.5">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#C5A059] text-slate-950 shadow">
                          ★ Featured
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Body */}
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1.5">
                        <span>{blog.formattedDate || blog.date}</span>
                        <span>{blog.readTime || '5 min read'}</span>
                      </div>

                      <h3 className="font-bold text-sm text-white group-hover:text-[#C5A059] transition line-clamp-2 leading-snug">
                        {blog.title}
                      </h3>

                      <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                        {blog.excerpt}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {blog.author?.avatar ? (
                          <img
                            src={blog.author.avatar}
                            alt={blog.author.name}
                            className="w-6 h-6 rounded-full object-cover border border-slate-700"
                          />
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-[10px] text-amber-400 font-bold">
                            {blog.author?.name ? blog.author.name.charAt(0) : 'A'}
                          </div>
                        )}
                        <span className="text-[11px] text-slate-300 font-medium truncate max-w-[110px]">
                          {blog.author?.name || 'Anjani Infra'}
                        </span>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-1.5">
                        <Link
                          href={`/blogs/${blog.slug}`}
                          target="_blank"
                          prefetch={false}
                          className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                          title="Preview article"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </Link>
                        <button
                          onClick={() => handleOpenEditBlog(blog)}
                          className="p-1.5 rounded bg-slate-800 hover:bg-[#C5A059] hover:text-slate-950 text-slate-300 transition"
                          title="Edit Article"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteBlog(blog.id, blog.title)}
                          className="p-1.5 rounded bg-slate-800 hover:bg-rose-900/60 text-rose-400 transition"
                          title="Delete Article"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredBlogs.length === 0 && (
              <div className="p-12 text-center bg-[#14212e] rounded-xl border border-slate-800 text-slate-400">
                <BookOpen className="w-10 h-10 mx-auto text-slate-600 mb-3" />
                <p className="text-sm font-semibold text-slate-300">No blog articles found</p>
                <p className="text-xs mt-1 text-slate-500">
                  {blogSearch ? 'Try clearing your search query' : 'Click "Write New Blog Article" to create your first post!'}
                </p>
              </div>
            )}
          </div>
        )}

        {/* ──────────── TAB 6: TESTIMONIALS & REVIEWS ──────────── */}
        {activeTab === 'testimonials' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Header & Controls */}
            <div className="flex flex-wrap items-center justify-between gap-4 bg-[#14212e] p-4 rounded-xl border border-slate-800">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <MessageSquareQuote className="w-5 h-5 text-[#C5A059]" />
                  14,000+ Satisfied Customers — Client Testimonials
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Published customer reviews appear in the 5-column carousel on the homepage with photos and quotes.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={refreshAllData}
                  disabled={loadingTestimonials || isPending}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium flex items-center gap-1.5 transition"
                  title="Refresh from Database"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loadingTestimonials || isPending ? 'animate-spin' : ''}`} />
                  Refresh
                </button>

                <button
                  onClick={handleOpenAddTestimonial}
                  className="px-4 py-2 bg-[#C5A059] hover:bg-[#b08e4d] text-slate-950 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-[#C5A059]/20 transition"
                >
                  <Plus className="w-4 h-4" />
                  Add Customer Review
                </button>
              </div>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 bg-[#111c26] p-3 rounded-lg border border-slate-800/80 text-xs">
              <div className="flex items-center gap-2 flex-1 max-w-md">
                <Search className="w-4 h-4 text-slate-400 shrink-0" />
                <input
                  type="text"
                  placeholder="Search reviews by client name, location or quote text..."
                  value={testimonialSearch}
                  onChange={e => setTestimonialSearch(e.target.value)}
                  className="w-full bg-transparent text-white outline-none placeholder-slate-500"
                />
                {testimonialSearch && (
                  <button onClick={() => setTestimonialSearch('')} className="text-slate-400 hover:text-white">
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              <span className="text-slate-500">Showing {filteredTestimonials.length} of {testimonials.length} reviews</span>
            </div>

            {/* Testimonials Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTestimonials.map(t => (
                <div
                  key={t.id}
                  className="bg-[#14212e] rounded-xl border border-slate-800 p-5 flex flex-col justify-between hover:border-slate-700 transition group shadow-md"
                >
                  <div>
                    {/* Top Row: Avatar + Info */}
                    <div className="flex items-start gap-4 mb-4">
                      <div className="relative shrink-0">
                        <img
                          src={t.image}
                          alt={t.name}
                          className="w-16 h-16 rounded-full object-cover border-2 border-[#C5A059] shadow group-hover:scale-105 transition duration-300"
                        />
                        <div className="w-5 h-5 rounded-full bg-[#132B3E] text-[#C5A059] flex items-center justify-center font-serif text-[10px] absolute -bottom-1 -right-1 shadow border border-[#C5A059]/40">
                          &ldquo;
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <h4 className="font-bold text-sm text-white truncate group-hover:text-[#C5A059] transition">
                            {t.name}
                          </h4>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                            #{t.displayOrder || 1}
                          </span>
                        </div>
                        <p className="text-xs text-[#E5C178] font-medium truncate mt-0.5">{t.location}</p>
                        <div className="flex items-center gap-0.5 text-amber-400 mt-1">
                          {[...Array(t.rating || 5)].map((_, i) => (
                            <Star key={i} className="w-3 h-3 fill-amber-400" />
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Quote Text */}
                    <p className="text-xs text-slate-300 italic leading-relaxed line-clamp-3 bg-slate-900/60 p-3 rounded-lg border border-slate-800/80">
                      &ldquo;{t.text}&rdquo;
                    </p>
                  </div>

                  {/* Bottom Controls */}
                  <div className="pt-4 mt-4 border-t border-slate-800 flex items-center justify-between">
                    <span
                      className={`inline-flex items-center gap-1.5 text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        t.isActive !== false ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/40' : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${t.isActive !== false ? 'bg-emerald-400' : 'bg-slate-500'}`}></span>
                      {t.isActive !== false ? 'Active on Homepage' : 'Hidden'}
                    </span>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleOpenEditTestimonial(t)}
                        className="p-1.5 rounded bg-slate-800 hover:bg-[#C5A059] hover:text-slate-950 text-slate-300 transition"
                        title="Edit Review"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteTestimonial(t.id, t.name)}
                        className="p-1.5 rounded bg-slate-800 hover:bg-rose-900/60 text-rose-400 transition"
                        title="Delete Review"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredTestimonials.length === 0 && (
              <div className="p-12 text-center bg-[#14212e] rounded-xl border border-slate-800 text-slate-400">
                <MessageSquareQuote className="w-10 h-10 mx-auto text-slate-600 mb-3" />
                <p className="text-sm font-semibold text-slate-300">No customer reviews found</p>
                <p className="text-xs mt-1 text-slate-500">
                  {testimonialSearch ? 'Try clearing your search query' : 'Click "Add Customer Review" to publish client feedback!'}
                </p>
              </div>
            )}
          </div>
        )}

        {/* ──────────── TAB 7: VIDEO SHOWCASE ──────────── */}
        {activeTab === 'video' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-4 bg-[#14212e] p-4 rounded-xl border border-slate-800">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Video className="w-5 h-5 text-[#C5A059]" />
                  Homepage Video Showcase Management
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Update the embedded video player shown between the testimonials and factory section on your homepage.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={refreshAllData}
                  disabled={loadingVideo || isPending}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium flex items-center gap-1.5 transition"
                  title="Refresh from Database"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loadingVideo || isPending ? 'animate-spin' : ''}`} />
                  Refresh
                </button>
              </div>
            </div>

            {/* Split Screen Layout: Settings Form + Live Preview */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Column: Configuration Form (7 cols) */}
              <div className="lg:col-span-6 bg-[#14212e] rounded-xl border border-slate-800 p-6 shadow-xl space-y-5">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-slate-800 pb-3 flex items-center justify-between">
                  <span>Player &amp; Video Settings</span>
                  <span className="text-[11px] font-normal text-[#C5A059]">Synced with Supabase DB</span>
                </h3>

                <form onSubmit={handleSaveVideo} className="space-y-4 text-xs">
                  {/* Title & Subtitle */}
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Section Headline / Title *</label>
                    <input
                      type="text"
                      required
                      value={videoData.title}
                      onChange={e => setVideoData({ ...videoData, title: e.target.value })}
                      placeholder="e.g. Luxury Home Interior Walkthrough & Factory Tour"
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-white outline-none focus:border-[#C5A059]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">Subtitle / Sub-text</label>
                      <input
                        type="text"
                        value={videoData.subtitle}
                        onChange={e => setVideoData({ ...videoData, subtitle: e.target.value })}
                        placeholder="e.g. Anjani Infra Hyderabad • Direct Video Showcase"
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-white outline-none focus:border-[#C5A059]"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">Badge Text (Right corner)</label>
                      <input
                        type="text"
                        value={videoData.badgeText}
                        onChange={e => setVideoData({ ...videoData, badgeText: e.target.value })}
                        placeholder="e.g. Plays Directly Here (No New Tabs)"
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-white outline-none focus:border-[#C5A059]"
                      />
                    </div>
                  </div>

                  {/* Video Source Type Tabs */}
                  <div className="pt-2">
                    <label className="block text-slate-300 font-semibold mb-2">Video Playback Source</label>
                    <div className="grid grid-cols-2 gap-2 p-1 bg-slate-950 rounded-lg border border-slate-800">
                      <button
                        type="button"
                        onClick={() => setVideoData({ ...videoData, videoType: 'youtube' })}
                        className={`py-2 px-3 rounded-md font-semibold text-center transition ${
                          videoData.videoType === 'youtube'
                            ? 'bg-[#C5A059] text-slate-950 shadow'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        YouTube Link
                      </button>
                      <button
                        type="button"
                        onClick={() => setVideoData({ ...videoData, videoType: 'direct' })}
                        className={`py-2 px-3 rounded-md font-semibold text-center transition ${
                          videoData.videoType === 'direct'
                            ? 'bg-[#C5A059] text-slate-950 shadow'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        Direct MP4 Video (No Ads)
                      </button>
                    </div>
                  </div>

                  {/* Option 1: YouTube */}
                  {videoData.videoType === 'youtube' && (
                    <div className="space-y-3 p-4 bg-slate-900/80 rounded-xl border border-slate-800 animate-fadeIn">
                      <div>
                        <label className="block text-slate-300 font-semibold mb-1">
                          YouTube Video URL or Watch Link *
                        </label>
                        <input
                          type="text"
                          required={videoData.videoType === 'youtube'}
                          value={videoData.videoUrl}
                          onChange={e => {
                            const url = e.target.value;
                            const embed = extractYouTubeEmbedUrl(url);
                            setVideoData({ ...videoData, videoUrl: url, embedUrl: embed });
                          }}
                          placeholder="https://www.youtube.com/watch?v=... or https://youtu.be/..."
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white outline-none focus:border-[#C5A059]"
                        />
                      </div>

                      <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800/80">
                        <span className="text-[10px] text-slate-400 block font-mono">Generated Embed URL:</span>
                        <span className="text-[11px] text-[#E5C178] break-all font-mono">
                          {videoData.embedUrl || 'Waiting for valid YouTube URL...'}
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-400">
                        💡 <strong>Notice:</strong> If YouTube shows &quot;Video unavailable. Playback on other websites has been disabled by the video owner&quot;, simply switch to &quot;Direct MP4 Video&quot; above and upload your MP4 video file!
                      </p>
                    </div>
                  )}

                  {/* Option 2: Direct MP4 Video */}
                  {videoData.videoType === 'direct' && (
                    <div className="space-y-3 p-4 bg-slate-900/80 rounded-xl border border-slate-800 animate-fadeIn">
                      <label className="block text-slate-300 font-semibold">Direct MP4 Video URL *</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          required={videoData.videoType === 'direct'}
                          value={videoData.directVideoUrl || ''}
                          onChange={e => setVideoData({ ...videoData, directVideoUrl: e.target.value })}
                          placeholder="/uploads/... or https://..."
                          className="flex-1 bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white outline-none focus:border-[#C5A059]"
                        />
                        <label className="px-3 py-2 bg-[#C5A059] hover:bg-[#b08e4d] text-slate-950 font-bold rounded-lg cursor-pointer flex items-center gap-1.5 shrink-0 transition">
                          <Upload className="w-3.5 h-3.5" />
                          {uploadingVideo ? 'Uploading...' : 'Upload Video File'}
                          <input
                            ref={videoFileInputRef}
                            type="file"
                            accept="video/mp4,video/webm,video/*"
                            onChange={async e => {
                              if (e.target.files && e.target.files[0]) {
                                setUploadingVideo(true);
                                const url = await handleServerUpload(e.target.files[0]);
                                setUploadingVideo(false);
                                if (url) setVideoData({ ...videoData, directVideoUrl: url });
                              }
                            }}
                            className="hidden"
                          />
                        </label>
                      </div>

                      <div>
                        <label className="block text-slate-300 font-semibold mb-1">Poster Thumbnail Image (optional)</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={videoData.posterImage || ''}
                            onChange={e => setVideoData({ ...videoData, posterImage: e.target.value })}
                            placeholder="/projects/proj1.jpg or image URL"
                            className="flex-1 bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white outline-none focus:border-[#C5A059]"
                          />
                          <label className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-lg cursor-pointer flex items-center gap-1 shrink-0 transition">
                            <Upload className="w-3.5 h-3.5" />
                            Poster
                            <input
                              ref={posterImageInputRef}
                              type="file"
                              accept="image/*"
                              onChange={async e => {
                                if (e.target.files && e.target.files[0]) {
                                  const url = await handleServerUpload(e.target.files[0]);
                                  if (url) setVideoData({ ...videoData, posterImage: url });
                                }
                              }}
                              className="hidden"
                            />
                          </label>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Active Toggle */}
                  <label className="flex items-center gap-2 cursor-pointer bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                    <input
                      type="checkbox"
                      checked={videoData.isActive}
                      onChange={e => setVideoData({ ...videoData, isActive: e.target.checked })}
                      className="w-4 h-4 rounded text-[#C5A059] focus:ring-0 bg-slate-800"
                    />
                    <span className="text-white font-medium">Display Video Showcase on Homepage</span>
                  </label>

                  {/* Submit Button */}
                  <div className="pt-3 border-t border-slate-800">
                    <button
                      type="submit"
                      disabled={isPending || uploadingVideo}
                      className="w-full py-3 bg-[#C5A059] hover:bg-[#b08e4d] text-slate-950 font-bold rounded-lg shadow-lg shadow-[#C5A059]/20 transition flex items-center justify-center gap-2 text-sm"
                    >
                      <Video className="w-4 h-4" />
                      {isPending ? 'Saving to Database...' : 'Save & Update Homepage Video Showcase'}
                    </button>
                  </div>
                </form>
              </div>

              {/* Right Column: Live Homepage Player Preview (6 cols) */}
              <div className="lg:col-span-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                    <Eye className="w-4 h-4 text-[#C5A059]" />
                    Live Homepage Preview
                  </h3>
                  <span className="text-[11px] text-emerald-400 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    Real-time player
                  </span>
                </div>

                {/* Simulated Homepage Section Container */}
                <div className="bg-[#132B3E] p-6 rounded-2xl border-2 border-slate-700 shadow-2xl space-y-5">
                  {/* Top Bar matching Homepage */}
                  <div className="flex flex-wrap items-center justify-between gap-3 text-white">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-[#C5A059] text-[#132B3E] font-black text-xs flex items-center justify-center shadow shrink-0">
                        AI
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white leading-tight">
                          {videoData.title || 'Luxury Home Interior Walkthrough & Factory Tour'}
                        </h4>
                        <p className="text-[11px] text-amber-200/80">
                          {videoData.subtitle || 'Anjani Infra Hyderabad • Direct Video Showcase'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-full border border-white/15 text-[10px] text-amber-100 font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span>{videoData.badgeText || 'Plays Directly Here (No New Tabs)'}</span>
                    </div>
                  </div>

                  {/* Player Container */}
                  <div className="relative w-full aspect-video rounded-xl overflow-hidden shadow-2xl border-2 border-[#C5A059]/40 bg-black">
                    {videoData.videoType === 'direct' && videoData.directVideoUrl ? (
                      <video
                        controls
                        playsInline
                        poster={videoData.posterImage || undefined}
                        className="w-full h-full object-cover"
                        key={videoData.directVideoUrl}
                      >
                        <source src={videoData.directVideoUrl} type="video/mp4" />
                        Your browser does not support HTML5 video.
                      </video>
                    ) : (
                      <iframe
                        className="w-full h-full border-0"
                        src={videoData.embedUrl || 'https://www.youtube-nocookie.com/embed/1rKdfAkygIs?rel=0&modestbranding=1&playsinline=1'}
                        title={videoData.title}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        sandbox="allow-scripts allow-same-origin allow-presentation"
                        allowFullScreen
                        key={videoData.embedUrl}
                      />
                    )}
                  </div>

                  <p className="text-[11px] text-slate-300 text-center">
                    This is an exact preview of the video container on the live website. Click play to test.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
      </div>

      {/* ──────────────── MODAL: BANNER ──────────────── */}
      {bannerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#121c27] border border-slate-700 w-full max-w-2xl rounded-2xl p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-[#C5A059]" />
                {editingBanner ? 'Edit Banner Slide (Server Action)' : 'Upload & Add New Banner Slide'}
              </h3>
              <button onClick={() => setBannerModalOpen(false)} className="text-slate-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBanner} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Tagline / Golden Eyebrow</label>
                  <input
                    type="text"
                    placeholder="e.g. HYDERABAD'S PREMIER INTERIOR DESIGN STUDIO"
                    value={bannerForm.tagline}
                    onChange={e => setBannerForm({ ...bannerForm, tagline: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-white outline-none focus:border-[#C5A059]"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Display Priority Order</label>
                  <input
                    type="number"
                    min="1"
                    value={bannerForm.priority}
                    onChange={e => setBannerForm({ ...bannerForm, priority: Number(e.target.value) })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-white outline-none focus:border-[#C5A059]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Headline / Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Crafting Bespoke Luxury Living Spaces"
                  value={bannerForm.title}
                  onChange={e => setBannerForm({ ...bannerForm, title: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-white outline-none focus:border-[#C5A059]"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Subtitle / Description</label>
                <textarea
                  rows={2}
                  value={bannerForm.subtitle}
                  onChange={e => setBannerForm({ ...bannerForm, subtitle: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-white outline-none focus:border-[#C5A059]"
                />
              </div>

              <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-800 space-y-2">
                <label className="block text-slate-300 font-semibold">Banner Image *</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    required
                    value={bannerForm.image}
                    onChange={e => setBannerForm({ ...bannerForm, image: e.target.value })}
                    placeholder="/uploads/... or https://..."
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white outline-none focus:border-[#C5A059]"
                  />
                  <label className="px-3.5 py-2.5 bg-[#C5A059] hover:bg-[#b08e4d] text-slate-950 font-bold rounded-lg cursor-pointer flex items-center gap-1.5 shrink-0 transition">
                    <Upload className="w-3.5 h-3.5" />
                    Upload File
                    <input
                      ref={bannerImageInputRef}
                      type="file"
                      accept="image/*"
                      onChange={async e => {
                        if (e.target.files && e.target.files[0]) {
                          const file = e.target.files[0];
                          const previewUrl = URL.createObjectURL(file);
                          setBannerForm(prev => ({ ...prev, image: previewUrl }));
                          const url = await handleServerUpload(file);
                          if (url) {
                            setBannerForm(prev => ({ ...prev, image: url }));
                          }
                        }
                      }}
                      className="hidden"
                    />
                  </label>
                </div>

                {bannerForm.image && (
                  <div className="mt-2 relative aspect-[21/9] rounded-lg overflow-hidden border border-slate-700 bg-black">
                    <img src={bannerForm.image} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-[#C5A059]" />
                    Start Date
                  </label>
                  <input
                    type="date"
                    required
                    value={bannerForm.startDate}
                    onChange={e => setBannerForm({ ...bannerForm, startDate: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-white outline-none focus:border-[#C5A059]"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-[#C5A059]" />
                    End Date
                  </label>
                  <input
                    type="date"
                    required
                    value={bannerForm.endDate}
                    onChange={e => setBannerForm({ ...bannerForm, endDate: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-white outline-none focus:border-[#C5A059]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Button Label</label>
                  <input
                    type="text"
                    value={bannerForm.buttonText}
                    onChange={e => setBannerForm({ ...bannerForm, buttonText: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-white outline-none focus:border-[#C5A059]"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Target Page Link</label>
                  <input
                    type="text"
                    value={bannerForm.link}
                    onChange={e => setBannerForm({ ...bannerForm, link: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-white outline-none focus:border-[#C5A059]"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  id="bannerIsActive"
                  checked={bannerForm.isActive}
                  onChange={e => setBannerForm({ ...bannerForm, isActive: e.target.checked })}
                  className="w-4 h-4 rounded text-[#C5A059] cursor-pointer"
                />
                <label htmlFor="bannerIsActive" className="text-slate-300 font-medium cursor-pointer">
                  Activate banner immediately on the public website
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setBannerModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-5 py-2 rounded-lg bg-[#C5A059] text-slate-950 font-bold transition shadow"
                >
                  {isPending ? 'Saving...' : editingBanner ? 'Save Changes' : 'Publish Banner'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ──────────────── MODAL: OFFER ──────────────── */}
      {offerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#121c27] border border-slate-700 w-full max-w-xl rounded-2xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#C5A059]" />
                {editingOffer ? 'Edit Campaign (Server Action)' : 'Create Campaign Offer Banner'}
              </h3>
              <button onClick={() => setOfferModalOpen(false)} className="text-slate-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveOffer} className="space-y-4">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Campaign Title *</label>
                <input
                  type="text"
                  required
                  value={offerForm.title}
                  onChange={e => setOfferForm({ ...offerForm, title: e.target.value })}
                  placeholder="e.g. 40-Day Handover with Free Italian Countertop"
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-white outline-none focus:border-[#C5A059]"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-slate-300 font-semibold">Banner Image *</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    required
                    value={offerForm.image}
                    onChange={e => setOfferForm({ ...offerForm, image: e.target.value })}
                    placeholder="/uploads/... or https://..."
                    className="flex-1 bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-white outline-none focus:border-[#C5A059]"
                  />
                  <label className="px-3 py-2 bg-[#C5A059] hover:bg-[#b08e4d] text-slate-950 font-bold rounded-lg cursor-pointer flex items-center gap-1 shrink-0">
                    <Upload className="w-3.5 h-3.5" />
                    Upload
                    <input
                      ref={offerImageInputRef}
                      type="file"
                      accept="image/*"
                      onChange={async e => {
                        if (e.target.files && e.target.files[0]) {
                          const file = e.target.files[0];
                          const previewUrl = URL.createObjectURL(file);
                          setOfferForm(prev => ({ ...prev, image: previewUrl }));
                          const url = await handleServerUpload(file);
                          if (url) {
                            setOfferForm(prev => ({ ...prev, image: url }));
                          }
                        }
                      }}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-[#C5A059]" />
                    Valid From
                  </label>
                  <input
                    type="date"
                    required
                    value={offerForm.startDate}
                    onChange={e => setOfferForm({ ...offerForm, startDate: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-white outline-none focus:border-[#C5A059]"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-[#C5A059]" />
                    Valid Until
                  </label>
                  <input
                    type="date"
                    required
                    value={offerForm.endDate}
                    onChange={e => setOfferForm({ ...offerForm, endDate: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-white outline-none focus:border-[#C5A059]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setOfferModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-5 py-2 rounded-lg bg-[#C5A059] text-slate-950 font-bold"
                >
                  {isPending ? 'Saving...' : editingOffer ? 'Save Changes' : 'Publish Offer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* ──────────────── MODAL: BLOG ARTICLE ──────────────── */}
      {blogModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#121c27] border border-slate-700 w-full max-w-3xl rounded-2xl p-6 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-[#C5A059]" />
                {editingBlog ? 'Edit Blog Article (Server Action)' : 'Publish New Blog Article'}
              </h3>
              <button onClick={() => setBlogModalOpen(false)} className="text-slate-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBlog} className="space-y-4">
              {/* Title & Slug */}
              <div className="space-y-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Article Title *</label>
                  <input
                    type="text"
                    required
                    value={blogForm.title}
                    onChange={e => {
                      const newTitle = e.target.value;
                      if (!editingBlog) {
                        const autoSlug = newTitle
                          .toLowerCase()
                          .trim()
                          .replace(/[^a-z0-9]+/g, '-')
                          .replace(/^-+|-+$/g, '');
                        setBlogForm({ ...blogForm, title: newTitle, slug: autoSlug });
                      } else {
                        setBlogForm({ ...blogForm, title: newTitle });
                      }
                    }}
                    placeholder="e.g. Modern Minimalist Kitchen Designs in Hyderabad"
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-white outline-none focus:border-[#C5A059]"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">URL Slug (e.g. /blogs/your-slug)</label>
                    <input
                      type="text"
                      value={blogForm.slug}
                      onChange={e => setBlogForm({ ...blogForm, slug: e.target.value })}
                      placeholder="modern-minimalist-kitchen-designs"
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-white outline-none focus:border-[#C5A059]"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Category *</label>
                    <select
                      value={blogForm.category}
                      onChange={e => setBlogForm({ ...blogForm, category: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-white outline-none focus:border-[#C5A059]"
                    >
                      {BLOG_CATEGORIES.filter(c => c !== 'All Articles').map(c => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Cover Image with S3 upload */}
              <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-800 space-y-2">
                <label className="block text-slate-300 font-semibold">Cover Image *</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    required
                    value={blogForm.image}
                    onChange={e => setBlogForm({ ...blogForm, image: e.target.value })}
                    placeholder="/uploads/... or https://images.unsplash.com/..."
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white outline-none focus:border-[#C5A059]"
                  />
                  <label className="px-3.5 py-2.5 bg-[#C5A059] hover:bg-[#b08e4d] text-slate-950 font-bold rounded-lg cursor-pointer flex items-center gap-1.5 shrink-0 transition">
                    <Upload className="w-3.5 h-3.5" />
                    Upload File
                    <input
                      ref={blogImageInputRef}
                      type="file"
                      accept="image/*"
                      onChange={async e => {
                        if (e.target.files && e.target.files[0]) {
                          const file = e.target.files[0];
                          const previewUrl = URL.createObjectURL(file);
                          setBlogForm(prev => ({ ...prev, image: previewUrl }));
                          const url = await handleServerUpload(file);
                          if (url) {
                            setBlogForm(prev => ({ ...prev, image: url }));
                          }
                        }
                      }}
                      className="hidden"
                    />
                  </label>
                </div>

                {blogForm.image && (
                  <div className="mt-2 relative h-36 rounded-lg overflow-hidden border border-slate-700 bg-black">
                    <img src={blogForm.image} alt="Cover Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              {/* Excerpt */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Short Excerpt / Summary *</label>
                <textarea
                  rows={2}
                  required
                  value={blogForm.excerpt}
                  onChange={e => setBlogForm({ ...blogForm, excerpt: e.target.value })}
                  placeholder="A concise 1-2 sentence preview that appears on the homepage card and search previews..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-white outline-none focus:border-[#C5A059]"
                />
              </div>

              {/* Metadata: Read Time, Author, Featured */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Read Time</label>
                  <input
                    type="text"
                    value={blogForm.readTime}
                    onChange={e => setBlogForm({ ...blogForm, readTime: e.target.value })}
                    placeholder="e.g. 5 min read"
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-white outline-none focus:border-[#C5A059]"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Author Name</label>
                  <input
                    type="text"
                    value={blogForm.authorName}
                    onChange={e => setBlogForm({ ...blogForm, authorName: e.target.value })}
                    placeholder="e.g. Priya Sharma"
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-white outline-none focus:border-[#C5A059]"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Author Role</label>
                  <input
                    type="text"
                    value={blogForm.authorRole}
                    onChange={e => setBlogForm({ ...blogForm, authorRole: e.target.value })}
                    placeholder="e.g. Principal Interior Architect"
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-white outline-none focus:border-[#C5A059]"
                  />
                </div>
              </div>

              {/* Featured Checkbox */}
              <label className="flex items-center gap-2 cursor-pointer bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                <input
                  type="checkbox"
                  checked={blogForm.featured}
                  onChange={e => setBlogForm({ ...blogForm, featured: e.target.checked })}
                  className="w-4 h-4 rounded text-[#C5A059] focus:ring-0 bg-slate-800"
                />
                <span className="text-white font-medium">Show in Homepage "LATEST BLOGS" &amp; Featured Section</span>
              </label>

              {/* Full Article Content */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Full Article Body (Paragraphs, Headings with ##, &amp; Bullet points with •)
                </label>
                <textarea
                  rows={8}
                  value={blogForm.bodyContent}
                  onChange={e => setBlogForm({ ...blogForm, bodyContent: e.target.value })}
                  placeholder={`Write your article paragraphs here separated by blank lines.\n\n## Section Title Example\nThis is paragraph content explaining the design details.\n\n• Key bullet point 1\n• Key bullet point 2\n\n## Conclusion\nSummary and recommendations for homeowners.`}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-3 text-white outline-none focus:border-[#C5A059] font-mono leading-relaxed"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Tip: Separate paragraphs with a blank line. Use <code>## Heading</code> for section titles, and <code>• Bullet</code> for lists.
                </p>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setBlogModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-5 py-2 rounded-lg bg-[#C5A059] hover:bg-[#b08e4d] text-slate-950 font-bold shadow-lg shadow-[#C5A059]/20"
                >
                  {isPending ? 'Saving...' : editingBlog ? 'Save Changes' : 'Publish Blog Article'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ──────────────── MODAL: TESTIMONIAL ──────────────── */}
      {testimonialModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#121c27] border border-slate-700 w-full max-w-xl rounded-2xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <MessageSquareQuote className="w-5 h-5 text-[#C5A059]" />
                {editingTestimonial ? 'Edit Customer Review (Server Action)' : 'Add Customer Review to Homepage'}
              </h3>
              <button onClick={() => setTestimonialModalOpen(false)} className="text-slate-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTestimonial} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Customer / Family Name *</label>
                  <input
                    type="text"
                    required
                    value={testimonialForm.name}
                    onChange={e => setTestimonialForm({ ...testimonialForm, name: e.target.value })}
                    placeholder="e.g. Mrs. Ananya Reddy"
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-white outline-none focus:border-[#C5A059]"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Location / Community *</label>
                  <input
                    type="text"
                    required
                    value={testimonialForm.location}
                    onChange={e => setTestimonialForm({ ...testimonialForm, location: e.target.value })}
                    placeholder="e.g. Banjara Hills, Hyderabad"
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-white outline-none focus:border-[#C5A059]"
                  />
                </div>
              </div>

              {/* Photo Upload with Supabase S3 */}
              <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-800 space-y-2">
                <label className="block text-slate-300 font-semibold">Client Photo / Avatar *</label>
                <div className="flex items-center gap-3">
                  {testimonialForm.image && (
                    <img
                      src={testimonialForm.image}
                      alt="Avatar"
                      className="w-12 h-12 rounded-full object-cover border-2 border-[#C5A059] shrink-0"
                    />
                  )}
                  <input
                    type="text"
                    required
                    value={testimonialForm.image}
                    onChange={e => setTestimonialForm({ ...testimonialForm, image: e.target.value })}
                    placeholder="/testimonial-... or https://..."
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white outline-none focus:border-[#C5A059]"
                  />
                  <label className="px-3 py-2 bg-[#C5A059] hover:bg-[#b08e4d] text-slate-950 font-bold rounded-lg cursor-pointer flex items-center gap-1 shrink-0 transition">
                    <Upload className="w-3.5 h-3.5" />
                    Upload
                    <input
                      ref={testimonialImageInputRef}
                      type="file"
                      accept="image/*"
                      onChange={async e => {
                        if (e.target.files && e.target.files[0]) {
                          const url = await handleServerUpload(e.target.files[0]);
                          if (url) setTestimonialForm({ ...testimonialForm, image: url });
                        }
                      }}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Rating & Display Order */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Star Rating</label>
                  <select
                    value={testimonialForm.rating}
                    onChange={e => setTestimonialForm({ ...testimonialForm, rating: Number(e.target.value) })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-white outline-none focus:border-[#C5A059]"
                  >
                    <option value={5}>5 Stars ★★★★★</option>
                    <option value={4}>4 Stars ★★★★☆</option>
                    <option value={3}>3 Stars ★★★☆☆</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Display Priority Order</label>
                  <input
                    type="number"
                    min="1"
                    value={testimonialForm.displayOrder}
                    onChange={e => setTestimonialForm({ ...testimonialForm, displayOrder: Number(e.target.value) })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-white outline-none focus:border-[#C5A059]"
                  />
                </div>
              </div>

              {/* Quote Text */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Client Review Quote *</label>
                <textarea
                  rows={4}
                  required
                  value={testimonialForm.text}
                  onChange={e => setTestimonialForm({ ...testimonialForm, text: e.target.value })}
                  placeholder="e.g. Finding a passionate team to craft my dream home in Hyderabad was crucial. Anjani Infra exceeded every expectation."
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-3 text-white outline-none focus:border-[#C5A059] leading-relaxed"
                />
              </div>

              {/* Active Toggle */}
              <label className="flex items-center gap-2 cursor-pointer bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                <input
                  type="checkbox"
                  checked={testimonialForm.isActive}
                  onChange={e => setTestimonialForm({ ...testimonialForm, isActive: e.target.checked })}
                  className="w-4 h-4 rounded text-[#C5A059] focus:ring-0 bg-slate-800"
                />
                <span className="text-white font-medium">Display live on Homepage Carousel</span>
              </label>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setTestimonialModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-5 py-2 rounded-lg bg-[#C5A059] hover:bg-[#b08e4d] text-slate-950 font-bold shadow-lg shadow-[#C5A059]/20"
                >
                  {isPending ? 'Saving...' : editingTestimonial ? 'Save Changes' : 'Publish Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
