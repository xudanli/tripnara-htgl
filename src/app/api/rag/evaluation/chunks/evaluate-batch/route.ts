import { NextRequest, NextResponse } from 'next/server';
import { proxyPostToBackend } from '@/lib/backend-client';

/**
 * POST /api/rag/evaluation/chunks/evaluate-batch
 * 批量评估 Chunk 检索质量
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const backendResponse = await proxyPostToBackend('/rag/evaluation/chunks/evaluate-batch', body);
    const data = await backendResponse.json();
    return NextResponse.json(data, { status: backendResponse.status });
  } catch (error) {
    console.error('批量评估 Chunk 检索质量失败:', error);
    return NextResponse.json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: error instanceof Error ? error.message : '批量评估 Chunk 检索质量失败' },
    }, { status: 500 });
  }
}
