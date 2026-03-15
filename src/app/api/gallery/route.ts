import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const GALLERY_JSON = path.join(process.cwd(), 'data', 'gallery.json');
const GALLERY_DIR = path.join(process.cwd(), 'public', 'gallery');

interface GalleryEntry {
  id: string;
  filename: string;
  templateId: string | null;
  createdAt: string;
}

async function readGallery(): Promise<GalleryEntry[]> {
  try {
    const raw = await fs.readFile(GALLERY_JSON, 'utf-8');
    return JSON.parse(raw) as GalleryEntry[];
  } catch {
    return [];
  }
}

export async function GET() {
  const entries = await readGallery();
  // Return newest first, max 50
  return NextResponse.json(entries.slice(-50).reverse());
}

export async function POST(req: NextRequest) {
  const { dataUrl, templateId } = (await req.json()) as {
    dataUrl: string;
    templateId?: string;
  };

  if (!dataUrl?.startsWith('data:image/png;base64,')) {
    return NextResponse.json({ error: 'Invalid data URL' }, { status: 400 });
  }

  await fs.mkdir(GALLERY_DIR, { recursive: true });

  const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  const filename = `${id}.png`;
  const filepath = path.join(GALLERY_DIR, filename);

  const base64 = dataUrl.replace('data:image/png;base64,', '');
  await fs.writeFile(filepath, Buffer.from(base64, 'base64'));

  const entries = await readGallery();
  const entry: GalleryEntry = {
    id,
    filename,
    templateId: templateId ?? null,
    createdAt: new Date().toISOString(),
  };
  entries.push(entry);
  await fs.writeFile(GALLERY_JSON, JSON.stringify(entries, null, 2));

  return NextResponse.json(entry, { status: 201 });
}
