import { NextRequest, NextResponse } from 'next/server';
import { proxyPatchToBackend } from '@/lib/backend-client';

/**
 * PATCH /api/readiness/admin/packing-templates/:id/activate
 * 激活/停用打包清单模板 - 代理请求到真实后端服务
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const templateId = params.id;
    const body = await request.json();

    if (!templateId) {
      const errorResponse = {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: '缺少模板ID',
        },
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    // 代理请求到后端服务
    const backendResponse = await proxyPatchToBackend(`/readiness/admin/packing-templates/${templateId}/activate`, body);
    const data = await backendResponse.json();

    // 返回后端服务的响应
    return NextResponse.json(data, { status: backendResponse.status });
  } catch (error) {
    const errorResponse = {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: error instanceof Error ? error.message : '激活/停用打包清单模板失败',
      },
    };
    return NextResponse.json(errorResponse, { status: 500 });
  }
}
