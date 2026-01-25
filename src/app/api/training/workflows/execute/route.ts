import { NextRequest, NextResponse } from 'next/server';
import { proxyPostToBackend } from '@/lib/backend-client';

/**
 * POST /api/training/workflows/execute
 * 执行迭代部署工作流
 * 代理请求到真实后端服务
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 代理请求到后端服务
    const backendResponse = await proxyPostToBackend('/training/workflows/execute', body);
    const data = await backendResponse.json();

    // 返回后端服务的响应
    return NextResponse.json(data, { status: backendResponse.status });
  } catch (error) {
    const errorResponse = {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: error instanceof Error ? error.message : '执行工作流失败',
      },
    };
    return NextResponse.json(errorResponse, { status: 500 });
  }
}
