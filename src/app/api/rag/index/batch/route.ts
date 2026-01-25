import { NextRequest, NextResponse } from 'next/server';
import { proxyPostToBackend } from '@/lib/backend-client';

/**
 * POST /api/rag/index/batch
 * 批量索引文档
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const backendResponse = await proxyPostToBackend('/rag/index/batch', body);
    const data = await backendResponse.json();
    return NextResponse.json(data, { status: backendResponse.status });
  } catch (error) {
    console.error('批量索引文档失败:', error);
    return NextResponse.json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: error instanceof Error ? error.message : '批量索引文档失败' },
    }, { status: 500 });
  }
}
