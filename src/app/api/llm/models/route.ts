import { NextRequest, NextResponse } from 'next/server';
import { proxyGetToBackend } from '@/lib/backend-client';

/**
 * GET /api/llm/models
 * 获取可用模型列表
 */
export async function GET(request: NextRequest) {
  try {
    const backendResponse = await proxyGetToBackend('/llm/models');
    const data = await backendResponse.json();
    return NextResponse.json(data, { status: backendResponse.status });
  } catch (error) {
    console.error('获取 LLM 模型列表失败:', error);
    return NextResponse.json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: error instanceof Error ? error.message : '获取 LLM 模型列表失败' },
    }, { status: 500 });
  }
}
