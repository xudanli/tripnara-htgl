import { NextRequest, NextResponse } from 'next/server';
import { proxyPostToBackend } from '@/lib/backend-client';

/**
 * POST /api/route-directions/import-pack
 * 导入路线包
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const backendResponse = await proxyPostToBackend('/route-directions/import-pack', body);
    const data = await backendResponse.json();
    return NextResponse.json(data, { status: backendResponse.status });
  } catch (error) {
    console.error('导入路线包失败:', error);
    return NextResponse.json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: error instanceof Error ? error.message : '导入路线包失败',
      },
    }, { status: 500 });
  }
}
