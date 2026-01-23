import { NextRequest, NextResponse } from 'next/server';
import type { CollectQueryPairBatchRequest, CollectQueryPairBatchResponse, ApiResponse } from '@/types/api';

/**
 * POST /api/rag/query-pairs/collect-batch
 * 批量收集 query-document 对
 */
export async function POST(request: NextRequest) {
  try {
    const body: CollectQueryPairBatchRequest = await request.json();

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

    // TODO: 实现实际的批量收集逻辑
    // 这里应该：
    // 1. 批量保存query-document对到数据库
    // 2. 记录每个对的元数据
    // 3. 返回所有pairId和成功数量
    
    const pairIds: string[] = [];
    let successCount = 0;
    
    for (const pair of body.pairs) {
      // 验证每个pair的必填字段
      if (pair.query && pair.correctDocumentIds && pair.correctDocumentIds.length > 0) {
        const pairId = `pair_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        pairIds.push(pairId);
        successCount++;
      }
    }
    
    const response: ApiResponse<CollectQueryPairBatchResponse> = {
      success: true,
      data: {
        pairIds,
        successCount,
        totalCount: body.pairs.length,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    const errorResponse: ApiResponse<never> = {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: error instanceof Error ? error.message : '批量收集 query-document 对失败',
      },
    };
    return NextResponse.json(errorResponse, { status: 500 });
  }
}
