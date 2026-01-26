import { NextRequest, NextResponse } from 'next/server';
import { proxyPostToBackend } from '@/lib/backend-client';

/**
 * POST /api/contact/admin/messages/[id]/reply
 * 回复消息 - 代理请求到真实后端服务
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      const errorResponse = {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: '缺少消息ID',
        },
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    const body = await request.json();

    // 代理请求到后端服务
    const backendResponse = await proxyPostToBackend(`/contact/admin/messages/${id}/reply`, body);
    const data = await backendResponse.json();

    // 返回后端服务的响应
    return NextResponse.json(data, { status: backendResponse.status });
  } catch (error) {
    const errorResponse = {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: error instanceof Error ? error.message : '回复消息失败',
      },
    };
    return NextResponse.json(errorResponse, { status: 500 });
  }
}
