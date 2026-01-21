/**
 * 规划工作台管理 API 服务（Admin）
 */

import { apiGet } from '@/lib/api-client';
import type {
  GetPlanningSessionsParams,
  GetPlanningSessionsResponse,
  PlanningSessionDetail,
  PlanningSessionsStats,
  GetPlanningPlansParams,
  GetPlanningPlansResponse,
  PlanningPlanDetail,
} from '@/types/api';

/**
 * 获取规划会话列表
 */
export async function getPlanningSessions(
  params?: GetPlanningSessionsParams
): Promise<GetPlanningSessionsResponse | null> {
  const queryParams: Record<string, string | number> = {};
  if (params?.page !== undefined) queryParams.page = params.page;
  if (params?.limit !== undefined) queryParams.limit = params.limit;
  if (params?.tripId) queryParams.tripId = params.tripId;
  if (params?.userId) queryParams.userId = params.userId;
  if (params?.status) queryParams.status = params.status;
  if (params?.startDate) queryParams.startDate = params.startDate;
  if (params?.endDate) queryParams.endDate = params.endDate;
  if (params?.sortBy) queryParams.sortBy = params.sortBy;
  if (params?.sortOrder) queryParams.sortOrder = params.sortOrder;

  const response = await apiGet<GetPlanningSessionsResponse>(
    '/planning-workbench/admin/sessions',
    queryParams,
    { requireAuth: false }
  );

  if (response.success) {
    return response.data;
  }

  console.error('获取规划会话列表失败:', response.error);
  return null;
}

/**
 * 获取规划会话详情
 */
export async function getPlanningSessionDetail(
  id: string
): Promise<PlanningSessionDetail | null> {
  const response = await apiGet<PlanningSessionDetail>(
    `/planning-workbench/admin/sessions/${id}`,
    undefined,
    { requireAuth: false }
  );

  if (response.success) {
    return response.data;
  }

  console.error('获取规划会话详情失败:', response.error);
  return null;
}

/**
 * 获取会话统计
 */
export async function getPlanningSessionsStats(): Promise<PlanningSessionsStats | null> {
  const response = await apiGet<PlanningSessionsStats>(
    '/planning-workbench/admin/sessions/stats',
    undefined,
    { requireAuth: false }
  );

  if (response.success) {
    return response.data;
  }

  console.error('获取会话统计失败:', response.error);
  return null;
}

/**
 * 获取规划方案列表
 */
export async function getPlanningPlans(
  params?: GetPlanningPlansParams
): Promise<GetPlanningPlansResponse | null> {
  const queryParams: Record<string, string | number> = {};
  if (params?.page !== undefined) queryParams.page = params.page;
  if (params?.limit !== undefined) queryParams.limit = params.limit;
  if (params?.sessionId) queryParams.sessionId = params.sessionId;
  if (params?.tripId) queryParams.tripId = params.tripId;
  if (params?.userId) queryParams.userId = params.userId;
  if (params?.startDate) queryParams.startDate = params.startDate;
  if (params?.endDate) queryParams.endDate = params.endDate;
  if (params?.sortBy) queryParams.sortBy = params.sortBy;
  if (params?.sortOrder) queryParams.sortOrder = params.sortOrder;

  const response = await apiGet<GetPlanningPlansResponse>(
    '/planning-workbench/admin/plans',
    queryParams,
    { requireAuth: false }
  );

  if (response.success) {
    return response.data;
  }

  console.error('获取规划方案列表失败:', response.error);
  return null;
}

/**
 * 获取规划方案详情
 */
export async function getPlanningPlanDetail(
  id: string
): Promise<PlanningPlanDetail | null> {
  const response = await apiGet<PlanningPlanDetail>(
    `/planning-workbench/admin/plans/${id}`,
    undefined,
    { requireAuth: false }
  );

  if (response.success) {
    return response.data;
  }

  console.error('获取规划方案详情失败:', response.error);
  return null;
}
