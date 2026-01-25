import { NextRequest, NextResponse } from 'next/server';
import { proxyGetToBackend } from '@/lib/backend-client';

/**
 * GET /api/rag/evaluation/testset/list-chunks
 * 列出所有 chunks（用于浏览和选择 groundTruthChunkIds）
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const params: Record<string, string> = {};
    if (searchParams.get('limit')) params.limit = searchParams.get('limit')!;

    const backendResponse = await proxyGetToBackend('/rag/evaluation/testset/list-chunks', params);
    const data = await backendResponse.json();
    return NextResponse.json(data, { status: backendResponse.status });
  } catch (error) {
    console.error('列出 chunks 失败:', error);
    return NextResponse.json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: error instanceof Error ? error.message : '列出 chunks 失败' },
    }, { status: 500 });
  }
}
