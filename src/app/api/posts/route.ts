import { NextResponse } from 'next/server';
import { getRecentPosts } from '@/lib/posts';

export async function GET() {
  // 只在服务端运行，可安全使用 fs
  const posts = getRecentPosts(3);
  return NextResponse.json(posts);
}
