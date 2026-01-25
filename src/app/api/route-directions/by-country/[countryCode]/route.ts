import { NextRequest, NextResponse } from 'next/server';
import { proxyGetToBackend } from '@/lib/backend-client';

interface RouteContext {
  params: Promise<{ countryCode: string }>;
}

/**
 * GET /api/route-directions/by-country/[countryCode]
 * 按国家获取路线方向
 */
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { countryCode } = await context.params;
    const searchParams = request.nextUrl.searchParams;
    const queryParams: Record<string, string | number | boolean> = {};

    searchParams.forEach((value, key) => {
      if (value === 'true') queryParams[key] = true;
      else if (value === 'false') queryParams[key] = false;
      else if (!isNaN(Number(value)) && value !== '') queryParams[key] = Number(value);
      else queryParams[key] = value;
    });

    const backendResponse = await proxyGetToBackend(`/route-directions/by-country/${countryCode}`, queryParams);
    const data = await backendResponse.json();
    return NextResponse.json(data, { status: backendResponse.status });
  } catch (error) {
    console.error('按国家获取路线方向失败:', error);
    return NextResponse.json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: error instanceof Error ? error.message : '按国家获取路线方向失败',
      },
    }, { status: 500 });
  }
}
