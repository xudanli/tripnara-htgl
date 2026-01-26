import { NextRequest, NextResponse } from 'next/server';
import { proxyGetToBackend, proxyPutToBackend, proxyDeleteToBackend } from '@/lib/backend-client';

/**
 * GET /api/readiness/admin/packs/[id]
 * 获取准备包详情 - 代理请求到真实后端服务
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const packId = params.id;

    if (!packId) {
      const errorResponse = {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: '缺少准备包ID',
        },
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    // 代理请求到后端服务
    const backendResponse = await proxyGetToBackend(`/readiness/admin/packs/${packId}`);
    const data = await backendResponse.json();

    // 返回后端服务的响应
    return NextResponse.json(data, { status: backendResponse.status });
  } catch (error) {
    const errorResponse = {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: error instanceof Error ? error.message : '获取准备包详情失败',
      },
    };
    return NextResponse.json(errorResponse, { status: 500 });
  }
}

/**
 * PUT /api/readiness/admin/packs/[id]
 * 更新准备包 - 代理请求到真实后端服务
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const packId = params.id;
    const body = await request.json();

    if (!packId) {
      const errorResponse = {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: '缺少准备包ID',
        },
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    // 代理请求到后端服务
    const backendResponse = await proxyPutToBackend(`/readiness/admin/packs/${packId}`, body);
    const data = await backendResponse.json();

    // 返回后端服务的响应
    return NextResponse.json(data, { status: backendResponse.status });
  } catch (error) {
    const errorResponse = {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: error instanceof Error ? error.message : '更新准备包失败',
      },
    };
    return NextResponse.json(errorResponse, { status: 500 });
  }
}

/**
 * DELETE /api/readiness/admin/packs/[id]
 * 删除准备包 - 代理请求到真实后端服务
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const packId = params.id;

    if (!packId) {
      const errorResponse = {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: '缺少准备包ID',
        },
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    // 代理请求到后端服务
    const backendResponse = await proxyDeleteToBackend(`/readiness/admin/packs/${packId}`);
    const data = await backendResponse.json();

    // 返回后端服务的响应
    return NextResponse.json(data, { status: backendResponse.status });
  } catch (error) {
    const errorResponse = {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: error instanceof Error ? error.message : '删除准备包失败',
      },
    };
    return NextResponse.json(errorResponse, { status: 500 });
  }
}
