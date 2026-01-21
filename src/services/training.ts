/**
 * RL Training 管理后台 API 服务
 */

import { apiGet, apiPost } from '@/lib/api-client';
import type {
  // 训练管理
  CreateTrainingJobRequest,
  CreateTrainingJobResponse,
  TrainingJob,
  GetTrainingJobsParams,
  GetTrainingJobsResponse,
  // 模型管理
  RegisterModelRequest,
  Model,
  GetModelsParams,
  GetModelsResponse,
  RollbackModelRequest,
  RollbackModelResponse,
  // 数据集管理
  CreateDatasetVersionRequest,
  CreateDatasetVersionResponse,
  DatasetVersion,
  GetDatasetVersionsParams,
  GetDatasetVersionsResponse,
  CompareVersionsResponse,
  // 评测管理
  EvaluateRouterRequest,
  EvaluateGateRequest,
  EvaluateItineraryRequest,
  EvaluateFullPipelineRequest,
  EvaluationResponse,
  OpeReportRequest,
  OpeReportResponse,
  ReplayCompareRequest,
  ReplayCompareResponse,
  RegressionGateCheckResponse,
  // 监控指标
  PolicyHealthResponse,
  PolicyMetricsResponse,
  CollectionStatsResponse,
  TrainingQualityMetricsResponse,
  CollapseRiskResponse,
  // A/B测试管理
  CreateAbTestRequest,
  CreateAbTestResponse,
  AssignUserToAbTestRequest,
  AssignUserToAbTestResponse,
  AnalyzeAbTestResponse,
  // 安全审计
  RecordAuditRequest,
  RecordAuditResponse,
  GetAuditReportParams,
  GetAuditReportResponse,
  RunRedTeamTestRequest,
  RunRedTeamTestResponse,
  GetTestCasesResponse,
  // ETL与数据导出
  ExtractTrajectoryDataRequest,
  ExtractTrajectoryDataResponse,
  ExportTrajectoryDataRequest,
  ExportTrajectoryDataResponse,
  PrepareTrainingBatchRequest,
  PrepareTrainingBatchResponse,
  ExportBatchJsonlResponse,
  ExportBatchJsonResponse,
  // 枚举选项
  EnumKey,
  EnumOptionsResponse,
  GetAllEnumOptionsResponse,
} from '@/types/api';

// ==================== 一、训练管理 ====================

/**
 * 创建训练任务
 * POST /api/training/jobs
 */
export async function createTrainingJob(
  data: CreateTrainingJobRequest
): Promise<CreateTrainingJobResponse | null> {
  const response = await apiPost<CreateTrainingJobResponse>(
    '/api/training/jobs',
    data
  );

  if (response.success) {
    return response.data;
  }

  console.error('创建训练任务失败:', response.error);
  return null;
}

/**
 * 启动训练
 * POST /api/training/jobs/:jobId/start
 */
export async function startTrainingJob(
  jobId: string
): Promise<{ success: boolean; message?: string } | null> {
  const response = await apiPost<{ success: boolean; message?: string }>(
    `/api/training/jobs/${jobId}/start`
  );

  if (response.success) {
    return response.data;
  }

  console.error('启动训练失败:', response.error);
  return null;
}

/**
 * 获取任务状态
 * GET /api/training/jobs/:jobId
 */
export async function getTrainingJob(
  jobId: string
): Promise<TrainingJob | null> {
  const response = await apiGet<TrainingJob>(`/api/training/jobs/${jobId}`);

  if (response.success) {
    return response.data;
  }

  console.error('获取任务状态失败:', response.error);
  return null;
}

/**
 * 列出所有任务
 * GET /api/training/jobs
 */
