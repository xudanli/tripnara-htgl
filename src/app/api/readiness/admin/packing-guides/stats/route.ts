import { NextRequest, NextResponse } from 'next/server';
import { proxyGetToBackend } from '@/lib/backend-client';

/**
 * GET /api/readiness/admin/packing-guides/stats
 * 获取打包指南统计信息 - 代理请求到真实后端服务
 */
export async function GET(request: NextRequest) {
  try {
    // 代理请求到后端服务
    const backendResponse = await proxyGetToBackend('/readiness/admin/packing-guides/stats');
    const data = await backendResponse.json();

    // 返回后端服务的响应
    return NextResponse.json(data, { status: backendResponse.status });
  } catch (error) {
    const errorResponse = {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: error instanceof Error ? error.message : '获取打包指南统计信息失败',
      },
    };
    return NextResponse.json(errorResponse, { status: 500 });
  }
}
