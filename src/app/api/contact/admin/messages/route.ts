import { NextRequest, NextResponse } from 'next/server';
import { proxyGetToBackend, proxyPutToBackend, proxyPostToBackend } from '@/lib/backend-client';

/**
 * GET /api/contact/admin/messages
 * 获取联系消息列表 - 代理请求到真实后端服务
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
    const backendResponse = await proxyGetToBackend('/contact/admin/messages', queryParams);
    const data = await backendResponse.json();

    // 返回后端服务的响应
    return NextResponse.json(data, { status: backendResponse.status });
  } catch (error) {
    const errorResponse = {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: error instanceof Error ? error.message : '获取联系消息列表失败',
      },
    };
    return NextResponse.json(errorResponse, { status: 500 });
  }
}

/**
 * PUT /api/contact/admin/messages/[id]/status
 * 更新消息状态 - 代理请求到真实后端服务
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const pathSegments = request.nextUrl.pathname.split('/');
    const messageId = pathSegments[pathSegments.length - 2];

    if (!messageId) {
      const errorResponse = {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: '缺少消息ID',
        },
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    // 代理请求到后端服务
    const backendResponse = await proxyPutToBackend(`/contact/admin/messages/${messageId}/status`, body);
    const data = await backendResponse.json();

    // 返回后端服务的响应
    return NextResponse.json(data, { status: backendResponse.status });
  } catch (error) {
    const errorResponse = {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: error instanceof Error ? error.message : '更新消息状态失败',
      },
    };
    return NextResponse.json(errorResponse, { status: 500 });
  }
}

/**
 * POST /api/contact/admin/messages/[id]/reply
 * 回复消息 - 代理请求到真实后端服务
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const pathSegments = request.nextUrl.pathname.split('/');
    const messageId = pathSegments[pathSegments.length - 2];

    if (!messageId) {
      const errorResponse = {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: '缺少消息ID',
        },
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    // 代理请求到后端服务
    const backendResponse = await proxyPostToBackend(`/contact/admin/messages/${messageId}/reply`, body);
    const data = await backendResponse.json();

    // 返回后端服务的响应
    return NextResponse.json(data, { status: backendResponse.status });
  } catch (error) {
    const errorResponse = {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: error instanceof Error ? error.message : '回复消息失败',
      },
    };
    return NextResponse.json(errorResponse, { status: 500 });
  }
}
