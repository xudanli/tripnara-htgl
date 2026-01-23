import { NextRequest, NextResponse } from 'next/server';
import type { ExportQueryPairsForEvaluationRequest, ExportQueryPairsForEvaluationResponse, ApiResponse } from '@/types/api';

/**
 * POST /api/rag/query-pairs/export-for-evaluation
 * 导出为评估数据集格式
 */
export async function POST(request: NextRequest) {
  try {
    const body: ExportQueryPairsForEvaluationRequest = await request.json();

    // 验证必填字段
    if (!body.pairs || body.pairs.length === 0) {
      const errorResponse: ApiResponse<never> = {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: '缺少必填字段: pairs',
        },
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    // TODO: 实现实际的导出逻辑
    // 这里应该：
    // 1. 将query-document对转换为评估数据集格式
    // 2. 可以支持不同的导出格式（JSON, JSONL等）
    // 3. 返回评估数据集
    
    // 转换为评估数据集格式
    const evaluationDataset = body.pairs.map(pair => ({
      query: pair.query,
      ground_truth_document_ids: pair.correctDocumentIds,
    }));
    
    const response: ApiResponse<ExportQueryPairsForEvaluationResponse> = {
      success: true,
      data: {
        evaluationDataset,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    const errorResponse: ApiResponse<never> = {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: error instanceof Error ? error.message : '导出评估数据集失败',
      },
    };
    return NextResponse.json(errorResponse, { status: 500 });
  }
}
