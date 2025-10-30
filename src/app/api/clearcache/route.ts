import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const CACHE_DIR = path.join(process.cwd(), '.cache', 'analysis');

export async function POST() {
  try {
    // Check if the directory exists
    try {
      await fs.access(CACHE_DIR);
    } catch (error) {
      // Directory doesn't exist, so we can consider the cache "cleared"
      console.log('Cache directory does not exist, nothing to clear.');
      return NextResponse.json({ message: 'Cache already clear' });
    }

    // Read all files in the directory
    const files = await fs.readdir(CACHE_DIR);
    
    // Delete each file
    for (const file of files) {
      await fs.unlink(path.join(CACHE_DIR, file));
    }

    console.log('Cache cleared successfully.');
    return NextResponse.json({ message: 'Cache cleared successfully' });
  } catch (error) {
    console.error('Failed to clear cache:', error);
    return NextResponse.json({ error: 'Failed to clear cache' }, { status: 500 });
  }
}
