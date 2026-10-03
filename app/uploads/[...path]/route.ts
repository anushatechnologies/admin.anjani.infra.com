import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

function getContentType(filename: string): string {
  const ext = path.extname(filename).toLowerCase();
  switch (ext) {
    case '.png': return 'image/png';
    case '.jpg':
    case '.jpeg': return 'image/jpeg';
    case '.webp': return 'image/webp';
    case '.gif': return 'image/gif';
    case '.svg': return 'image/svg+xml';
    case '.mp4': return 'video/mp4';
    case '.webm': return 'video/webm';
    case '.mp3': return 'audio/mpeg';
    default: return 'application/octet-stream';
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { path?: string[] } }
) {
  try {
    const rawPath = params.path ? params.path.join('/') : '';
    if (!rawPath) {
      return NextResponse.redirect(new URL('/anjani-logo.png', request.url), 307);
    }

    const safeFilename = path.basename(rawPath);

    // 1. Try local filesystem (public/uploads)
    try {
      const localFilePath = path.join(process.cwd(), 'public', 'uploads', safeFilename);
      if (fs.existsSync(localFilePath)) {
        const fileBuffer = await fs.promises.readFile(localFilePath);
        return new NextResponse(fileBuffer, {
          headers: {
            'Content-Type': getContentType(safeFilename),
            'Cache-Control': 'public, max-age=31536000, immutable',
          },
        });
      }
    } catch {
      // Serverless local filesystem check failed, proceed to storage
    }

    // 2. Redirect to Supabase Storage CDN
    const { data: urlData } = supabaseAdmin.storage
      .from('anjani-media')
      .getPublicUrl(safeFilename);

    if (urlData?.publicUrl) {
      return NextResponse.redirect(urlData.publicUrl, 307);
    }

    // 3. Graceful fallback to avoid broken 404 console errors
    return NextResponse.redirect(new URL('/anjani-logo.png', request.url), 307);
  } catch (error) {
    console.error('Error serving upload route:', error);
    return NextResponse.redirect(new URL('/anjani-logo.png', request.url), 307);
  }
}
