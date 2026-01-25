import { NextRequest, NextResponse } from 'next/server';
import { proxyGetToBackend, proxyPutToBackend, proxyDeleteToBackend } from '@/lib/backend-client';

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/places/admin/[id]
 * 获取单个地点详情 - 代理请求到真实后端服务
 */
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    if (!id) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: '缺少地点ID',
        },
      }, { status: 400 });
    }

    // 代理请求到后端服务
    const backendResponse = await proxyGetToBackend(`/places/admin/${id}`);
    const data = await backendResponse.json();

    // 返回后端服务的响应
    return NextResponse.json(data, { status: backendResponse.status });
  } catch (error) {
    console.error('获取地点详情失败:', error);
    return NextResponse.json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: error instanceof Error ? error.message : '获取地点详情失败',
      },
    }, { status: 500 });
  }
}

/**
 * PUT /api/places/admin/[id]
 * 更新地点信息 - 代理请求到真实后端服务
 */
export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    if (!id) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: '缺少地点ID',
        },
      }, { status: 400 });
    }

    const body = await request.json();

    // 代理请求到后端服务
    const backendResponse = await proxyPutToBackend(`/places/admin/${id}`, body);
    const data = await backendResponse.json();

    // 返回后端服务的响应
    return NextResponse.json(data, { status: backendResponse.status });
  } catch (error) {
    console.error('更新地点失败:', error);
    return NextResponse.json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: error instanceof Error ? error.message : '更新地点信息失败',
      },
    }, { status: 500 });
  }
}

/**
 * DELETE /api/places/admin/[id]
 * 删除地点 - 代理请求到真实后端服务
 */
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    if (!id) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: '缺少地点ID',
        },
      }, { status: 400 });
    }

    // 代理请求到后端服务
    const backendResponse = await proxyDeleteToBackend(`/places/admin/${id}`);
    const data = await backendResponse.json();

    // 返回后端服务的响应
    return NextResponse.json(data, { status: backendResponse.status });
  } catch (error) {
    console.error('删除地点失败:', error);
    return NextResponse.json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: error instanceof Error ? error.message : '删除地点失败',
      },
    }, { status: 500 });
  }
}
