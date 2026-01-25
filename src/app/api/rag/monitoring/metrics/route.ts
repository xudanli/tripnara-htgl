import { NextRequest, NextResponse } from 'next/server';
import { proxyGetToBackend } from '@/lib/backend-client';

/**
 * GET /api/rag/monitoring/metrics
 * 获取 RAG 监控指标（所有指标）
 */
export async function GET(request: NextRequest) {
  try {
    const backendResponse = await proxyGetToBackend('/rag/monitoring/metrics');
    const data = await backendResponse.json();
    return NextResponse.json(data, { status: backendResponse.status });
  } catch (error) {
    console.error('获取监控指标失败:', error);
    return NextResponse.json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: error instanceof Error ? error.message : '获取监控指标失败' },
    }, { status: 500 });
  }
}
