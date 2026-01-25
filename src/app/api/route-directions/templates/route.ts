import { NextRequest, NextResponse } from 'next/server';
import { proxyGetToBackend, proxyPostToBackend } from '@/lib/backend-client';

/**
 * GET /api/route-directions/templates
 * 获取路线模板列表
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const queryParams: Record<string, string | number | boolean> = {};

    searchParams.forEach((value, key) => {
      if (value === 'true') queryParams[key] = true;
      else if (value === 'false') queryParams[key] = false;
      else if (!isNaN(Number(value)) && value !== '') queryParams[key] = Number(value);
      else queryParams[key] = value;
    });

    const backendResponse = await proxyGetToBackend('/route-directions/templates', queryParams);
    const data = await backendResponse.json();
    return NextResponse.json(data, { status: backendResponse.status });
  } catch (error) {
    console.error('获取路线模板列表失败:', error);
    return NextResponse.json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: error instanceof Error ? error.message : '获取路线模板列表失败',
      },
    }, { status: 500 });
  }
}

/**
 * POST /api/route-directions/templates
 * 创建路线模板
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const backendResponse = await proxyPostToBackend('/route-directions/templates', body);
    const data = await backendResponse.json();
    return NextResponse.json(data, { status: backendResponse.status });
  } catch (error) {
    console.error('创建路线模板失败:', error);
    return NextResponse.json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: error instanceof Error ? error.message : '创建路线模板失败',
      },
    }, { status: 500 });
  }
}
