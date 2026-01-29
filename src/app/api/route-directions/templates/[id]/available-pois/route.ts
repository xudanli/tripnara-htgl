import { NextRequest, NextResponse } from 'next/server';
import { proxyGetToBackend } from '@/lib/backend-client';

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/route-directions/templates/[id]/available-pois
 * 获取路线模板可用的POI列表
 * 根据路线模板关联的路线方向，自动获取该国家/地区的可用POI列表
 * 
 * 查询参数:
 *   - category?: PlaceCategory - POI类别筛选
 *   - search?: string - 搜索关键词
 *   - page?: number - 页码（默认1）
 *   - limit?: number - 每页数量（默认50）
 */
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const searchParams = request.nextUrl.searchParams;
    
    // 构建查询参数
    const queryParams: Record<string, string | number> = {};
    if (searchParams.get('category')) {
      queryParams.category = searchParams.get('category')!;
    }
    if (searchParams.get('search')) {
      queryParams.search = searchParams.get('search')!;
    }
    if (searchParams.get('page')) {
      queryParams.page = Number(searchParams.get('page'));
    }
    if (searchParams.get('limit')) {
      queryParams.limit = Number(searchParams.get('limit'));
    }
    
    // 代理请求到后端服务
    const backendResponse = await proxyGetToBackend(
      `/route-directions/templates/${id}/available-pois`,
      queryParams
    );
    const data = await backendResponse.json();
    return NextResponse.json(data, { status: backendResponse.status });
  } catch (error) {
    console.error('获取可用POI列表失败:', error);
    return NextResponse.json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: error instanceof Error ? error.message : '获取可用POI列表失败',
      },
    }, { status: 500 });
  }
}
