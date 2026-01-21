/**
 * Agent 运行管理 API 服务（Admin）
 */

import { apiGet, apiPost } from '@/lib/api-client';
import type {
  GetAgentRunsParams,
  GetAgentRunsResponse,
  TripRunDetail,
  AgentRunsStats,
  GetAgentAttemptsParams,
  GetAgentAttemptsResponse,
  TripAttemptDetail,
  AgentPerformance,
} from '@/types/api';

/**
 * 获取 Agent 运行列表
 */
export async function getAgentRuns(
  params?: GetAgentRunsParams
): Promise<GetAgentRunsResponse | null> {
  const queryParams: Record<string, string | number> = {};
  if (params?.page !== undefined) queryParams.page = params.page;
  if (params?.limit !== undefined) queryParams.limit = params.limit;
  if (params?.tripId) queryParams.tripId = params.tripId;
  if (params?.userId) queryParams.userId = params.userId;
  if (params?.status) queryParams.status = params.status;
  if (params?.planningPhase) queryParams.planningPhase = params.planningPhase;
  if (params?.startDate) queryParams.startDate = params.startDate;
  if (params?.endDate) queryParams.endDate = params.endDate;
  if (params?.sortBy) queryParams.sortBy = params.sortBy;
  if (params?.sortOrder) queryParams.sortOrder = params.sortOrder;

  const response = await apiGet<GetAgentRunsResponse>(
    '/agent/admin/runs',
    queryParams,
    { requireAuth: false }
  );

  if (response.success) {
    return response.data;
  }

  console.error('获取 Agent 运行列表失败:', response.error);
  return null;
}

/**
 * 获取 Agent 运行详情
 */
export async function getAgentRunDetail(
  id: string
): Promise<TripRunDetail | null> {
  const response = await apiGet<TripRunDetail>(
    `/agent/admin/runs/${id}`,
    undefined,
    { requireAuth: false }
  );

  if (response.success) {
    return response.data;
  }

  console.error('获取 Agent 运行详情失败:', response.error);
  return null;
}

/**
 * 获取 Agent 运行统计
 */
export async function getAgentRunsStats(params?: {
  startDate?: string;
  endDate?: string;
  planningPhase?: string;
}): Promise<AgentRunsStats | null> {
  const queryParams: Record<string, string> = {};
  if (params?.startDate) queryParams.startDate = params.startDate;
  if (params?.endDate) queryParams.endDate = params.endDate;
  if (params?.planningPhase) queryParams.planningPhase = params.planningPhase;

  const response = await apiGet<AgentRunsStats>(
    '/agent/admin/runs/stats',
    queryParams,
    { requireAuth: false }
  );

  if (response.success) {
    return response.data;
  }

  // 如果是 NOT_FOUND 错误，静默处理（接口可能尚未实现）
  if (response.error?.code === 'NOT_FOUND') {
    return null;
  }

  console.error('获取 Agent 运行统计失败:', response.error);
  return null;
}

/**
 * 获取 Attempt 列表
 */
export async function getAgentAttempts(
  params?: GetAgentAttemptsParams
): Promise<GetAgentAttemptsResponse | null> {
  const queryParams: Record<string, string | number> = {};
  if (params?.page !== undefined) queryParams.page = params.page;
  if (params?.limit !== undefined) queryParams.limit = params.limit;
  if (params?.tripRunId) queryParams.tripRunId = params.tripRunId;
  if (params?.tripId) queryParams.tripId = params.tripId;
  if (params?.userId) queryParams.userId = params.userId;
  if (params?.status) queryParams.status = params.status;
  if (params?.startDate) queryParams.startDate = params.startDate;
  if (params?.endDate) queryParams.endDate = params.endDate;
  if (params?.sortBy) queryParams.sortBy = params.sortBy;
  if (params?.sortOrder) queryParams.sortOrder = params.sortOrder;

  const response = await apiGet<GetAgentAttemptsResponse>(
    '/agent/admin/attempts',
    queryParams,
    { requireAuth: false }
  );

  if (response.success) {
    return response.data;
  }

  console.error('获取 Attempt 列表失败:', response.error);
  return null;
}

/**
 * 获取 Attempt 详情
 */
export async function getAgentAttemptDetail(
  id: string
): Promise<TripAttemptDetail | null> {
  const response = await apiGet<TripAttemptDetail>(
    `/agent/admin/attempts/${id}`,
    undefined,
    { requireAuth: false }
  );

  if (response.success) {
    return response.data;
  }

  console.error('获取 Attempt 详情失败:', response.error);
  return null;
}

/**
 * 取消运行
 */
export async function cancelAgentRun(id: string): Promise<boolean> {
  const response = await apiPost<{ success: boolean }>(
    `/agent/admin/runs/${id}/cancel`,
    undefined,
    { requireAuth: false }
  );

  if (response.success) {
    return response.data.success ?? true;
  }

  console.error('取消运行失败:', response.error);
  return false;
}

/**
 * 获取 Agent 性能分析
 */
export async function getAgentPerformance(params?: {
  startDate?: string;
  endDate?: string;
}): Promise<AgentPerformance | null> {
  const queryParams: Record<string, string> = {};
  if (params?.startDate) queryParams.startDate = params.startDate;
  if (params?.endDate) queryParams.endDate = params.endDate;

  const response = await apiGet<AgentPerformance>(
    '/agent/admin/performance',
    queryParams,
    { requireAuth: false }
  );

  if (response.success) {
    return response.data;
  }

  // 如果是 NOT_FOUND 错误，静默处理（接口可能尚未实现）
  if (response.error?.code === 'NOT_FOUND') {
    return null;
  }

  console.error('获取 Agent 性能分析失败:', response.error);
  return null;
}
