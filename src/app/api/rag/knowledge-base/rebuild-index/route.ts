import { NextRequest, NextResponse } from 'next/server';
import { proxyPostToBackend } from '@/lib/backend-client';

/**
 * POST /api/rag/knowledge-base/rebuild-index
 * 重建知识库索引（完整重建）
 */
export async function POST(request: NextRequest) {
  try {
    const backendResponse = await proxyPostToBackend('/rag/knowledge-base/rebuild-index');
    const data = await backendResponse.json();
    return NextResponse.json(data, { status: backendResponse.status });
  } catch (error) {
    console.error('重建知识库索引失败:', error);
    return NextResponse.json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: error instanceof Error ? error.message : '重建知识库索引失败' },
    }, { status: 500 });
  }
}
