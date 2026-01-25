import { NextRequest, NextResponse } from 'next/server';
import { proxyPostToBackend } from '@/lib/backend-client';

/**
 * POST /api/places/images/save
 * 保存 Unsplash 图片到数据库
 * 将从批量图片接口获取的 Unsplash 图片下载并上传到 OSS，然后保存到指定地点
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // 验证请求体
    if (!body.placeId) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: '缺少地点ID',
        },
      }, { status: 400 });
    }

    if (!body.photo) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: '缺少图片数据',
        },
      }, { status: 400 });
    }

    // 代理请求到后端服务
    const backendResponse = await proxyPostToBackend('/places/images/save', body);
    const data = await backendResponse.json();
    return NextResponse.json(data, { status: backendResponse.status });
  } catch (error) {
    console.error('保存 Unsplash 图片失败:', error);
    return NextResponse.json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: error instanceof Error ? error.message : '保存图片失败',
      },
    }, { status: 500 });
  }
}
