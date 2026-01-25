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

// ==================== RAG 核心检索接口 =====================

/**
 * 从 Chunk 表检索文档（新接口，推荐使用）⭐
 * POST /api/rag/chunks/retrieve
 */
export async function retrieveChunks(params: {
  query: string;
  limit?: number;
  credibilityMin?: number;
  type?: string;
  category?: string;
  fileId?: string;
}): Promise<any | null> {
  const response = await apiPost<any>(
    '/rag/chunks/retrieve',
    params,
    { requireAuth: false }
  );

  if (response.success) {
    return response.data;
  }

  console.error('检索文档失败:', response.error);
  return null;
}

/**
 * RAG 搜索
 * POST /api/rag/search
 */
export async function searchRAG(params: {
  query: string;
  collection?: string;
  countryCode?: string;
  tags?: string[];
  limit?: number;
  minScore?: number;
}): Promise<any | null> {
  const response = await apiPost<any>(
    '/rag/search',
    params,
    { requireAuth: false }
  );

  if (response.success) {
    return response.data;
  }

  console.error('RAG 搜索失败:', response.error);
  return null;
}

/**
 * 检索文档（旧接口，保留兼容性）
 * GET /api/rag/retrieve
 */
export async function retrieveRAG(params: {
  query: string;
  collection: string;
  countryCode?: string;
  limit?: number;
}): Promise<any | null> {
  const queryParams: Record<string, string> = {};
  if (params.query) queryParams.query = params.query;
  if (params.collection) queryParams.collection = params.collection;
  if (params.countryCode) queryParams.countryCode = params.countryCode;
  if (params.limit) queryParams.limit = params.limit.toString();

  const response = await apiGet<any>(
    '/rag/retrieve',
    queryParams,
    { requireAuth: false }
  );

  if (response.success) {
    return response.data;
  }

  console.error('检索文档失败:', response.error);
  return null;
}

// ==================== 知识库管理 =====================

/**
 * 重建知识库索引（完整重建）⭐
 * POST /api/rag/knowledge-base/rebuild-index
 */
export async function rebuildKnowledgeBaseIndex(): Promise<{ message: string } | null> {
  const response = await apiPost<{ message: string }>(
    '/rag/knowledge-base/rebuild-index',
    undefined,
    { requireAuth: false }
  );

  if (response.success) {
    return response.data;
  }

  console.error('重建知识库索引失败:', response.error);
  return null;
}

/**
 * 清空知识库索引（警告：此操作将删除所有知识库数据）
 * POST /api/rag/knowledge-base/clear-index
 */
export async function clearKnowledgeBaseIndex(): Promise<{ message: string } | null> {
  const response = await apiPost<{ message: string }>(
    '/rag/knowledge-base/clear-index',
    undefined,
    { requireAuth: false }
  );

  if (response.success) {
    return response.data;
  }

  console.error('清空知识库索引失败:', response.error);
  return null;
}

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
 * 提取 Rail Pass 规则
 * POST /api/rag/compliance/rail-pass
 */
export async function extractRailPassRules(params: {
  passType: string;
  countryCode?: string;
}): Promise<any | null> {
  const response = await apiPost<any>(
    '/rag/compliance/rail-pass',
    params,
    { requireAuth: false }
  );

  if (response.success) {
    return response.data;
  }

  console.error('提取 Rail Pass 规则失败:', response.error);
  return null;
}

/**
 * 提取 Trail Access 规则
 * POST /api/rag/compliance/trail-access
 */
export async function extractTrailAccessRules(params: {
  trailId: string;
  countryCode?: string;
}): Promise<any | null> {
  const response = await apiPost<any>(
    '/rag/compliance/trail-access',
    params,
    { requireAuth: false }
  );

  if (response.success) {
    return response.data;
  }

  console.error('提取 Trail Access 规则失败:', response.error);
  return null;
}

/**
 * 提取行程相关合规规则
 * POST /api/rag/extract-compliance-rules
 */
