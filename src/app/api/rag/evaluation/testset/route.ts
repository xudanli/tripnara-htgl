import { NextRequest, NextResponse } from 'next/server';
import { proxyGetToBackend, proxyPutToBackend, proxyPostToBackend } from '@/lib/backend-client';

/**
 * GET /api/rag/evaluation/testset
 * 获取 RAG 评估测试集
 */
export async function GET(request: NextRequest) {
  try {
    const backendResponse = await proxyGetToBackend('/rag/evaluation/testset');
    const data = await backendResponse.json();
    return NextResponse.json(data, { status: backendResponse.status });
  } catch (error) {
    console.error('获取测试集失败:', error);
    return NextResponse.json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: error instanceof Error ? error.message : '获取测试集失败' },
    }, { status: 500 });
  }
}

/**
 * PUT /api/rag/evaluation/testset
 * 保存 RAG 评估测试集
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const backendResponse = await proxyPutToBackend('/rag/evaluation/testset', body);
    const data = await backendResponse.json();
    return NextResponse.json(data, { status: backendResponse.status });
  } catch (error) {
    console.error('保存测试集失败:', error);
    return NextResponse.json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: error instanceof Error ? error.message : '保存测试集失败' },
    }, { status: 500 });
  }
}

/**
 * POST /api/rag/evaluation/testset
 * 运行测试集评估（使用测试集评估RAG性能）
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // 代理到后端的 /rag/evaluation/testset/run
    const backendResponse = await proxyPostToBackend('/rag/evaluation/testset/run', {
      testsetId: body.testsetId,
      options: body.options,
    });
    
    const data = await backendResponse.json();
    return NextResponse.json(data, { status: backendResponse.status });
  } catch (error) {
    console.error('运行测试集评估失败:', error);
    return NextResponse.json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: error instanceof Error ? error.message : '运行测试集评估失败' },
    }, { status: 500 });
  }
}
