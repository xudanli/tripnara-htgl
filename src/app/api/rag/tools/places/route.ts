import { NextRequest, NextResponse } from 'next/server';
import { proxyPostToBackend } from '@/lib/backend-client';

/**
 * POST /api/rag/tools/places
 * POI详情查询（通过Google Places API）
 * 
 * 注意：后端可能没有直接的 /rag/tools/places 接口
 * 这个接口需要通过 McpToolsService 实现，暂时返回提示
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // 尝试代理到后端接口（如果存在）
    const backendResponse = await proxyPostToBackend('/rag/tools/places', {
      query: body.query,
      fields: body.fields,
    });
    
    const data = await backendResponse.json();
    return NextResponse.json(data, { status: backendResponse.status });
  } catch (error) {
    console.error('POI查询失败:', error);
    return NextResponse.json({
      success: false,
      error: { 
        code: 'INTERNAL_ERROR', 
        message: error instanceof Error ? error.message : 'POI查询失败',
        note: '后端可能尚未实现此接口，需要在后端添加 /rag/tools/places 端点',
      },
    }, { status: 500 });
  }
}
