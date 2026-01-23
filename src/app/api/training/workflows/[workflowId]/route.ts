import { NextRequest, NextResponse } from 'next/server';
import type { GetWorkflowStatusResponse, ApiResponse } from '@/types/api';

/**
 * GET /api/training/workflows/:workflowId
 * 获取工作流状态
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { workflowId: string } }
) {
  try {
    const { workflowId } = params;

    // TODO: 实现实际的工作流状态查询逻辑
    // 这里应该从数据库或缓存中查询工作流状态
    
    // 模拟工作流状态
    const response: ApiResponse<GetWorkflowStatusResponse> = {
      success: true,
      data: {
        workflowId,
        status: 'RUNNING',
        currentStep: 'start_training',
        steps: [
          {
            step: 'prepare_training_data',
            status: 'SUCCESS' as const,
          },
          {
            step: 'create_training_job',
            status: 'SUCCESS' as const,
          },
          {
            step: 'start_training',
            status: 'RUNNING' as const,
          },
        ],
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    const errorResponse: ApiResponse<never> = {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: error instanceof Error ? error.message : '获取工作流状态失败',
      },
    };
    return NextResponse.json(errorResponse, { status: 500 });
  }
}
