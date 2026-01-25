import { NextRequest, NextResponse } from 'next/server';
import { proxyGetToBackend, proxyPutToBackend, proxyDeleteToBackend } from '@/lib/backend-client';

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/route-directions/templates/[id]
 * 获取单个路线模板
 */
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const backendResponse = await proxyGetToBackend(`/route-directions/templates/${id}`);
    const data = await backendResponse.json();
    return NextResponse.json(data, { status: backendResponse.status });
  } catch (error) {
    console.error('获取路线模板详情失败:', error);
    return NextResponse.json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: error instanceof Error ? error.message : '获取路线模板详情失败',
      },
    }, { status: 500 });
  }
}

/**
 * PUT /api/route-directions/templates/[id]
 * 更新路线模板
 */
export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const backendResponse = await proxyPutToBackend(`/route-directions/templates/${id}`, body);
    const data = await backendResponse.json();
    return NextResponse.json(data, { status: backendResponse.status });
  } catch (error) {
    console.error('更新路线模板失败:', error);
    return NextResponse.json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: error instanceof Error ? error.message : '更新路线模板失败',
      },
    }, { status: 500 });
  }
}

/**
 * DELETE /api/route-directions/templates/[id]
 * 删除路线模板
 */
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const backendResponse = await proxyDeleteToBackend(`/route-directions/templates/${id}`);
    const data = await backendResponse.json();
    return NextResponse.json(data, { status: backendResponse.status });
  } catch (error) {
    console.error('删除路线模板失败:', error);
    return NextResponse.json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: error instanceof Error ? error.message : '删除路线模板失败',
      },
    }, { status: 500 });
  }
}
