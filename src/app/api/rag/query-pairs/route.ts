import { NextRequest, NextResponse } from 'next/server';
import type { GetQueryPairsParams, GetQueryPairsResponse, ApiResponse, QueryPair } from '@/types/api';

/**
 * GET /api/rag/query-pairs
 * 获取收集的 query-document 对列表
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    // 解析查询参数
    const params: GetQueryPairsParams = {
      source: searchParams.get('source') as GetQueryPairsParams['source'] || undefined,
      collection: searchParams.get('collection') || undefined,
      countryCode: searchParams.get('countryCode') || undefined,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!, 10) : 100,
    };

    // TODO: 实现实际的查询逻辑
    // 这里应该：
    // 1. 从数据库查询query-document对
    // 2. 根据source, collection, countryCode等参数过滤
    // 3. 应用limit限制
    // 4. 返回查询结果
    
    // 模拟查询结果
    const pairs: QueryPair[] = [
      {
        id: 'pair_1705834567890',
        query: '冰岛 F-road 需要什么车辆？',
        correctDocumentIds: ['doc-123', 'doc-456'],
        metadata: {
          source: 'MANUAL_ANNOTATION',
          collection: 'compliance',
          countryCode: 'IS',
          timestamp: new Date().toISOString(),
        },
      },
    ];
    
    const response: ApiResponse<GetQueryPairsResponse> = {
      success: true,
      data: {
        pairs,
        total: pairs.length,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    const errorResponse: ApiResponse<never> = {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: error instanceof Error ? error.message : '获取 query-document 对失败',
      },
    };
    return NextResponse.json(errorResponse, { status: 500 });
  }
}
