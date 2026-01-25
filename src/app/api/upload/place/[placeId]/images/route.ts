import { NextRequest, NextResponse } from 'next/server';
import { proxyFormDataToBackend, proxyGetToBackend, proxyDeleteToBackend } from '@/lib/backend-client';

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

/**
 * DELETE /api/upload/place/[placeId]/images
 * 删除景点图片
 * 查询参数（二选一）:
 *   - key: 图片的 OSS key
 *   - index: 图片在列表中的索引（从 0 开始）
 */
export async function DELETE(request: NextRequest, context: RouteContext) {
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

    const searchParams = request.nextUrl.searchParams;
    const key = searchParams.get('key');
    const index = searchParams.get('index');

    // 验证参数：必须提供 key 或 index 之一
    if (!key && index === null) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: '必须提供 key 或 index 参数之一',
        },
      }, { status: 400 });
    }

    // 构建查询参数
    const queryParams: Record<string, string> = {};
    if (key) {
      queryParams.key = key;
    }
    if (index !== null) {
      queryParams.index = index;
    }

    const backendResponse = await proxyDeleteToBackend(`/upload/place/${placeId}/images`, queryParams);
    
    // 检查响应状态
    if (backendResponse.status === 405) {
      console.error('后端不支持 DELETE 方法');
      return NextResponse.json({
        success: false,
        error: {
          code: 'METHOD_NOT_ALLOWED',
          message: '后端服务不支持删除图片功能',
        },
      }, { status: 405 });
    }
    
    // 尝试解析响应
    let data;
    try {
      const text = await backendResponse.text();
      if (text) {
        data = JSON.parse(text);
      } else {
        // 空响应体，但状态码可能是成功的
        if (backendResponse.ok) {
          data = { success: true, message: '删除成功' };
        } else {
          data = { success: false, error: { code: 'UNKNOWN_ERROR', message: '删除失败' } };
        }
      }
    } catch (parseError) {
      console.error('解析后端响应失败:', parseError);
      return NextResponse.json({
        success: false,
        error: {
          code: 'PARSE_ERROR',
          message: '后端响应格式错误',
        },
      }, { status: 500 });
    }
    
    return NextResponse.json(data, { status: backendResponse.status });
  } catch (error) {
    console.error('删除景点图片失败:', error);
    return NextResponse.json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: error instanceof Error ? error.message : '删除景点图片失败',
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