export async function getTrainingJobs(
  params?: GetTrainingJobsParams
): Promise<GetTrainingJobsResponse | null> {
  const queryParams: Record<string, string | number | boolean | undefined> = {};
  if (params?.page !== undefined) queryParams.page = params.page;
  if (params?.limit !== undefined) queryParams.limit = params.limit;
  if (params?.status) queryParams.status = params.status;
  if (params?.dataset_version) queryParams.dataset_version = params.dataset_version;

  const response = await apiGet<GetTrainingJobsResponse>(
    '/api/training/jobs',
    queryParams
  );

  if (response.success) {
    return response.data;
  }

  console.error('获取训练任务列表失败:', response.error);
  return null;
}

// ==================== 二、模型管理 ====================

/**
 * 注册新模型
 * POST /api/training/models/register
 */
export async function registerModel(
  data: RegisterModelRequest
): Promise<Model | null> {
  const response = await apiPost<Model>(
    '/api/training/models/register',
    data
  );

  if (response.success) {
    return response.data;
  }

  console.error('注册模型失败:', response.error);
  return null;
}

/**
 * 获取模型详情
 * GET /api/training/models/:version
 */
export async function getModel(
  version: string
): Promise<Model | null> {
  const response = await apiGet<Model>(`/api/training/models/${version}`);

  if (response.success) {
    return response.data;
  }

  console.error('获取模型详情失败:', response.error);
  return null;
}

/**
 * 列出所有模型
 * GET /api/training/models
 */
export async function getModels(
  params?: GetModelsParams
): Promise<GetModelsResponse | null> {
  const queryParams: Record<string, string | number | boolean | undefined> = {};
  if (params?.page !== undefined) queryParams.page = params.page;
  if (params?.limit !== undefined) queryParams.limit = params.limit;
  if (params?.tags) {
    // 如果 tags 是数组，可能需要特殊处理
    queryParams.tags = Array.isArray(params.tags) ? params.tags.join(',') : params.tags;
  }
  if (params?.is_production !== undefined) queryParams.is_production = params.is_production;

  const response = await apiGet<GetModelsResponse>(
    '/api/training/models',
    queryParams
  );

  if (response.success) {
    return response.data;
  }

  console.error('获取模型列表失败:', response.error);
  return null;
}

/**
 * 回滚模型
 * POST /api/training/models/:version/rollback
 */
export async function rollbackModel(
  version: string,
  data: RollbackModelRequest
): Promise<RollbackModelResponse | null> {
  const response = await apiPost<RollbackModelResponse>(
    `/api/training/models/${version}/rollback`,
    data
  );

  if (response.success) {
    return response.data;
  }

  console.error('回滚模型失败:', response.error);
  return null;
}

// ==================== 三、数据集管理 ====================

/**
 * 创建数据集版本
 * POST /api/training/versions/create
 */
export async function createDatasetVersion(
  data: CreateDatasetVersionRequest
): Promise<CreateDatasetVersionResponse | null> {
  const response = await apiPost<CreateDatasetVersionResponse>(
    '/api/training/versions/create',
    data
  );

  if (response.success) {
    return response.data;
  }

  console.error('创建数据集版本失败:', response.error);
  return null;
}

/**
 * 获取版本详情
 * GET /api/training/versions/:version
 */
export async function getDatasetVersion(
  version: string
): Promise<DatasetVersion | null> {
  const response = await apiGet<DatasetVersion>(
    `/api/training/versions/${version}`
  );

  if (response.success) {
    return response.data;
  }

  console.error('获取版本详情失败:', response.error);
  return null;
}

/**
 * 列出所有版本
 * GET /api/training/versions
 */
export async function getDatasetVersions(
  params?: GetDatasetVersionsParams
): Promise<GetDatasetVersionsResponse | null> {
  const queryParams: Record<string, string | number | boolean | undefined> = {};
  if (params?.page !== undefined) queryParams.page = params.page;
  if (params?.limit !== undefined) queryParams.limit = params.limit;
  if (params?.country_code) queryParams.country_code = params.country_code;

  const response = await apiGet<GetDatasetVersionsResponse>(
    '/api/training/versions',
    queryParams
  );

  if (response.success) {
    return response.data;
  }

  console.error('获取数据集版本列表失败:', response.error);
  return null;
}

