import { NextRequest, NextResponse } from 'next/server';
import { proxyPostToBackend } from '@/lib/backend-client';

/**
 * POST /api/rag/gate/evaluate
 * Gate决策评估（评估路线/行程是否应该存在）
 * 
 * 注意：后端可能没有直接的 /rag/gate/evaluate 接口
 * 这个接口可能需要通过决策模块实现，暂时代理到决策相关接口
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // 如果后端有 /rag/gate/evaluate，直接代理
    // 否则可能需要代理到决策模块的接口
    // 这里先尝试代理到 /rag/gate/evaluate，如果不存在会返回404
    const backendResponse = await proxyPostToBackend('/rag/gate/evaluate', {
      request: body.request,
    });
    
    const data = await backendResponse.json();
    return NextResponse.json(data, { status: backendResponse.status });
  } catch (error) {
    console.error('Gate决策评估失败:', error);
    return NextResponse.json({
      success: false,
      error: { 
        code: 'INTERNAL_ERROR', 
        message: error instanceof Error ? error.message : 'Gate决策评估失败',
        note: '后端可能尚未实现此接口，请检查后端 /rag/gate/evaluate 或决策模块接口',
      },
    }, { status: 500 });
  }
}
