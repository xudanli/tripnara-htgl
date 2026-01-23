import { NextRequest, NextResponse } from 'next/server';
import type { CollectQueryPairFromQueryRequest, CollectQueryPairFromQueryResponse, ApiResponse } from '@/types/api';

/**
 * POST /api/rag/query-pairs/collect-from-query
 * 从用户查询自动收集
 */
export async function POST(request: NextRequest) {
  try {
    const body: CollectQueryPairFromQueryRequest = await request.json();

    // 验证必填字段
    if (!body.query || !body.retrievedResults || body.retrievedResults.length === 0) {
      const errorResponse: ApiResponse<never> = {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: '缺少必填字段: query, retrievedResults',
        },
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    // TODO: 实现实际的自动收集逻辑
    // 这里应该：
    // 1. 根据用户反馈（点击、相关、不相关）确定正确答案文档
    // 2. 如果没有用户反馈，可以根据检索结果的score阈值自动判断
    // 3. 保存query-document对到数据库
    // 4. 返回pairId和确定的correctDocumentIds
    
    // 根据用户反馈确定正确答案
    let correctDocumentIds: string[] = [];
    
    if (body.userFeedback) {
      // 优先使用用户标记为相关的文档
      if (body.userFeedback.relevantDocumentIds && body.userFeedback.relevantDocumentIds.length > 0) {
        correctDocumentIds = body.userFeedback.relevantDocumentIds;
      }
      // 如果没有相关文档标记，使用点击的文档
      else if (body.userFeedback.clickedDocumentIds && body.userFeedback.clickedDocumentIds.length > 0) {
        correctDocumentIds = body.userFeedback.clickedDocumentIds;
      }
    }
    
    // 如果没有用户反馈，使用高分的检索结果作为正确答案（简化逻辑）
    if (correctDocumentIds.length === 0) {
      correctDocumentIds = body.retrievedResults
        .filter(r => r.score > 0.7)
        .map(r => r.id);
    }
    
    // 排除用户标记为不相关的文档
    if (body.userFeedback?.irrelevantDocumentIds) {
      const irrelevantSet = new Set(body.userFeedback.irrelevantDocumentIds);
      correctDocumentIds = correctDocumentIds.filter(id => !irrelevantSet.has(id));
    }
    
    const pairId = `pair_${Date.now()}`;
    
    const response: ApiResponse<CollectQueryPairFromQueryResponse> = {
      success: true,
      data: {
        pairId,
        correctDocumentIds,
        message: 'query-document 对已收集',
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    const errorResponse: ApiResponse<never> = {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: error instanceof Error ? error.message : '从用户查询自动收集失败',
      },
    };
    return NextResponse.json(errorResponse, { status: 500 });
  }
}
