import { NextRequest, NextResponse } from 'next/server';
import { proxyPostToBackend } from '@/lib/backend-client';

/**
 * POST /api/readiness/admin/packing-guides/batch-import
 * 批量导入打包指南 - 代理请求到真实后端服务
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 代理请求到后端服务
    const backendResponse = await proxyPostToBackend('/readiness/admin/packing-guides/batch-import', body);
    const data = await backendResponse.json();

    // 返回后端服务的响应
    return NextResponse.json(data, { status: backendResponse.status });
  } catch (error) {
    const errorResponse = {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: error instanceof Error ? error.message : '批量导入打包指南失败',
      },
    };
    return NextResponse.json(errorResponse, { status: 500 });
  }
}
