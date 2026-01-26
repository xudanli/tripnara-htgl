import { NextRequest, NextResponse } from 'next/server';
import { proxyPatchToBackend } from '@/lib/backend-client';

/**
 * PATCH /api/readiness/admin/packing-guides/:id/activate
 * 激活/停用打包指南 - 代理请求到真实后端服务
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const guideId = params.id;
    const body = await request.json();

    if (!guideId) {
      const errorResponse = {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: '缺少指南ID',
        },
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    // 代理请求到后端服务
    const backendResponse = await proxyPatchToBackend(`/readiness/admin/packing-guides/${guideId}/activate`, body);
    const data = await backendResponse.json();

    // 返回后端服务的响应
    return NextResponse.json(data, { status: backendResponse.status });
  } catch (error) {
    const errorResponse = {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: error instanceof Error ? error.message : '激活/停用打包指南失败',
      },
    };
    return NextResponse.json(errorResponse, { status: 500 });
  }
}
