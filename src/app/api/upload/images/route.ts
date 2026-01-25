import { NextRequest, NextResponse } from 'next/server';
import { proxyFormDataToBackend } from '@/lib/backend-client';

/**
 * POST /api/upload/images
 * 批量上传图片到 OSS（最多10张）
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    // 验证是否有文件
    const files = formData.getAll('files');
    if (!files || files.length === 0) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: '请选择要上传的图片文件',
        },
      }, { status: 400 });
    }

    if (files.length > 10) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: '最多只能同时上传10张图片',
        },
      }, { status: 400 });
    }

    const backendResponse = await proxyFormDataToBackend('/upload/images', formData);
    const data = await backendResponse.json();
    return NextResponse.json(data, { status: backendResponse.status });
  } catch (error) {
    console.error('批量上传图片失败:', error);
    return NextResponse.json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: error instanceof Error ? error.message : '批量上传图片失败',
      },
    }, { status: 500 });
  }
}

// 配置：禁用 body 解析
export const config = {
  api: {
    bodyParser: false,
  },
};
