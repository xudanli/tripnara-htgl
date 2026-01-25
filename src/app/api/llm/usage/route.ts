import { NextRequest, NextResponse } from 'next/server';
import { proxyGetToBackend } from '@/lib/backend-client';

/**
 * GET /api/llm/usage
 * 获取 Token 使用统计
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const params: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      params[key] = value;
    });

    const backendResponse = await proxyGetToBackend('/llm/usage', params);
    const data = await backendResponse.json();
    return NextResponse.json(data, { status: backendResponse.status });
  } catch (error) {
    console.error('获取 LLM Token 使用统计失败:', error);
    return NextResponse.json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: error instanceof Error ? error.message : '获取 LLM Token 使用统计失败' },
    }, { status: 500 });
  }
}
