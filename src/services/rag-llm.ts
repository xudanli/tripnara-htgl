/**
 * RAG 和 LLM 管理 API 服务
 */

import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api-client';
import type {
  RAGStatsResponse,
  RAGIndexDocumentRequest,
  RAGIndexDocumentResponse,
  RAGBatchIndexRequest,
  RAGBatchIndexResponse,
  RAGComplianceRefreshResponse,
  RAGSegmentNarrativeRequest,
  RAGSegmentNarrativeResponse,
  RAGLocalInsightRefreshRequest,
  RAGLocalInsightRefreshResponse,
  GetRAGDocumentsParams,
  RAGDocumentsResponse,
  RAGDocument,
  UpdateRAGDocumentRequest,
  UpdateRAGDocumentResponse,
  DeleteRAGDocumentResponse,
  LLMModelsResponse,
  GetLLMUsageParams,
  LLMUsageStats,
  LLMUsageStatsBySubAgent,
  GetLLMCostParams,
  LLMCostResponse,
  // RAG 评估
  EvaluateRAGRequest,
  EvaluateRAGResponse,
  EvaluateRAGBatchRequest,
  EvaluateRAGBatchResponse,
  // query-document 对收集
  CollectQueryPairRequest,
  CollectQueryPairResponse,
  CollectQueryPairFromQueryRequest,
  CollectQueryPairFromQueryResponse,
  CollectQueryPairBatchRequest,
  CollectQueryPairBatchResponse,
  GetQueryPairsParams,
  GetQueryPairsResponse,
  ExportQueryPairsForEvaluationRequest,
  ExportQueryPairsForEvaluationResponse,
} from '@/types/api';

// ==================== RAG 管理 API（后端管理）====================

/**
 * 获取 RAG 统计
 * GET /api/rag/stats
 */
export async function getRAGStats(
  collection?: string
): Promise<RAGStatsResponse | null> {
  const queryParams: Record<string, string> = {};
  if (collection) queryParams.collection = collection;

  const response = await apiGet<RAGStatsResponse>(
    '/rag/stats',
    queryParams,
    { requireAuth: false }
  );

  if (response.success) {
    return response.data;
  }

  console.error('获取 RAG 统计失败:', response.error);
  return null;
}

// ==================== LLM 管理 API ====================

/**
 * 获取可用模型列表
 * GET /api/llm/models
 */
export async function getLLMModels(): Promise<LLMModelsResponse | null> {
  const response = await apiGet<LLMModelsResponse>(
    '/llm/models',
    undefined,
    { requireAuth: false }
  );

  if (response.success) {
    return response.data;
  }

  console.error('获取 LLM 模型列表失败:', response.error);
  return null;
}

/**
 * 获取 Token 使用统计
 * GET /api/llm/usage
 */
export async function getLLMUsage(
  params?: GetLLMUsageParams
): Promise<LLMUsageStats | LLMUsageStatsBySubAgent | null> {
  const queryParams: Record<string, string> = {};
  if (params?.subAgent) queryParams.subAgent = params.subAgent;
  if (params?.provider) queryParams.provider = params.provider;
  if (params?.startTime) queryParams.startTime = params.startTime;
  if (params?.endTime) queryParams.endTime = params.endTime;

  const response = await apiGet<LLMUsageStats | LLMUsageStatsBySubAgent>(
    '/llm/usage',
    queryParams,
    { requireAuth: false }
  );

  if (response.success) {
    return response.data;
  }

  console.error('获取 LLM Token 使用统计失败:', response.error);
  return null;
}

/**
 * 获取成本统计
 * GET /api/llm/cost
 */
export async function getLLMCost(
  params?: GetLLMCostParams
): Promise<LLMCostResponse | null> {
  const queryParams: Record<string, string> = {};
  if (params?.subAgent) queryParams.subAgent = params.subAgent;
  if (params?.provider) queryParams.provider = params.provider;
  if (params?.startTime) queryParams.startTime = params.startTime;
  if (params?.endTime) queryParams.endTime = params.endTime;

  const response = await apiGet<LLMCostResponse>(
    '/llm/cost',
    queryParams,
    { requireAuth: false }
  );

  if (response.success) {
    return response.data;
  }

  console.error('获取 LLM 成本统计失败:', response.error);
  return null;
}

// ==================== RAG 管理 API（后端管理）====================

/**
 * 索引文档
 * POST /api/rag/index
 */
export async function indexRAGDocument(
  data: RAGIndexDocumentRequest
): Promise<RAGIndexDocumentResponse | null> {
  const response = await apiPost<RAGIndexDocumentResponse>(
    '/rag/index',
    data,
    { requireAuth: false }
  );

  if (response.success) {
    return response.data;
  }

  console.error('索引文档失败:', response.error);
  return null;
}

