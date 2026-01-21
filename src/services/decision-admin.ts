/**
 * 决策日志管理 API 服务（Admin）
 */

import { apiGet, apiPost } from '@/lib/api-client';
import type {
  GetDecisionLogsParams,
  GetDecisionLogsResponse,
  DecisionLogDetail,
  GetDecisionStatsParams,
  DecisionStats,
  DecisionAnalytics,
  ExportDecisionLogsRequest,
  ExportDecisionLogsResponse,
} from '@/types/api';

/**
 * 获取决策日志列表
 */
export async function getDecisionLogs(
  params?: GetDecisionLogsParams
): Promise<GetDecisionLogsResponse | null> {
  const queryParams: Record<string, string | number> = {};
  if (params?.page !== undefined) queryParams.page = params.page;
  if (params?.limit !== undefined) queryParams.limit = params.limit;
  if (params?.tripId) queryParams.tripId = params.tripId;
  if (params?.userId) queryParams.userId = params.userId;
  if (params?.persona) queryParams.persona = params.persona;
  if (params?.decisionSource) queryParams.decisionSource = params.decisionSource;
  if (params?.action) queryParams.action = params.action;
  if (params?.startDate) queryParams.startDate = params.startDate;
  if (params?.endDate) queryParams.endDate = params.endDate;
  if (params?.sortBy) queryParams.sortBy = params.sortBy;
  if (params?.sortOrder) queryParams.sortOrder = params.sortOrder;

  const response = await apiGet<GetDecisionLogsResponse>(
    '/decision/admin/logs',
    queryParams,
    { requireAuth: false }
  );

  if (response.success) {
    return response.data;
  }

  console.error('获取决策日志列表失败:', response.error);
  return null;
}

/**
 * 获取决策日志详情
 */
export async function getDecisionLogDetail(
  id: string
): Promise<DecisionLogDetail | null> {
  const response = await apiGet<DecisionLogDetail>(
    `/decision/admin/logs/${id}`,
    undefined,
    { requireAuth: false }
  );

  if (response.success) {
    return response.data;
  }

  console.error('获取决策日志详情失败:', response.error);
  return null;
}

/**
 * 获取决策统计
 */
export async function getDecisionStats(
  params?: GetDecisionStatsParams
): Promise<DecisionStats | null> {
  const queryParams: Record<string, string> = {};
  if (params?.startDate) queryParams.startDate = params.startDate;
  if (params?.endDate) queryParams.endDate = params.endDate;
  if (params?.countryCode) queryParams.countryCode = params.countryCode;
  if (params?.routeDirectionId) queryParams.routeDirectionId = params.routeDirectionId;

  const response = await apiGet<DecisionStats>(
    '/decision/admin/stats',
    queryParams,
    { requireAuth: false }
  );

  if (response.success) {
    return response.data;
  }

  console.error('获取决策统计失败:', response.error);
  return null;
}

/**
 * 获取决策分析报告
 */
export async function getDecisionAnalytics(
  params?: {
    startDate?: string;
    endDate?: string;
    countryCode?: string;
  }
): Promise<DecisionAnalytics | null> {
  const queryParams: Record<string, string> = {};
  if (params?.startDate) queryParams.startDate = params.startDate;
  if (params?.endDate) queryParams.endDate = params.endDate;
  if (params?.countryCode) queryParams.countryCode = params.countryCode;

  const response = await apiGet<DecisionAnalytics>(
    '/decision/admin/analytics',
    queryParams,
    { requireAuth: false }
  );

  if (response.success) {
    return response.data;
  }

  console.error('获取决策分析报告失败:', response.error);
  return null;
}

/**
 * 导出决策日志
 */
export async function exportDecisionLogs(
  data: ExportDecisionLogsRequest
): Promise<ExportDecisionLogsResponse | null> {
  const response = await apiPost<ExportDecisionLogsResponse>(
    '/decision/admin/logs/export',
    data,
    { requireAuth: false }
  );

  if (response.success) {
    return response.data;
  }

  console.error('导出决策日志失败:', response.error);
  return null;
}

/**
 * 获取决策统计概览
 * GET /api/decision-stats/overview
 */
export async function getDecisionStatsOverview(): Promise<import('@/types/api').DecisionStatsOverview | null> {
  const response = await apiGet<import('@/types/api').DecisionStatsOverview>(
    '/decision-stats/overview',
    undefined,
    { requireAuth: false }
  );

  if (response.success) {
    return response.data;
  }

  console.error('获取决策统计概览失败:', response.error);
  return null;
}

/**
 * 按类型获取决策统计
 * GET /api/decision-stats/by-type
 */
export async function getDecisionStatsByType(): Promise<import('@/types/api').DecisionStatsByType | null> {
  const response = await apiGet<import('@/types/api').DecisionStatsByType>(
    '/decision-stats/by-type',
    undefined,
    { requireAuth: false }
  );

  if (response.success) {
    return response.data;
  }

  console.error('获取决策按类型统计失败:', response.error);
  return null;
}

/**
 * 获取决策趋势数据
 * GET /api/decision-stats/trends
 */
export async function getDecisionStatsTrends(): Promise<import('@/types/api').DecisionStatsTrends | null> {
  const response = await apiGet<import('@/types/api').DecisionStatsTrends>(
    '/decision-stats/trends',
    undefined,
    { requireAuth: false }
  );

  if (response.success) {
    return response.data;
  }

  console.error('获取决策趋势数据失败:', response.error);
  return null;
}
