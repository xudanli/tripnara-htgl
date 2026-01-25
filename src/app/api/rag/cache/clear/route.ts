import { NextRequest, NextResponse } from 'next/server';
import { proxyPostToBackend } from '@/lib/backend-client';

/**
 * POST /api/rag/cache/clear
 * 清空 Embedding 缓存
 */
export async function POST(request: NextRequest) {
  try {
    const backendResponse = await proxyPostToBackend('/rag/cache/clear');
    const data = await backendResponse.json();
    return NextResponse.json(data, { status: backendResponse.status });
  } catch (error) {
    console.error('清空缓存失败:', error);
    return NextResponse.json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: error instanceof Error ? error.message : '清空缓存失败' },
    }, { status: 500 });
  }
}
