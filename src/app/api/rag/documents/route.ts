import { NextRequest, NextResponse } from 'next/server';
import { proxyGetToBackend } from '@/lib/backend-client';

/**
 * GET /api/rag/documents
 * 获取 RAG 文档列表
 * 代理请求到真实后端服务
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    // 构建查询参数对象
    const params: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      params[key] = value;
    });

    // 代理请求到后端服务
    const backendResponse = await proxyGetToBackend('/rag/documents', params);
    const data = await backendResponse.json();

    // 返回后端服务的响应
    return NextResponse.json(data, { status: backendResponse.status });
  } catch (error) {
    console.error('获取 RAG 文档列表失败:', error);
    const errorResponse = {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: error instanceof Error ? error.message : '获取 RAG 文档列表失败',
      },
    };
    return NextResponse.json(errorResponse, { status: 500 });
  }
}
