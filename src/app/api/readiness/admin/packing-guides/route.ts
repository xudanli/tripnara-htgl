import { NextRequest, NextResponse } from 'next/server';
import { proxyGetToBackend, proxyPostToBackend } from '@/lib/backend-client';

/**
 * GET /api/readiness/admin/packing-guides
 * 获取打包指南列表 - 代理请求到真实后端服务
 */
export async function GET(request: NextRequest) {
  try {
    // 获取查询参数
    const searchParams = request.nextUrl.searchParams;
    const queryParams: Record<string, string | number | boolean> = {};

    searchParams.forEach((value, key) => {
      if (value === 'true') queryParams[key] = true;
      else if (value === 'false') queryParams[key] = false;
      else if (!isNaN(Number(value))) queryParams[key] = Number(value);
      else queryParams[key] = value;
    });

    // 代理请求到后端服务
    const backendResponse = await proxyGetToBackend('/readiness/admin/packing-guides', queryParams);
    const data = await backendResponse.json();

    // 返回后端服务的响应
    return NextResponse.json(data, { status: backendResponse.status });
  } catch (error) {
    const errorResponse = {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: error instanceof Error ? error.message : '获取打包指南列表失败',
      },
    };
    return NextResponse.json(errorResponse, { status: 500 });
  }
}

/**
 * POST /api/readiness/admin/packing-guides
 * 创建打包指南 - 代理请求到真实后端服务
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 代理请求到后端服务
    const backendResponse = await proxyPostToBackend('/readiness/admin/packing-guides', body);
    const data = await backendResponse.json();

    // 返回后端服务的响应
    return NextResponse.json(data, { status: backendResponse.status });
  } catch (error) {
    const errorResponse = {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: error instanceof Error ? error.message : '创建打包指南失败',
      },
    };
    return NextResponse.json(errorResponse, { status: 500 });
  }
}
