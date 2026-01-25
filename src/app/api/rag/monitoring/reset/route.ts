import { NextRequest, NextResponse } from 'next/server';
import { proxyPostToBackend } from '@/lib/backend-client';

/**
 * POST /api/rag/monitoring/reset
 * 重置监控指标
 */
export async function POST(request: NextRequest) {
  try {
    const backendResponse = await proxyPostToBackend('/rag/monitoring/reset');
    const data = await backendResponse.json();
    return NextResponse.json(data, { status: backendResponse.status });
  } catch (error) {
    console.error('重置监控指标失败:', error);
    return NextResponse.json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: error instanceof Error ? error.message : '重置监控指标失败' },
    }, { status: 500 });
  }
}
