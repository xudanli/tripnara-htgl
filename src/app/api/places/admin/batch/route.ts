import { NextRequest, NextResponse } from 'next/server';
import { proxyPostToBackend } from '@/lib/backend-client';

/**
 * POST /api/places/admin/batch
 * 批量获取POI详情
 * 根据POI ID数组批量获取POI详情，用于在日计划中显示已选POI的完整信息
 * 
 * 请求体:
 * {
 *   "ids": [381040, 381086, 381037]
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    if (!body.ids || !Array.isArray(body.ids) || body.ids.length === 0) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: '缺少POI ID数组或数组为空',
        },
      }, { status: 400 });
    }
    
    // 代理请求到后端服务
    const backendResponse = await proxyPostToBackend('/places/admin/batch', body);
    const data = await backendResponse.json();
    return NextResponse.json(data, { status: backendResponse.status });
  } catch (error) {
    console.error('批量获取POI详情失败:', error);
    return NextResponse.json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: error instanceof Error ? error.message : '批量获取POI详情失败',
      },
    }, { status: 500 });
  }
}
