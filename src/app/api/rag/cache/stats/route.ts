import { NextRequest, NextResponse } from 'next/server';
import { proxyGetToBackend } from '@/lib/backend-client';

/**
 * GET /api/rag/cache/stats
 * 获取 Embedding 缓存统计
 */
export async function GET(request: NextRequest) {
  try {
    const backendResponse = await proxyGetToBackend('/rag/cache/stats');
    const data = await backendResponse.json();
    return NextResponse.json(data, { status: backendResponse.status });
  } catch (error) {
    console.error('获取缓存统计失败:', error);
    return NextResponse.json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: error instanceof Error ? error.message : '获取缓存统计失败' },
    }, { status: 500 });
  }
}
