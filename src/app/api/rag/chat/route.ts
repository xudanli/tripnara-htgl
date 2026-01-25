import { NextRequest, NextResponse } from 'next/server';
import { proxyPostToBackend } from '@/lib/backend-client';

/**
 * POST /api/rag/chat
 * RAG增强对话（基于RAG检索的增强对话，自动调用LLM生成回答）
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // 使用 answer-route-question 接口作为通用聊天接口
    // 如果没有 routeDirectionId，则作为通用查询处理
    const backendResponse = await proxyPostToBackend('/rag/chat/answer-route-question', {
      question: body.message,
      conversationId: body.conversationId,
      countryCode: body.countryCode,
    });
    
    const data = await backendResponse.json();
    return NextResponse.json(data, { status: backendResponse.status });
  } catch (error) {
    console.error('RAG增强对话失败:', error);
    return NextResponse.json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: error instanceof Error ? error.message : 'RAG增强对话失败' },
    }, { status: 500 });
  }
}
