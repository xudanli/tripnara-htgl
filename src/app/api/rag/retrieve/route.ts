import { NextRequest, NextResponse } from 'next/server';
import { proxyGetToBackend, proxyPostToBackend } from '@/lib/backend-client';

/**
 * GET /api/rag/retrieve
 * 检索文档（旧接口，保留兼容性）
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const params: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      params[key] = value;
    });

    const backendResponse = await proxyGetToBackend('/rag/retrieve', params);
    const data = await backendResponse.json();
    return NextResponse.json(data, { status: backendResponse.status });
  } catch (error) {
    console.error('检索文档失败:', error);
    return NextResponse.json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: error instanceof Error ? error.message : '检索文档失败' },
    }, { status: 500 });
  }
}

/**
 * POST /api/rag/retrieve
 * RAG查询检索（支持5层降级策略）
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // 使用 chunks/retrieve 接口（支持降级策略）
    const backendResponse = await proxyPostToBackend('/rag/chunks/retrieve', {
      query: body.query,
      category: body.category,
      limit: body.options?.topK || 5,
      credibilityMin: body.options?.minScore || 0.7,
      useReranking: body.options?.enableReranking !== false,
      useQueryExpansion: body.options?.enableQueryExpansion === true,
    });
    
    const data = await backendResponse.json();
    return NextResponse.json(data, { status: backendResponse.status });
  } catch (error) {
    console.error('RAG检索失败:', error);
    return NextResponse.json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: error instanceof Error ? error.message : 'RAG检索失败' },
    }, { status: 500 });
  }
}