export async function extractComplianceRules(params: {
  tripId: string;
  countryCodes: string[];
  ruleTypes?: string[];
}): Promise<any | null> {
  const response = await apiPost<any>(
    '/rag/extract-compliance-rules',
    params,
    { requireAuth: false }
  );

  if (response.success) {
    return response.data;
  }

  console.error('提取合规规则失败:', response.error);
  return null;
}

/**
 * 生成路线叙事
 * GET /api/rag/route-narrative/:routeDirectionId
 */
export async function generateRouteNarrative(
  routeDirectionId: string,
  params?: {
    countryCode?: string;
    includeLocalInsights?: boolean;
  }
): Promise<any | null> {
  const queryParams: Record<string, string> = {};
  if (params?.countryCode) queryParams.countryCode = params.countryCode;
  if (params?.includeLocalInsights !== undefined) {
    queryParams.includeLocalInsights = params.includeLocalInsights.toString();
  }

  const response = await apiGet<any>(
    `/rag/route-narrative/${routeDirectionId}`,
    queryParams,
    { requireAuth: false }
  );

  if (response.success) {
    return response.data;
  }

  console.error('生成路线叙事失败:', response.error);
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
 * 获取当地洞察
 * GET /api/rag/local-insight
 */
export async function getLocalInsight(params: {
  countryCode: string;
  tags: string | string[];
  region?: string;
}): Promise<any | null> {
  const queryParams: Record<string, string> = {};
  queryParams.countryCode = params.countryCode;
  if (Array.isArray(params.tags)) {
    queryParams.tags = params.tags.join(',');
  } else {
    queryParams.tags = params.tags;
  }
  if (params.region) queryParams.region = params.region;

  const response = await apiGet<any>(
    '/rag/local-insight',
    queryParams,
    { requireAuth: false }
  );

  if (response.success) {
    return response.data;
  }

  console.error('获取当地洞察失败:', response.error);
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

// ==================== 增强对话 =====================

/**
 * 回答路线问题（使用 RAG 增强的对话功能）
 * POST /api/rag/chat/answer-route-question
 */
export async function answerRouteQuestion(params: {
  question: string;
  routeDirectionId?: string;
  countryCode?: string;
  segmentId?: string;
  dayIndex?: number;
  tripId?: string;
}): Promise<any | null> {
  const response = await apiPost<any>(
    '/rag/chat/answer-route-question',
    params,
    { requireAuth: false }
  );

  if (response.success) {
    return response.data;
  }

  console.error('回答路线问题失败:', response.error);
  return null;
}

/**
 * 解释为什么不选择另一条路线
 * POST /api/rag/chat/explain-why-not-other-route
 */
export async function explainWhyNotOtherRoute(params: {
  selectedRouteId: string;
  alternativeRouteId: string;
  countryCode?: string;
}): Promise<any | null> {
  const response = await apiPost<any>(
    '/rag/chat/explain-why-not-other-route',
    params,
    { requireAuth: false }
  );

  if (response.success) {
    return response.data;
  }

  console.error('解释路线选择失败:', response.error);
  return null;
}

/**
 * 获取目的地深度信息
 * GET /api/rag/destination-insights
 */
export async function getDestinationInsights(params: {
  placeId: string;
  tripId?: string;
  countryCode?: string;
}): Promise<any | null> {
  const queryParams: Record<string, string> = {};
  queryParams.placeId = params.placeId;
  if (params.tripId) queryParams.tripId = params.tripId;
  if (params.countryCode) queryParams.countryCode = params.countryCode;

  const response = await apiGet<any>(
    '/rag/destination-insights',
    queryParams,
    { requireAuth: false }
  );

  if (response.success) {
    return response.data;
  }

  console.error('获取目的地深度信息失败:', response.error);
  return null;
}

// ==================== 评估与测试集（新知识库系统）====================

/**
 * 评估 Chunk 检索质量（新知识库系统）
 * POST /api/rag/evaluation/chunks/evaluate
 */
export async function evaluateChunkRetrieval(params: {
  query: string;
  params: {
    query: string;
    limit?: number;
    useHybridSearch?: boolean;
    useReranking?: boolean;
    useQueryExpansion?: boolean;
  };
  groundTruthChunkIds: string[];
}): Promise<any | null> {
  const response = await apiPost<any>(
    '/rag/evaluation/chunks/evaluate',
    params,
    { requireAuth: false }
  );

  if (response.success) {
    return response.data;
  }

  console.error('评估 Chunk 检索质量失败:', response.error);
  return null;
}

/**
 * 批量评估 Chunk 检索质量
 * POST /api/rag/evaluation/chunks/evaluate-batch
 */
export async function evaluateChunkRetrievalBatch(params: {
  testCases: Array<{
    query: string;
    params: any;
    groundTruthChunkIds: string[];
  }>;
}): Promise<any | null> {
  const response = await apiPost<any>(
    '/rag/evaluation/chunks/evaluate-batch',
    params,
    { requireAuth: false }
  );

  if (response.success) {
    return response.data;
  }

  console.error('批量评估 Chunk 检索质量失败:', response.error);
  return null;
}

/**
 * 获取 RAG 评估测试集
 * GET /api/rag/evaluation/testset
 */
export async function getEvaluationTestset(): Promise<any | null> {
  const response = await apiGet<any>(
    '/rag/evaluation/testset',
    undefined,
    { requireAuth: false }
  );

  if (response.success) {
    return response.data;
  }

  console.error('获取测试集失败:', response.error);
  return null;
}

/**
 * 保存 RAG 评估测试集
 * PUT /api/rag/evaluation/testset
 */
export async function saveEvaluationTestset(testset: any): Promise<any | null> {
  const response = await apiPut<any>(
    '/rag/evaluation/testset',
    testset,
    { requireAuth: false }
  );

  if (response.success) {
    return response.data;
  }

  console.error('保存测试集失败:', response.error);
  return null;
}

/**
 * 运行测试集评估
 * POST /api/rag/evaluation/testset/run
 */
export async function runEvaluationTestset(params: {
  params?: {
    useHybridSearch?: boolean;
    useReranking?: boolean;
    useQueryExpansion?: boolean;
  };
  limit?: number;
}): Promise<any | null> {
  const response = await apiPost<any>(
    '/rag/evaluation/testset/run',
    params,
    { requireAuth: false }
  );

  if (response.success) {
    return response.data;
  }

  console.error('运行测试集评估失败:', response.error);
  return null;
}

/**
 * 查找相关 chunks（用于填充测试集的 groundTruthChunkIds）
 * GET /api/rag/evaluation/testset/find-chunks
 */
export async function findChunksForTestset(params: {
  query: string;
  limit?: number;
}): Promise<any | null> {
  const queryParams: Record<string, string> = {};
  queryParams.query = params.query;
  if (params.limit) queryParams.limit = params.limit.toString();

  const response = await apiGet<any>(
    '/rag/evaluation/testset/find-chunks',
    queryParams,
    { requireAuth: false }
  );

  if (response.success) {
    return response.data;
  }

  console.error('查找相关 chunks 失败:', response.error);
  return null;
}

/**
 * 列出所有 chunks（用于浏览和选择 groundTruthChunkIds）
 * GET /api/rag/evaluation/testset/list-chunks
 */
export async function listChunksForTestset(params?: {
  limit?: number;
}): Promise<any | null> {
  const queryParams: Record<string, string> = {};
  if (params?.limit) queryParams.limit = params.limit.toString();

  const response = await apiGet<any>(
    '/rag/evaluation/testset/list-chunks',
    queryParams,
    { requireAuth: false }
  );

  if (response.success) {
    return response.data;
  }

  console.error('列出 chunks 失败:', response.error);
  return null;
}

// ==================== 监控指标 =====================

/**
 * 获取 RAG 监控指标（所有指标）
 * GET /api/rag/monitoring/metrics
 */
export async function getRAGMonitoringMetrics(): Promise<any | null> {
  const response = await apiGet<any>(
    '/rag/monitoring/metrics',
    undefined,
    { requireAuth: false }
  );

  if (response.success) {
    return response.data;
  }

  console.error('获取监控指标失败:', response.error);
  return null;
}

/**
 * 获取性能指标
 * GET /api/rag/monitoring/performance
 */
export async function getRAGPerformanceMetrics(): Promise<any | null> {
  const response = await apiGet<any>(
    '/rag/monitoring/performance',
    undefined,
    { requireAuth: false }
  );

  if (response.success) {
    return response.data;
  }

  console.error('获取性能指标失败:', response.error);
  return null;
}

/**
 * 获取质量指标
 * GET /api/rag/monitoring/quality
 */
export async function getRAGQualityMetrics(): Promise<any | null> {
  const response = await apiGet<any>(
    '/rag/monitoring/quality',
    undefined,
    { requireAuth: false }
  );

  if (response.success) {
    return response.data;
  }

  console.error('获取质量指标失败:', response.error);
  return null;
}

/**
 * 获取成本指标
 * GET /api/rag/monitoring/cost
 */
export async function getRAGCostMetrics(): Promise<any | null> {
  const response = await apiGet<any>(
    '/rag/monitoring/cost',
    undefined,
    { requireAuth: false }
  );

  if (response.success) {
    return response.data;
  }

  console.error('获取成本指标失败:', response.error);
  return null;
}

/**
 * 重置监控指标
 * POST /api/rag/monitoring/reset
 */
export async function resetRAGMonitoringMetrics(): Promise<any | null> {
  const response = await apiPost<any>(
    '/rag/monitoring/reset',
    undefined,
    { requireAuth: false }
  );

  if (response.success) {
    return response.data;
  }

  console.error('重置监控指标失败:', response.error);
  return null;
}

// ==================== 缓存管理 =====================

/**
 * 获取 Embedding 缓存统计
 * GET /api/rag/cache/stats
 */
export async function getRAGCacheStats(): Promise<any | null> {
  const response = await apiGet<any>(
    '/rag/cache/stats',
    undefined,
    { requireAuth: false }
  );

  if (response.success) {
    return response.data;
  }

  console.error('获取缓存统计失败:', response.error);
  return null;
}

/**
 * 重置缓存统计
 * POST /api/rag/cache/reset-stats
 */
export async function resetRAGCacheStats(): Promise<any | null> {
  const response = await apiPost<any>(
    '/rag/cache/reset-stats',
    undefined,
    { requireAuth: false }
  );

  if (response.success) {
    return response.data;
  }

  console.error('重置缓存统计失败:', response.error);
  return null;
}

/**
 * 清空 Embedding 缓存
 * POST /api/rag/cache/clear
 */
export async function clearRAGCache(): Promise<any | null> {
  const response = await apiPost<any>(
    '/rag/cache/clear',
    undefined,
    { requireAuth: false }
  );

  if (response.success) {
    return response.data;
  }

  console.error('清空缓存失败:', response.error);
  return null;
}

// ==================== 新接口：RAG查询检索（带降级策略）=====================

/**
 * RAG查询检索（支持5层降级策略）
 * POST /api/rag/retrieve
 */
export async function ragRetrieveWithFallback(params: {
  query: string;
  category?: string;
  options?: {
    topK?: number;
    minScore?: number;
    enableReranking?: boolean;
    enableQueryExpansion?: boolean;
  };
}): Promise<any | null> {
  const response = await apiPost<any>(
    '/rag/retrieve',
    {
      query: params.query,
      category: params.category,
      options: params.options || {},
    },
    { requireAuth: false }
  );

  if (response.success) {
    return response.data;
  }

  console.error('RAG检索失败:', response.error);
  return null;
}

// ==================== 新接口：RAG增强对话 =====================

/**
 * RAG增强对话
 * POST /api/rag/chat
 */
export async function ragChat(params: {
  message: string;
  conversationId?: string;
  category?: string;
  options?: {
    topK?: number;
    enableReranking?: boolean;
  };
}): Promise<any | null> {
  const response = await apiPost<any>(
    '/rag/chat',
    {
      message: params.message,
      conversationId: params.conversationId,
      category: params.category,
      options: params.options || {},
    },
    { requireAuth: false }
  );

  if (response.success) {
    return response.data;
  }

  console.error('RAG增强对话失败:', response.error);
  return null;
}

// ==================== 新接口：Gate决策评估 =====================

/**
 * Gate决策评估
 * POST /api/rag/gate/evaluate
 */
export async function gateEvaluate(params: {
  request: {
    origin: string;
    destination: string;
    startDate?: string;
    endDate?: string;
    mode?: string;
    party?: {
      adults?: number;
      children?: number;
      fitnessLevel?: string;
    };
  };
}): Promise<any | null> {
  const response = await apiPost<any>(
    '/rag/gate/evaluate',
    {
      request: params.request,
    },
    { requireAuth: false }
  );

  if (response.success) {
    return response.data;
  }

  console.error('Gate决策评估失败:', response.error);
  return null;
}

// ==================== 新接口：Prometheus监控指标 =====================

/**
 * 获取 Prometheus 格式的监控指标
 * GET /api/rag/metrics
 */
export async function getRAGPrometheusMetrics(): Promise<string | null> {
  const response = await fetch('/api/rag/metrics', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (response.ok) {
    return await response.text();
  }

  console.error('获取 Prometheus 指标失败:', response.statusText);
  return null;
}

/**
 * 获取人类可读的缓存统计
 * GET /api/rag/metrics/stats
 */
export async function getRAGMetricsStats(): Promise<any | null> {
  const response = await apiGet<any>(
    '/rag/metrics/stats',
    undefined,
    { requireAuth: false }
  );

  if (response.success) {
    return response.data;
  }

  console.error('获取统计信息失败:', response.error);
  return null;
}

// ==================== 新接口：工具调用 =====================

/**
 * 天气查询工具
 * POST /api/rag/tools/weather
 */
export async function ragToolWeather(params: {
  location: string;
  date?: string;
}): Promise<any | null> {
  const response = await apiPost<any>(
    '/rag/tools/weather',
    {
      location: params.location,
      date: params.date,
    },
    { requireAuth: false }
  );

  if (response.success) {
    return response.data;
  }

  console.error('天气查询失败:', response.error);
  return null;
}

/**
 * POI详情查询工具
 * POST /api/rag/tools/places
 */
export async function ragToolPlaces(params: {
  query: string;
  fields?: string[];
}): Promise<any | null> {
  const response = await apiPost<any>(
    '/rag/tools/places',
    {
      query: params.query,
      fields: params.fields,
    },
    { requireAuth: false }
  );

  if (response.success) {
    return response.data;
  }

  console.error('POI查询失败:', response.error);
  return null;
}

/**
 * 网页内容抓取工具
 * POST /api/rag/tools/browse
 */
export async function ragToolBrowse(params: {
  url: string;
  query?: string;
}): Promise<any | null> {
  const response = await apiPost<any>(
    '/rag/tools/browse',
    {
      url: params.url,
      query: params.query,
    },
    { requireAuth: false }
  );

  if (response.success) {
    return response.data;
  }

  console.error('网页抓取失败:', response.error);
  return null;
}

// ==================== 新接口：测试集评估 =====================

/**
 * 运行测试集评估
 * POST /api/rag/evaluation/testset
 */
export async function runRAGEvaluationTestset(params: {
  testsetId?: string;
  options?: {
    enableReranking?: boolean;
    enableQueryExpansion?: boolean;
    topK?: number;
  };
}): Promise<any | null> {
  const response = await apiPost<any>(
    '/rag/evaluation/testset',
    {
      testsetId: params.testsetId,
      options: params.options || {},
    },
    { requireAuth: false }
  );

  if (response.success) {
    return response.data;
  }

  console.error('运行测试集评估失败:', response.error);
  return null;
}
