import { NextRequest, NextResponse } from 'next/server';
import { proxyGetToBackend } from '@/lib/backend-client';

/**
 * GET /api/rag/monitoring/performance
 * 获取性能指标
 */
export async function GET(request: NextRequest) {
  try {
    const backendResponse = await proxyGetToBackend('/rag/monitoring/performance');
    const data = await backendResponse.json();
    return NextResponse.json(data, { status: backendResponse.status });
  } catch (error) {
    console.error('获取性能指标失败:', error);
    return NextResponse.json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: error instanceof Error ? error.message : '获取性能指标失败' },
    }, { status: 500 });
  }
}