/**
 * 批量索引文档
 * POST /api/rag/index/batch
 */
export async function batchIndexRAGDocuments(
  documents: RAGBatchIndexRequest[]
): Promise<RAGBatchIndexResponse | null> {
  const response = await apiPost<RAGBatchIndexResponse>(
    '/rag/index/batch',
    documents,
    { requireAuth: false }
  );

  if (response.success) {
    return response.data;
  }

  console.error('批量索引文档失败:', response.error);
  return null;
}

/**
 * 刷新合规规则缓存
 * POST /api/rag/compliance/refresh
 * 
 * 手动触发合规规则缓存的刷新。
 * 当知识库中的合规规则文档更新后，需要调用此接口使缓存失效并重新加载最新规则。
 * 
 * 注意：刷新操作是异步的，返回成功只表示刷新任务已启动。
 */
export async function refreshComplianceRules(): Promise<RAGComplianceRefreshResponse | null> {
  const response = await apiPost<RAGComplianceRefreshResponse>(
    '/rag/compliance/refresh',
    undefined,
    { requireAuth: false }
  );

  if (response.success) {
    return response.data;
  }

  console.error('刷新合规规则失败:', response.error);
  return null;
}

/**
 * 生成路线段叙事
 * POST /api/rag/segment-narrative
 */
export async function generateSegmentNarrative(
  data: RAGSegmentNarrativeRequest
): Promise<RAGSegmentNarrativeResponse | null> {
  const response = await apiPost<RAGSegmentNarrativeResponse>(
    '/rag/segment-narrative',
    data,
    { requireAuth: false }
  );

  if (response.success) {
    return response.data;
  }

  console.error('生成路线段叙事失败:', response.error);
  return null;
}

/**
 * 刷新当地洞察缓存
 * POST /api/rag/local-insight/refresh
 * 
 * 手动触发指定地区的当地洞察信息缓存刷新。
 * 当更新了某个地区的旅行攻略、文化礼仪等信息后，调用此接口使对应的缓存失效。
 */
export async function refreshLocalInsight(
  data: RAGLocalInsightRefreshRequest
): Promise<RAGLocalInsightRefreshResponse | null> {
  const response = await apiPost<RAGLocalInsightRefreshResponse>(
    '/rag/local-insight/refresh',
    data,
    { requireAuth: false }
  );

  if (response.success) {
    return response.data;
  }

  console.error('刷新当地洞察失败:', response.error);
  return null;
}

// ==================== RAG 文档管理 API ====================

/**
 * 获取文档列表
 * GET /api/rag/documents
 * 
 * 获取 RAG 知识库中的文档列表，支持分页、筛选等功能。
 */
export async function getRAGDocuments(
  params?: GetRAGDocumentsParams
): Promise<RAGDocumentsResponse | null> {
  const queryParams: Record<string, string> = {};
  if (params?.collection) queryParams.collection = params.collection;
  if (params?.countryCode) queryParams.countryCode = params.countryCode;
  if (params?.tags) queryParams.tags = params.tags;
  if (params?.page) queryParams.page = params.page.toString();
  if (params?.pageSize) queryParams.pageSize = params.pageSize.toString();
  if (params?.search) queryParams.search = params.search;

  const response = await apiGet<RAGDocumentsResponse>(
    '/rag/documents',
    queryParams,
    { requireAuth: false }
  );

  if (response.success) {
    return response.data;
  }

  console.error('获取文档列表失败:', response.error);
  return null;
}

/**
 * 获取文档详情
 * GET /api/rag/documents/:id
 * 
 * 根据文档 ID 获取文档的详细信息。
 */
export async function getRAGDocument(id: string): Promise<RAGDocument | null> {
  const response = await apiGet<RAGDocument>(
    `/rag/documents/${id}`,
    undefined,
    { requireAuth: false }
  );

  if (response.success) {
    return response.data;
  }

  console.error('获取文档详情失败:', response.error);
  return null;
}

/**
 * 更新文档
 * PUT /api/rag/documents/:id
 * 
 * 更新 RAG 知识库中的文档。如果内容更新，会自动重新生成 embedding。
 */
export async function updateRAGDocument(
  id: string,
  data: UpdateRAGDocumentRequest
): Promise<UpdateRAGDocumentResponse | null> {
  const response = await apiPut<UpdateRAGDocumentResponse>(
    `/rag/documents/${id}`,
    data,
    { requireAuth: false }
  );

  if (response.success) {
    return response.data;
  }

  console.error('更新文档失败:', response.error);
  return null;
}

