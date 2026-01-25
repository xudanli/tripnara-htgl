import { NextRequest, NextResponse } from 'next/server';
import { proxyGetToBackend } from '@/lib/backend-client';

/**
 * GET /api/route-directions/cards
 * 获取路线方向卡片列表
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

    const backendResponse = await proxyGetToBackend('/route-directions/cards', queryParams);
    const data = await backendResponse.json();
    return NextResponse.json(data, { status: backendResponse.status });
  } catch (error) {
    console.error('获取路线方向卡片失败:', error);
    return NextResponse.json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: error instanceof Error ? error.message : '获取路线方向卡片失败',
      },
    }, { status: 500 });
  }
}
