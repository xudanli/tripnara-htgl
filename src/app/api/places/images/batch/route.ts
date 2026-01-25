import { NextRequest, NextResponse } from 'next/server';
import { proxyPostToBackend } from '@/lib/backend-client';

/**
 * POST /api/places/images/batch
 * 批量获取 Unsplash 图片
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // 验证请求体
    if (!body.places || !Array.isArray(body.places) || body.places.length === 0) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'places 数组不能为空',
        },
      }, { status: 400 });
    }

    if (body.places.length > 20) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'places 数组长度不能超过 20',
        },
      }, { status: 400 });
    }

    // 代理请求到后端服务
    const backendResponse = await proxyPostToBackend('/places/images/batch', body);
    const data = await backendResponse.json();
    return NextResponse.json(data, { status: backendResponse.status });
  } catch (error) {
    console.error('批量获取 Unsplash 图片失败:', error);
    return NextResponse.json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: error instanceof Error ? error.message : '批量获取图片失败',
      },
    }, { status: 500 });
  }
}
