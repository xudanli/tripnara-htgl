import { NextRequest, NextResponse } from 'next/server';
import { proxyGetToBackend, proxyPostToBackend, proxyPutToBackend, proxyDeleteToBackend } from '@/lib/backend-client';

/**
 * GET /api/readiness/admin/packs
 * 获取准备包列表 - 代理请求到真实后端服务
 */
export async function GET(request: NextRequest) {
  try {
    // 获取查询参数
    const searchParams = request.nextUrl.searchParams;
    const queryParams: Record<string, string | number | boolean> = {};

    searchParams.forEach((value, key) => {
      if (value === 'true') queryParams[key] = true;
      else if (value === 'false') queryParams[key] = false;
      else if (!isNaN(Number(value))) queryParams[key] = Number(value);
      else queryParams[key] = value;
    });

    // 代理请求到后端服务
    const backendResponse = await proxyGetToBackend('/readiness/admin/packs', queryParams);
    const data = await backendResponse.json();

    // 返回后端服务的响应
    return NextResponse.json(data, { status: backendResponse.status });
  } catch (error) {
    const errorResponse = {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: error instanceof Error ? error.message : '获取准备包列表失败',
      },
    };
    return NextResponse.json(errorResponse, { status: 500 });
  }
}

/**
 * POST /api/readiness/admin/packs
 * 创建准备包 - 代理请求到真实后端服务
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 代理请求到后端服务
    const backendResponse = await proxyPostToBackend('/readiness/admin/packs', body);
    const data = await backendResponse.json();

    // 返回后端服务的响应
    return NextResponse.json(data, { status: backendResponse.status });
  } catch (error) {
    const errorResponse = {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: error instanceof Error ? error.message : '创建准备包失败',
      },
    };
    return NextResponse.json(errorResponse, { status: 500 });
  }
}

/**
 * PUT /api/readiness/admin/packs/[id]
 * 更新准备包 - 代理请求到真实后端服务
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const pathSegments = request.nextUrl.pathname.split('/');
    const packId = pathSegments[pathSegments.length - 1];

    if (!packId || packId === 'packs') {
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
export async function DELETE(request: NextRequest) {
  try {
    const pathSegments = request.nextUrl.pathname.split('/');
    const packId = pathSegments[pathSegments.length - 1];

    if (!packId || packId === 'packs') {
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