/**
 * 删除文档
 * DELETE /api/rag/documents/:id
 * 
 * 从 RAG 知识库中删除指定文档。
 */
export async function deleteRAGDocument(id: string): Promise<DeleteRAGDocumentResponse | null> {
  const response = await apiDelete<DeleteRAGDocumentResponse>(
    `/rag/documents/${id}`,
    { requireAuth: false }
  );

  if (response.success) {
    return response.data;
  }

  console.error('删除文档失败:', response.error);
  return null;
}

// ==================== RAG 检索质量评估管理 ====================

/**
 * 评估单次检索质量
 * POST /api/rag/evaluation/evaluate
 */
export async function evaluateRAG(
  data: EvaluateRAGRequest
): Promise<EvaluateRAGResponse | null> {
  const response = await apiPost<EvaluateRAGResponse>(
    '/rag/evaluation/evaluate',
    data,
    { requireAuth: false }
  );

  if (response.success) {
    return response.data;
  }

  console.error('评估检索质量失败:', response.error);
  return null;
}

/**
 * 批量评估检索质量
 * POST /api/rag/evaluation/evaluate-batch
 */
export async function evaluateRAGBatch(
  data: EvaluateRAGBatchRequest
): Promise<EvaluateRAGBatchResponse | null> {
  const response = await apiPost<EvaluateRAGBatchResponse>(
    '/rag/evaluation/evaluate-batch',
    data,
    { requireAuth: false }
  );

  if (response.success) {
    return response.data;
  }

  console.error('批量评估检索质量失败:', response.error);
  return null;
}

// ==================== query-document 对收集管理 ====================

/**
 * 收集 query-document 对
 * POST /api/rag/query-pairs/collect
 */
export async function collectQueryPair(
  data: CollectQueryPairRequest
): Promise<CollectQueryPairResponse | null> {
  const response = await apiPost<CollectQueryPairResponse>(
    '/rag/query-pairs/collect',
    data,
    { requireAuth: false }
  );

  if (response.success) {
    return response.data;
  }

  console.error('收集 query-document 对失败:', response.error);
  return null;
}

/**
 * 从用户查询自动收集
 * POST /api/rag/query-pairs/collect-from-query
 */
export async function collectQueryPairFromQuery(
  data: CollectQueryPairFromQueryRequest
): Promise<CollectQueryPairFromQueryResponse | null> {
  const response = await apiPost<CollectQueryPairFromQueryResponse>(
    '/rag/query-pairs/collect-from-query',
    data,
    { requireAuth: false }
  );

  if (response.success) {
    return response.data;
  }

  console.error('从用户查询自动收集失败:', response.error);
  return null;
}

/**
 * 批量收集 query-document 对
 * POST /api/rag/query-pairs/collect-batch
 */
export async function collectQueryPairBatch(
  data: CollectQueryPairBatchRequest
): Promise<CollectQueryPairBatchResponse | null> {
  const response = await apiPost<CollectQueryPairBatchResponse>(
    '/rag/query-pairs/collect-batch',
    data,
    { requireAuth: false }
  );

  if (response.success) {
    return response.data;
  }

  console.error('批量收集 query-document 对失败:', response.error);
  return null;
}

/**
 * 获取收集的 query-document 对
 * GET /api/rag/query-pairs
 */
export async function getQueryPairs(
  params?: GetQueryPairsParams
): Promise<GetQueryPairsResponse | null> {
  const queryParams: Record<string, string | number | undefined> = {};
  if (params?.source) queryParams.source = params.source;
  if (params?.collection) queryParams.collection = params.collection;
  if (params?.countryCode) queryParams.countryCode = params.countryCode;
  if (params?.limit !== undefined) queryParams.limit = params.limit;

  const response = await apiGet<GetQueryPairsResponse>(
    '/rag/query-pairs',
    queryParams,
    { requireAuth: false }
  );

  if (response.success) {
    return response.data;
  }

  console.error('获取 query-document 对失败:', response.error);
  return null;
}

/**
 * 导出为评估数据集格式
 * POST /api/rag/query-pairs/export-for-evaluation
 */
export async function exportQueryPairsForEvaluation(
  data: ExportQueryPairsForEvaluationRequest
): Promise<ExportQueryPairsForEvaluationResponse | null> {
  const response = await apiPost<ExportQueryPairsForEvaluationResponse>(
    '/rag/query-pairs/export-for-evaluation',
    data,
    { requireAuth: false }
  );

  if (response.success) {
    return response.data;
  }

  console.error('导出评估数据集失败:', response.error);
  return null;
}

