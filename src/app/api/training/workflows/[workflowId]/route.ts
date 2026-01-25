import { NextRequest, NextResponse } from 'next/server';
import { proxyGetToBackend } from '@/lib/backend-client';

/**
 * GET /api/training/workflows/:workflowId
 * 获取工作流状态
 * 代理请求到真实后端服务
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { workflowId: string } }
) {
  try {
    const { workflowId } = params;

    // 代理请求到后端服务
    const backendResponse = await proxyGetToBackend(`/training/workflows/${workflowId}`);
    const data = await backendResponse.json();

    // 返回后端服务的响应
    return NextResponse.json(data, { status: backendResponse.status });
  } catch (error) {
    const errorResponse = {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: error instanceof Error ? error.message : '获取工作流状态失败',
      },
    };
    return NextResponse.json(errorResponse, { status: 500 });
  }
}