/**
 * 比较两个版本
 * GET /api/training/versions/:v1/compare/:v2
 */
export async function compareVersions(
  v1: string,
  v2: string
): Promise<CompareVersionsResponse | null> {
  const response = await apiGet<CompareVersionsResponse>(
    `/api/training/versions/${v1}/compare/${v2}`
  );

  if (response.success) {
    return response.data;
  }

  console.error('比较版本失败:', response.error);
  return null;
}

// ==================== 四、评测管理 ====================

/**
 * 评测Router组件
 * POST /api/training/evaluation/router
 */
export async function evaluateRouter(
  data?: EvaluateRouterRequest
): Promise<EvaluationResponse | null> {
  const response = await apiPost<EvaluationResponse>(
    '/api/training/evaluation/router',
    data
  );

  if (response.success) {
    return response.data;
  }

  console.error('评测Router组件失败:', response.error);
  return null;
}

/**
 * 评测Gate组件
 * POST /api/training/evaluation/gate
 */
export async function evaluateGate(
  data?: EvaluateGateRequest
): Promise<EvaluationResponse | null> {
  const response = await apiPost<EvaluationResponse>(
    '/api/training/evaluation/gate',
    data
  );

  if (response.success) {
    return response.data;
  }

  console.error('评测Gate组件失败:', response.error);
  return null;
}

/**
 * 评测Itinerary组件
 * POST /api/training/evaluation/itinerary
 */
export async function evaluateItinerary(
  data?: EvaluateItineraryRequest
): Promise<EvaluationResponse | null> {
  const response = await apiPost<EvaluationResponse>(
    '/api/training/evaluation/itinerary',
    data
  );

  if (response.success) {
    return response.data;
  }

  console.error('评测Itinerary组件失败:', response.error);
  return null;
}

/**
 * 全流程评测
 * POST /api/training/evaluation/full-pipeline
 */
export async function evaluateFullPipeline(
  data?: EvaluateFullPipelineRequest
): Promise<EvaluationResponse | null> {
  const response = await apiPost<EvaluationResponse>(
    '/api/training/evaluation/full-pipeline',
    data
  );

  if (response.success) {
    return response.data;
  }

  console.error('全流程评测失败:', response.error);
  return null;
}

/**
 * OPE报告
 * POST /api/training/evaluation/ope/report
 */
export async function getOpeReport(
  data: OpeReportRequest
): Promise<OpeReportResponse | null> {
  const response = await apiPost<OpeReportResponse>(
    '/api/training/evaluation/ope/report',
    data
  );

  if (response.success) {
    return response.data;
  }

  console.error('获取OPE报告失败:', response.error);
  return null;
}

/**
 * 回放对比
 * POST /api/training/evaluation/replay/compare
 */
export async function replayCompare(
  data: ReplayCompareRequest
): Promise<ReplayCompareResponse | null> {
  const response = await apiPost<ReplayCompareResponse>(
    '/api/training/evaluation/replay/compare',
    data
  );

  if (response.success) {
    return response.data;
  }

  console.error('回放对比失败:', response.error);
  return null;
}

/**
 * 回归门检查
 * POST /api/training/evaluation/regression-gate/check
 */
export async function checkRegressionGate(): Promise<RegressionGateCheckResponse | null> {
  const response = await apiPost<RegressionGateCheckResponse>(
    '/api/training/evaluation/regression-gate/check'
  );

  if (response.success) {
    return response.data;
  }

  console.error('回归门检查失败:', response.error);
  return null;
}

// ==================== 五、监控指标 ====================

/**
 * 策略服务健康
 * GET /api/training/policy/health
 */
export async function getPolicyHealth(): Promise<PolicyHealthResponse | null> {
  const response = await apiGet<PolicyHealthResponse>(
    '/api/training/policy/health'
  );

  if (response.success) {
    return response.data;
  }

  console.error('获取策略服务健康状态失败:', response.error);
  return null;
}

