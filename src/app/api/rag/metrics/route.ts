import { NextRequest, NextResponse } from 'next/server';
import { proxyGetToBackend } from '@/lib/backend-client';

/**
 * GET /api/rag/metrics
 * Prometheus 指标端点
 */
export async function GET(request: NextRequest) {
  try {
    const backendResponse = await proxyGetToBackend('/rag/metrics');
    
    // Prometheus 格式返回 text/plain
    const text = await backendResponse.text();
    return new NextResponse(text, {
      status: backendResponse.status,
      headers: {
        'Content-Type': 'text/plain; version=0.0.4',
      },
    });
  } catch (error) {
    console.error('获取 Prometheus 指标失败:', error);
    return NextResponse.json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: error instanceof Error ? error.message : '获取指标失败' },
    }, { status: 500 });
  }
}
