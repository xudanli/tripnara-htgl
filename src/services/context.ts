/**
 * Context API 服务（前端接口）
 */

import { apiGet } from '@/lib/api-client';
import type {
  GetContextMetricsParams,
  ContextMetrics,
  GetContextPackagesParams,
  GetContextPackagesResponse,
  ContextPackageDetail,
  GetContextAnalyticsParams,
  ContextAnalytics,
} from '@/types/api';

/**
 * 获取 Context 指标统计
 */
export async function getContextMetrics(
  params?: GetContextMetricsParams
): Promise<ContextMetrics | null> {
  const queryParams: Record<string, string> = {};
  if (params?.startDate) queryParams.startDate = params.startDate;
  if (params?.endDate) queryParams.endDate = params.endDate;
  if (params?.granularity) queryParams.granularity = params.granularity;

  const response = await apiGet<ContextMetrics>(
    '/context/admin/metrics',
    queryParams,
    { requireAuth: false }
  );

  if (response.success) {
    return response.data;
  }

  console.error('获取 Context 指标失败:', response.error);
  return null;
}

/**
 * 获取 Context Package 列表
 */
export async function getContextPackages(
  params?: GetContextPackagesParams
): Promise<GetContextPackagesResponse | null> {
  const queryParams: Record<string, string | number> = {};
  if (params?.page !== undefined) queryParams.page = params.page;
  if (params?.limit !== undefined) queryParams.limit = params.limit;
  if (params?.tripId) queryParams.tripId = params.tripId;
  if (params?.phase) queryParams.phase = params.phase;
  if (params?.agent) queryParams.agent = params.agent;
  if (params?.startDate) queryParams.startDate = params.startDate;
  if (params?.endDate) queryParams.endDate = params.endDate;

  const response = await apiGet<GetContextPackagesResponse>(
    '/context/admin/packages',
    queryParams,
    { requireAuth: false }
  );

  if (response.success) {
    return response.data;
  }

  console.error('获取 Context Package 列表失败:', response.error);
  return null;
}

/**
 * 获取 Context Package 详情
 */
export async function getContextPackageDetail(
  id: string
): Promise<ContextPackageDetail | null> {
  const response = await apiGet<ContextPackageDetail>(
    `/context/admin/packages/${id}`,
    undefined,
    { requireAuth: false }
  );

  if (response.success) {
    return response.data;
  }

  console.error('获取 Context Package 详情失败:', response.error);
  return null;
}

/**
 * 获取 Context 分析
 */
export async function getContextAnalytics(
  params?: GetContextAnalyticsParams
): Promise<ContextAnalytics | null> {
  const queryParams: Record<string, string> = {};
  if (params?.startDate) queryParams.startDate = params.startDate;
  if (params?.endDate) queryParams.endDate = params.endDate;
  if (params?.groupBy) queryParams.groupBy = params.groupBy;

  const response = await apiGet<ContextAnalytics>(
    '/context/admin/analytics',
    queryParams,
    { requireAuth: false }
  );

  if (response.success) {
    return response.data;
  }

  console.error('获取 Context 分析失败:', response.error);
  return null;
}
