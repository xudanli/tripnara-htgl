import { NextRequest, NextResponse } from 'next/server';
import { proxyGetToBackend, proxyPutToBackend, proxyDeleteToBackend } from '@/lib/backend-client';

/**
 * GET /api/readiness/admin/packing-guides/:id
 * 获取打包指南详情 - 代理请求到真实后端服务
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const guideId = params.id;

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
    const backendResponse = await proxyGetToBackend(`/readiness/admin/packing-guides/${guideId}`);
    const data = await backendResponse.json();

    // 返回后端服务的响应
    return NextResponse.json(data, { status: backendResponse.status });
  } catch (error) {
    const errorResponse = {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: error instanceof Error ? error.message : '获取打包指南详情失败',
      },
    };
    return NextResponse.json(errorResponse, { status: 500 });
  }
}

/**
 * PUT /api/readiness/admin/packing-guides/:id
 * 更新打包指南 - 代理请求到真实后端服务
 */
export async function PUT(
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
    const backendResponse = await proxyPutToBackend(`/readiness/admin/packing-guides/${guideId}`, body);
    const data = await backendResponse.json();

    // 返回后端服务的响应
    return NextResponse.json(data, { status: backendResponse.status });
  } catch (error) {
    const errorResponse = {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: error instanceof Error ? error.message : '更新打包指南失败',
      },
    };
    return NextResponse.json(errorResponse, { status: 500 });
  }
}

/**
 * DELETE /api/readiness/admin/packing-guides/:id
 * 删除打包指南（软删除） - 代理请求到真实后端服务
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const guideId = params.id;

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
    const backendResponse = await proxyDeleteToBackend(`/readiness/admin/packing-guides/${guideId}`);
    const data = await backendResponse.json();

    // 返回后端服务的响应
    return NextResponse.json(data, { status: backendResponse.status });
  } catch (error) {
    const errorResponse = {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: error instanceof Error ? error.message : '删除打包指南失败',
      },
    };
    return NextResponse.json(errorResponse, { status: 500 });
  }
}
