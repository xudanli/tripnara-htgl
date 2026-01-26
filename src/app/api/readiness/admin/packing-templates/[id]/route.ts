import { NextRequest, NextResponse } from 'next/server';
import { proxyGetToBackend, proxyPutToBackend, proxyDeleteToBackend } from '@/lib/backend-client';

/**
 * GET /api/readiness/admin/packing-templates/:id
 * 获取打包清单模板详情 - 代理请求到真实后端服务
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const templateId = params.id;

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
    const backendResponse = await proxyGetToBackend(`/readiness/admin/packing-templates/${templateId}`);
    const data = await backendResponse.json();

    // 返回后端服务的响应
    return NextResponse.json(data, { status: backendResponse.status });
  } catch (error) {
    const errorResponse = {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: error instanceof Error ? error.message : '获取打包清单模板详情失败',
      },
    };
    return NextResponse.json(errorResponse, { status: 500 });
  }
}

/**
 * PUT /api/readiness/admin/packing-templates/:id
 * 更新打包清单模板 - 代理请求到真实后端服务
 */
export async function PUT(
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
    const backendResponse = await proxyPutToBackend(`/readiness/admin/packing-templates/${templateId}`, body);
    const data = await backendResponse.json();

    // 返回后端服务的响应
    return NextResponse.json(data, { status: backendResponse.status });
  } catch (error) {
    const errorResponse = {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: error instanceof Error ? error.message : '更新打包清单模板失败',
      },
    };
    return NextResponse.json(errorResponse, { status: 500 });
  }
}

/**
 * DELETE /api/readiness/admin/packing-templates/:id
 * 删除打包清单模板（软删除） - 代理请求到真实后端服务
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const templateId = params.id;

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
    const backendResponse = await proxyDeleteToBackend(`/readiness/admin/packing-templates/${templateId}`);
    const data = await backendResponse.json();

    // 返回后端服务的响应
    return NextResponse.json(data, { status: backendResponse.status });
  } catch (error) {
    const errorResponse = {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: error instanceof Error ? error.message : '删除打包清单模板失败',
      },
    };
    return NextResponse.json(errorResponse, { status: 500 });
  }
}
