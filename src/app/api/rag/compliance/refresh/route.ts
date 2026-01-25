import { NextRequest, NextResponse } from 'next/server';
import { proxyPostToBackend } from '@/lib/backend-client';

/**
 * POST /api/rag/compliance/refresh
 * 刷新合规规则缓存
 */
export async function POST(request: NextRequest) {
  try {
    const backendResponse = await proxyPostToBackend('/rag/compliance/refresh');
    const data = await backendResponse.json();
    return NextResponse.json(data, { status: backendResponse.status });
  } catch (error) {
    console.error('刷新合规规则失败:', error);
    return NextResponse.json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: error instanceof Error ? error.message : '刷新合规规则失败' },
    }, { status: 500 });
  }
}
