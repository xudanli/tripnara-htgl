import { NextRequest, NextResponse } from 'next/server';
import { proxyPostToBackend } from '@/lib/backend-client';

/**
 * POST /api/rag/knowledge-base/clear-index
 * 清空知识库索引（警告：此操作将删除所有知识库数据）
 */
export async function POST(request: NextRequest) {
  try {
    const backendResponse = await proxyPostToBackend('/rag/knowledge-base/clear-index');
    const data = await backendResponse.json();
    return NextResponse.json(data, { status: backendResponse.status });
  } catch (error) {
    console.error('清空知识库索引失败:', error);
    return NextResponse.json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: error instanceof Error ? error.message : '清空知识库索引失败' },
    }, { status: 500 });
  }
}
