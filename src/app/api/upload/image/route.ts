import { NextRequest, NextResponse } from 'next/server';
import { proxyFormDataToBackend } from '@/lib/backend-client';

/**
 * POST /api/upload/image
 * 上传单张图片到 OSS
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    // 验证是否有文件
    const file = formData.get('file');
    if (!file) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: '请选择要上传的图片文件',
        },
      }, { status: 400 });
    }

    const backendResponse = await proxyFormDataToBackend('/upload/image', formData);
    const data = await backendResponse.json();
    return NextResponse.json(data, { status: backendResponse.status });
  } catch (error) {
    console.error('上传图片失败:', error);
    return NextResponse.json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: error instanceof Error ? error.message : '上传图片失败',
      },
    }, { status: 500 });
  }
}

// 配置：禁用 body 解析，让我们自己处理 formData
export const config = {
  api: {
    bodyParser: false,
  },
};
