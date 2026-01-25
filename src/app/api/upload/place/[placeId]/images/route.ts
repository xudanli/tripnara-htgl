import { NextRequest, NextResponse } from 'next/server';
import { proxyFormDataToBackend, proxyGetToBackend } from '@/lib/backend-client';

interface RouteContext {
  params: Promise<{ placeId: string }>;
}

/**
 * GET /api/upload/place/[placeId]/images
 * 获取景点图片列表
 */
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { placeId } = await context.params;
    
    if (!placeId) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: '缺少景点ID',
        },
      }, { status: 400 });
    }

    const backendResponse = await proxyGetToBackend(`/upload/place/${placeId}/images`);
    const data = await backendResponse.json();
    return NextResponse.json(data, { status: backendResponse.status });
  } catch (error) {
    console.error('获取景点图片列表失败:', error);
    return NextResponse.json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: error instanceof Error ? error.message : '获取景点图片列表失败',
      },
    }, { status: 500 });
  }
}

/**
 * POST /api/upload/place/[placeId]/images
 * 为景点上传图片
 */
export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { placeId } = await context.params;
    
    if (!placeId) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: '缺少景点ID',
        },
      }, { status: 400 });
    }

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

    const backendResponse = await proxyFormDataToBackend(`/upload/place/${placeId}/images`, formData);
    const data = await backendResponse.json();
    return NextResponse.json(data, { status: backendResponse.status });
  } catch (error) {
    console.error('为景点上传图片失败:', error);
    return NextResponse.json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: error instanceof Error ? error.message : '为景点上传图片失败',
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