/**
 * 策略服务指标
 * GET /api/training/policy/metrics
 */
export async function getPolicyMetrics(): Promise<PolicyMetricsResponse | null> {
  const response = await apiGet<PolicyMetricsResponse>(
    '/api/training/policy/metrics'
  );

  if (response.success) {
    return response.data;
  }

  console.error('获取策略服务指标失败:', response.error);
  return null;
}

/**
 * 轨迹收集统计
 * GET /api/training/metrics/collection-stats
 */
export async function getCollectionStats(): Promise<CollectionStatsResponse | null> {
  const response = await apiGet<CollectionStatsResponse>(
    '/api/training/metrics/collection-stats'
  );

  if (response.success) {
    return response.data;
  }

  console.error('获取轨迹收集统计失败:', response.error);
  return null;
}

/**
 * 训练质量指标
 * GET /api/training/metrics/training-quality
 */
export async function getTrainingQualityMetrics(): Promise<TrainingQualityMetricsResponse | null> {
  const response = await apiGet<TrainingQualityMetricsResponse>(
    '/api/training/metrics/training-quality'
  );

  if (response.success) {
    return response.data;
  }

  console.error('获取训练质量指标失败:', response.error);
  return null;
}

/**
 * 模型坍塌风险
 * GET /api/training/monitoring/collapse-risk
 */
export async function getCollapseRisk(): Promise<CollapseRiskResponse | null> {
  const response = await apiGet<CollapseRiskResponse>(
    '/api/training/monitoring/collapse-risk'
  );

  if (response.success) {
    return response.data;
  }

  console.error('获取模型坍塌风险失败:', response.error);
  return null;
}

// ==================== 六、A/B测试管理 ====================

/**
 * 创建A/B测试
 * POST /api/training/product/ab-test/create
 */
export async function createAbTest(
  data: CreateAbTestRequest
): Promise<CreateAbTestResponse | null> {
  const response = await apiPost<CreateAbTestResponse>(
    '/api/training/product/ab-test/create',
    data
  );

  if (response.success) {
    return response.data;
  }

  console.error('创建A/B测试失败:', response.error);
  return null;
}

/**
 * 分配用户到测试组
 * POST /api/training/product/ab-test/assign
 */
export async function assignUserToAbTest(
  data: AssignUserToAbTestRequest
): Promise<AssignUserToAbTestResponse | null> {
  const response = await apiPost<AssignUserToAbTestResponse>(
    '/api/training/product/ab-test/assign',
    data
  );

  if (response.success) {
    return response.data;
  }

  console.error('分配用户到测试组失败:', response.error);
  return null;
}

/**
 * 分析测试结果
 * POST /api/training/product/ab-test/analyze
 */
export async function analyzeAbTest(
  testId: string
): Promise<AnalyzeAbTestResponse | null> {
  const response = await apiPost<AnalyzeAbTestResponse>(
    '/api/training/product/ab-test/analyze',
    { test_id: testId }
  );

  if (response.success) {
    return response.data;
  }

  console.error('分析A/B测试结果失败:', response.error);
  return null;
}

// ==================== 七、安全审计 ====================

/**
 * 记录审计
 * POST /api/training/safety/compliance/audit/record
 */
export async function recordAudit(
  data: RecordAuditRequest
): Promise<RecordAuditResponse | null> {
  const response = await apiPost<RecordAuditResponse>(
    '/api/training/safety/compliance/audit/record',
    data
  );

  if (response.success) {
    return response.data;
  }

  console.error('记录审计失败:', response.error);
  return null;
}

/**
 * 获取审计报告
 * GET /api/training/safety/compliance/audit/report
 */
