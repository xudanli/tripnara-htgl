import { NextRequest, NextResponse } from 'next/server';
import { proxyGetToBackend } from '@/lib/backend-client';

/**
 * GET /api/rag/query-pairs
 * 获取收集的 query-document 对列表
 * 代理请求到真实后端服务
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    // 构建查询参数对象
    const params: Record<string, string> = {};
    if (searchParams.get('source')) params.source = searchParams.get('source')!;
    if (searchParams.get('collection')) params.collection = searchParams.get('collection')!;
    if (searchParams.get('countryCode')) params.countryCode = searchParams.get('countryCode')!;
    if (searchParams.get('limit')) params.limit = searchParams.get('limit')!;

    // 代理请求到后端服务
    const backendResponse = await proxyGetToBackend('/rag/query-pairs', params);
    const data = await backendResponse.json();

    // 返回后端服务的响应
    return NextResponse.json(data, { status: backendResponse.status });
  } catch (error) {
    console.error('代理请求到后端服务失败:', error);
    const errorResponse = {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: error instanceof Error ? error.message : '获取 query-document 对失败',
        details: error instanceof Error ? error.stack : String(error),
      },
    };
    return NextResponse.json(errorResponse, { status: 500 });
  }
}
