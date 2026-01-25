import { NextRequest, NextResponse } from 'next/server';
import { proxyPostToBackend } from '@/lib/backend-client';

/**
 * POST /api/rag/compliance/trail-access
 * 提取 Trail Access 规则
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const backendResponse = await proxyPostToBackend('/rag/compliance/trail-access', body);
    const data = await backendResponse.json();
    return NextResponse.json(data, { status: backendResponse.status });
  } catch (error) {
    console.error('提取 Trail Access 规则失败:', error);
    return NextResponse.json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: error instanceof Error ? error.message : '提取 Trail Access 规则失败' },
    }, { status: 500 });
  }
}