export async function getAuditReport(
  params?: GetAuditReportParams
): Promise<GetAuditReportResponse | null> {
  const queryParams: Record<string, string | number | boolean | undefined> = {};
  if (params?.page !== undefined) queryParams.page = params.page;
  if (params?.limit !== undefined) queryParams.limit = params.limit;
  if (params?.action) queryParams.action = params.action;
  if (params?.resource) queryParams.resource = params.resource;
  if (params?.user_id) queryParams.user_id = params.user_id;
  if (params?.start_time) queryParams.start_time = params.start_time;
  if (params?.end_time) queryParams.end_time = params.end_time;

  const response = await apiGet<GetAuditReportResponse>(
    '/api/training/safety/compliance/audit/report',
    queryParams
  );

  if (response.success) {
    return response.data;
  }

  console.error('获取审计报告失败:', response.error);
  return null;
}

/**
 * 运行红队测试
 * POST /api/training/safety/red-team/run
 */
export async function runRedTeamTest(
  data?: RunRedTeamTestRequest
): Promise<RunRedTeamTestResponse | null> {
  const response = await apiPost<RunRedTeamTestResponse>(
    '/api/training/safety/red-team/run',
    data
  );

  if (response.success) {
    return response.data;
  }

  console.error('运行红队测试失败:', response.error);
  return null;
}

/**
 * 获取测试用例
 * GET /api/training/safety/red-team/test-cases
 */
export async function getTestCases(): Promise<GetTestCasesResponse | null> {
  const response = await apiGet<GetTestCasesResponse>(
    '/api/training/safety/red-team/test-cases'
  );

  if (response.success) {
    return response.data;
  }

  console.error('获取测试用例失败:', response.error);
  return null;
}

// ==================== 八、ETL与数据导出 ====================

/**
 * 提取轨迹数据
 * POST /api/training/etl/extract
 */
export async function extractTrajectoryData(
  data?: ExtractTrajectoryDataRequest
): Promise<ExtractTrajectoryDataResponse | null> {
  const response = await apiPost<ExtractTrajectoryDataResponse>(
    '/api/training/etl/extract',
    data
  );

  if (response.success) {
    return response.data;
  }

  console.error('提取轨迹数据失败:', response.error);
  return null;
}

/**
 * 导出轨迹数据
 * POST /api/training/etl/export
 */
export async function exportTrajectoryData(
  data?: ExportTrajectoryDataRequest
): Promise<ExportTrajectoryDataResponse | null> {
  const response = await apiPost<ExportTrajectoryDataResponse>(
    '/api/training/etl/export',
    data
  );

  if (response.success) {
    return response.data;
  }

  console.error('导出轨迹数据失败:', response.error);
  return null;
}

/**
 * 准备训练批次
 * POST /api/training/batches/prepare
 */
export async function prepareTrainingBatch(
  data: PrepareTrainingBatchRequest
): Promise<PrepareTrainingBatchResponse | null> {
  const response = await apiPost<PrepareTrainingBatchResponse>(
    '/api/training/batches/prepare',
    data
  );

  if (response.success) {
    return response.data;
  }

  console.error('准备训练批次失败:', response.error);
  return null;
}

/**
 * 导出JSONL
 * GET /api/training/batches/:id/export/jsonl
 */
export async function exportBatchJsonl(
  batchId: string
): Promise<ExportBatchJsonlResponse | null> {
  const response = await apiGet<ExportBatchJsonlResponse>(
    `/api/training/batches/${batchId}/export/jsonl`
  );

  if (response.success) {
    return response.data;
  }

  console.error('导出JSONL失败:', response.error);
  return null;
}

/**
 * 导出JSON
 * GET /api/training/batches/:id/export/json
 */
export async function exportBatchJson(
  batchId: string
): Promise<ExportBatchJsonResponse | null> {
  const response = await apiGet<ExportBatchJsonResponse>(
    `/api/training/batches/${batchId}/export/json`
  );

  if (response.success) {
    return response.data;
  }

  console.error('导出JSON失败:', response.error);
  return null;
}

// ==================== 枚举选项 ====================

/**
 * 获取所有枚举选项
 * GET /api/training/options/all
 */
