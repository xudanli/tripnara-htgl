import { NextRequest, NextResponse } from 'next/server';
import { proxyGetToBackend, proxyPutToBackend, proxyDeleteToBackend } from '@/lib/backend-client';

/**
 * GET /api/rag/documents/:id
 * 获取单个 RAG 文档
 * 代理请求到真实后端服务
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // 代理请求到后端服务
    const backendResponse = await proxyGetToBackend(`/rag/documents/${id}`);
    const data = await backendResponse.json();

    // 返回后端服务的响应
    return NextResponse.json(data, { status: backendResponse.status });
  } catch (error) {
    console.error('获取 RAG 文档失败:', error);
    const errorResponse = {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: error instanceof Error ? error.message : '获取 RAG 文档失败',
      },
    };
    return NextResponse.json(errorResponse, { status: 500 });
  }
}

/**
 * PUT /api/rag/documents/:id
 * 更新 RAG 文档
 * 代理请求到真实后端服务
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();

    // 代理请求到后端服务
    const backendResponse = await proxyPutToBackend(`/rag/documents/${id}`, body);
    const data = await backendResponse.json();

    // 返回后端服务的响应
    return NextResponse.json(data, { status: backendResponse.status });
  } catch (error) {
    console.error('更新 RAG 文档失败:', error);
    const errorResponse = {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: error instanceof Error ? error.message : '更新 RAG 文档失败',
      },
    };
    return NextResponse.json(errorResponse, { status: 500 });
  }
}

/**
 * DELETE /api/rag/documents/:id
 * 删除 RAG 文档
 * 代理请求到真实后端服务
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // 代理请求到后端服务
    const backendResponse = await proxyDeleteToBackend(`/rag/documents/${id}`);
    const data = await backendResponse.json();

    // 返回后端服务的响应
    return NextResponse.json(data, { status: backendResponse.status });
  } catch (error) {
    console.error('删除 RAG 文档失败:', error);
    const errorResponse = {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: error instanceof Error ? error.message : '删除 RAG 文档失败',
      },
    };
    return NextResponse.json(errorResponse, { status: 500 });
  }
}
