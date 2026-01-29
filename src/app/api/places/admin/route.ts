import { NextRequest, NextResponse } from 'next/server';
import { proxyGetToBackend, proxyPutToBackend, proxyDeleteToBackend, proxyPostToBackend } from '@/lib/backend-client';

/**
 * POST /api/places/admin
 * 创建新地点 - 代理请求到真实后端服务
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 验证必填字段
    if (!body.nameCN) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'nameCN should not be empty',
        },
      }, { status: 400 });
    }

    if (!body.category) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'category should not be empty',
        },
      }, { status: 400 });
    }

    if (body.lat === undefined || body.lng === undefined) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'lat and lng are required',
        },
      }, { status: 400 });
    }

    if (!body.cityId) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'cityId should not be empty',
        },
      }, { status: 400 });
    }

    // 代理请求到后端服务
    const backendResponse = await proxyPostToBackend('/places/admin', body);
    const data = await backendResponse.json();

    // 返回后端服务的响应
    return NextResponse.json(data, { status: backendResponse.status });
  } catch (error) {
    console.error('创建地点失败:', error);
    return NextResponse.json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: error instanceof Error ? error.message : '创建地点失败',
      },
    }, { status: 500 });
  }
}

/**
 * GET /api/places/admin
 * 获取地点列表 - 代理请求到真实后端服务
 */
export async function GET(request: NextRequest) {
  try {
    // 获取查询参数
    const searchParams = request.nextUrl.searchParams;
    const queryParams: Record<string, string | number | boolean> = {};

    searchParams.forEach((value, key) => {
      if (value === 'true') queryParams[key] = true;
      else if (value === 'false') queryParams[key] = false;
      else if (!isNaN(Number(value))) queryParams[key] = Number(value);
      else queryParams[key] = value;
    });

    // 代理请求到后端服务
    const backendResponse = await proxyGetToBackend('/places/admin', queryParams);
    const data = await backendResponse.json();

    // 返回后端服务的响应
    return NextResponse.json(data, { status: backendResponse.status });
  } catch (error) {
    const errorResponse = {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: error instanceof Error ? error.message : '获取地点列表失败',
      },
    };
    return NextResponse.json(errorResponse, { status: 500 });
  }
}

/**
 * PUT /api/places/admin/[id]
 * 更新地点信息 - 代理请求到真实后端服务
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const pathSegments = request.nextUrl.pathname.split('/');
    const placeId = pathSegments[pathSegments.length - 1];

    if (!placeId || placeId === 'admin') {
      const errorResponse = {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: '缺少地点ID',
        },
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    // 代理请求到后端服务
    const backendResponse = await proxyPutToBackend(`/places/admin/${placeId}`, body);
    const data = await backendResponse.json();

    // 返回后端服务的响应
    return NextResponse.json(data, { status: backendResponse.status });
  } catch (error) {
    const errorResponse = {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: error instanceof Error ? error.message : '更新地点信息失败',
      },
    };
    return NextResponse.json(errorResponse, { status: 500 });
  }
}

/**
 * DELETE /api/places/admin/[id]
 * 删除地点 - 代理请求到真实后端服务
 */
export async function DELETE(request: NextRequest) {
  try {
    const pathSegments = request.nextUrl.pathname.split('/');
    const placeId = pathSegments[pathSegments.length - 1];

    if (!placeId || placeId === 'admin') {
      const errorResponse = {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: '缺少地点ID',
        },
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    // 代理请求到后端服务
    const backendResponse = await proxyDeleteToBackend(`/places/admin/${placeId}`);
    const data = await backendResponse.json();

    // 返回后端服务的响应
    return NextResponse.json(data, { status: backendResponse.status });
  } catch (error) {
    const errorResponse = {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: error instanceof Error ? error.message : '删除地点失败',
      },
    };
    return NextResponse.json(errorResponse, { status: 500 });
  }
}