export async function getAllEnumOptions(): Promise<GetAllEnumOptionsResponse | null> {
  const response = await apiGet<GetAllEnumOptionsResponse>(
    '/training/options/all',
    undefined,
    { requireAuth: false }
  );

  if (response.success) {
    return response.data;
  }

  console.error('获取所有枚举选项失败:', response.error);
  return null;
}

/**
 * 获取指定枚举选项
 * GET /api/training/options/:enumKey
 */
export async function getEnumOptions(
  enumKey: EnumKey
): Promise<EnumOptionsResponse | null> {
  const response = await apiGet<EnumOptionsResponse>(
    `/training/options/${enumKey}`,
    undefined,
    { requireAuth: false }
  );

  if (response.success) {
    return response.data;
  }

  console.error(`获取枚举选项失败 (${enumKey}):`, response.error);
  return null;
}

// ==================== ROLL 管理接口 ====================

/**
 * 获取 ROLL 监控指标
 * GET /api/training/roll/metrics
 */
export async function getRollMetrics(): Promise<import('@/types/api').RollMetrics | null> {
  const response = await apiGet<import('@/types/api').RollMetrics>(
    '/training/roll/metrics',
    undefined,
    { requireAuth: false }
  );

  if (response.success) {
    return response.data;
  }

  console.error('获取 ROLL 监控指标失败:', response.error);
  return null;
}

/**
 * 获取 ROLL Workers 状态
 * GET /api/training/roll/workers/status
 */
export async function getRollWorkersStatus(): Promise<import('@/types/api').RollWorkersStatus | null> {
  const response = await apiGet<import('@/types/api').RollWorkersStatus>(
    '/training/roll/workers/status',
    undefined,
    { requireAuth: false }
  );

  if (response.success) {
    return response.data;
  }

  console.error('获取 ROLL Workers 状态失败:', response.error);
  return null;
}

/**
 * ROLL 健康检查
 * GET /api/training/roll/health
 */
export async function getRollHealth(): Promise<import('@/types/api').RollHealth | null> {
  const response = await apiGet<import('@/types/api').RollHealth>(
    '/training/roll/health',
    undefined,
    { requireAuth: false }
  );

  if (response.success) {
    return response.data;
  }

  console.error('获取 ROLL 健康状态失败:', response.error);
  return null;
}

/**
 * 创建 A/B 测试实验
 * POST /api/training/roll/ab-test/create
 */
export async function createRollAbTest(
  data: import('@/types/api').CreateRollAbTestRequest
): Promise<import('@/types/api').CreateRollAbTestResponse | null> {
  const response = await apiPost<import('@/types/api').CreateRollAbTestResponse>(
    '/training/roll/ab-test/create',
    data,
    { requireAuth: false }
  );

  if (response.success) {
    return response.data;
  }

  console.error('创建 ROLL A/B 测试失败:', response.error);
  return null;
}

/**
 * 分析 A/B 测试结果
 * POST /api/training/roll/ab-test/analyze
 */
export async function analyzeRollAbTest(
  data: import('@/types/api').AnalyzeRollAbTestRequest
): Promise<import('@/types/api').AnalyzeRollAbTestResponse | null> {
  const response = await apiPost<import('@/types/api').AnalyzeRollAbTestResponse>(
    '/training/roll/ab-test/analyze',
    data,
    { requireAuth: false }
  );

  if (response.success) {
    return response.data;
  }

  console.error('分析 ROLL A/B 测试失败:', response.error);
  return null;
}

/**
 * 检查是否使用 ROLL
 * GET /api/training/roll/ab-test/should-use
 */
export async function shouldUseRoll(): Promise<import('@/types/api').ShouldUseRollResponse | null> {
  const response = await apiGet<import('@/types/api').ShouldUseRollResponse>(
    '/training/roll/ab-test/should-use',
    undefined,
    { requireAuth: false }
  );

  if (response.success) {
    return response.data;
  }

  console.error('检查是否使用 ROLL 失败:', response.error);
  return null;
}
