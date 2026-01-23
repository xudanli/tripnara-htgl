import { NextRequest, NextResponse } from 'next/server';
import type { CollectQueryPairRequest, CollectQueryPairResponse, ApiResponse } from '@/types/api';

/**
 * POST /api/rag/query-pairs/collect
 * 收集 query-document 对
 */
export async function POST(request: NextRequest) {
  try {
    const body: CollectQueryPairRequest = await request.json();

    // 验证必填字段
    if (!body.query || !body.correctDocumentIds || body.correctDocumentIds.length === 0) {
      const errorResponse: ApiResponse<never> = {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: '缺少必填字段: query, correctDocumentIds',
        },
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    // TODO: 实现实际的query-document对收集逻辑
    // 这里应该：
    // 1. 将query-document对保存到数据库
    // 2. 记录元数据（source, userId, sessionId等）
    // 3. 返回pairId
    
    const pairId = `pair_${Date.now()}`;
    
    const response: ApiResponse<CollectQueryPairResponse> = {
      success: true,
      data: {
        pairId,
        message: 'query-document 对已收集',
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    const errorResponse: ApiResponse<never> = {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: error instanceof Error ? error.message : '收集 query-document 对失败',
      },
    };
    return NextResponse.json(errorResponse, { status: 500 });
  }
}
