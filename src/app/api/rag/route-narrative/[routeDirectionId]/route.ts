import { NextRequest, NextResponse } from 'next/server';
import { proxyGetToBackend } from '@/lib/backend-client';

/**
 * GET /api/rag/route-narrative/:routeDirectionId
 * 生成路线叙事
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { routeDirectionId: string } }
) {
  try {
    const { routeDirectionId } = params;
    const searchParams = request.nextUrl.searchParams;
    const queryParams: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      queryParams[key] = value;
    });

    const backendResponse = await proxyGetToBackend(`/rag/route-narrative/${routeDirectionId}`, queryParams);
    const data = await backendResponse.json();
    return NextResponse.json(data, { status: backendResponse.status });
  } catch (error) {
    console.error('生成路线叙事失败:', error);
    return NextResponse.json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: error instanceof Error ? error.message : '生成路线叙事失败' },
    }, { status: 500 });
  }
}
