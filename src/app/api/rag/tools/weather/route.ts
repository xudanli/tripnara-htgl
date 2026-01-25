import { NextRequest, NextResponse } from 'next/server';
import { proxyPostToBackend } from '@/lib/backend-client';

/**
 * POST /api/rag/tools/weather
 * 天气查询（通过MCP Tools）
 * 
 * 注意：后端可能没有直接的 /rag/tools/weather 接口
 * 这个接口需要通过 McpToolsService 实现，暂时返回提示
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // 尝试代理到后端接口（如果存在）
    // 如果后端没有此接口，需要后端先实现
    const backendResponse = await proxyPostToBackend('/rag/tools/weather', {
      location: body.location,
      date: body.date,
    });
    
    const data = await backendResponse.json();
    return NextResponse.json(data, { status: backendResponse.status });
  } catch (error) {
    console.error('天气查询失败:', error);
    return NextResponse.json({
      success: false,
      error: { 
        code: 'INTERNAL_ERROR', 
        message: error instanceof Error ? error.message : '天气查询失败',
        note: '后端可能尚未实现此接口，需要在后端添加 /rag/tools/weather 端点',
      },
    }, { status: 500 });
  }
}
