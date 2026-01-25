import { NextRequest, NextResponse } from 'next/server';
import { proxyPostToBackend } from '@/lib/backend-client';

/**
 * POST /api/rag/chat/explain-why-not-other-route
 * 解释为什么不选择另一条路线
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const backendResponse = await proxyPostToBackend('/rag/chat/explain-why-not-other-route', body);
    const data = await backendResponse.json();
    return NextResponse.json(data, { status: backendResponse.status });
  } catch (error) {
    console.error('解释路线选择失败:', error);
    return NextResponse.json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: error instanceof Error ? error.message : '解释路线选择失败' },
    }, { status: 500 });
  }
}
