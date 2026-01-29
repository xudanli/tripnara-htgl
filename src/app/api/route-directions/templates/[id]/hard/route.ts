import { NextRequest, NextResponse } from 'next/server';
import { proxyDeleteToBackend } from '@/lib/backend-client';

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * DELETE /api/route-directions/templates/[id]/hard
 * 物理删除路线模板（从数据库彻底删除）
 */
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const backendResponse = await proxyDeleteToBackend(`/route-directions/templates/${id}/hard`);
    const data = await backendResponse.json();
    return NextResponse.json(data, { status: backendResponse.status });
  } catch (error) {
    console.error('物理删除路线模板失败:', error);
    return NextResponse.json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: error instanceof Error ? error.message : '物理删除路线模板失败',
      },
    }, { status: 500 });
  }
}
