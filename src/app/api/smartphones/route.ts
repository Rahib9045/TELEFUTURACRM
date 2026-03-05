import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        // Read directly from the file system to avoid build-time caching
        const filePath = path.join(process.cwd(), 'src/data/smartphones.json');
        const fileContents = fs.readFileSync(filePath, 'utf8');
        const data = JSON.parse(fileContents);
        return NextResponse.json(data);
    } catch (error) {
        console.error("Error reading smartphones.json:", error);
        return NextResponse.json({ error: 'Failed to load smartphones data' }, { status: 500 });
    }
}
