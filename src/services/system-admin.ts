/**
 * 系统监控 API 服务（Admin）
 */

import { apiGet } from '@/lib/api-client';
import type {
  GetPerformanceParams,
  PerformanceMetrics,
  GetErrorLogsParams,
  ErrorLogsStats,
  GetRequestStatsParams,
  RequestStatsResponse,
  DatabaseStatusResponse,
  CacheStatusResponse,
} from '@/types/api';

/**
 * 获取系统指标
 */
export async function getSystemMetrics(): Promise<any | null> {
  const response = await apiGet<any>(
    '/system/admin/metrics',
    undefined,
    { requireAuth: false }
  );

  if (response.success) {
    return response.data;
  }

  console.error('获取系统指标失败:', response.error);
  return null;
}

/**
 * 获取性能指标
 */
export async function getPerformanceMetrics(
  params?: GetPerformanceParams
): Promise<PerformanceMetrics | null> {
  const queryParams: Record<string, string> = {};
  if (params?.startTime) queryParams.startTime = params.startTime;
  if (params?.endTime) queryParams.endTime = params.endTime;
  if (params?.granularity) queryParams.granularity = params.granularity;

  const response = await apiGet<PerformanceMetrics>(
    '/system/admin/performance',
    queryParams,
    { requireAuth: false }
  );

  if (response.success) {
    return response.data;
  }

  console.error('获取性能指标失败:', response.error);
  return null;
}

/**
 * 获取错误日志统计
 */
export async function getErrorLogsStats(
  params?: GetErrorLogsParams
): Promise<ErrorLogsStats | null> {
  const queryParams: Record<string, string> = {};
  if (params?.startTime) queryParams.startTime = params.startTime;
  if (params?.endTime) queryParams.endTime = params.endTime;
  if (params?.level) queryParams.level = params.level;

  const response = await apiGet<ErrorLogsStats>(
    '/system/admin/errors',
    queryParams,
    { requireAuth: false }
  );

  if (response.success) {
    return response.data;
  }

  console.error('获取错误日志统计失败:', response.error);
  return null;
}

/**
 * 获取请求统计
 */
export async function getRequestStats(
  params?: GetRequestStatsParams
): Promise<RequestStatsResponse | null> {
  const queryParams: Record<string, string> = {};
  if (params?.startTime) queryParams.startTime = params.startTime;
  if (params?.endTime) queryParams.endTime = params.endTime;
  if (params?.granularity) queryParams.granularity = params.granularity;

  const response = await apiGet<RequestStatsResponse>(
    '/system/admin/requests',
    queryParams,
    { requireAuth: false }
  );

  if (response.success) {
    return response.data;
  }

  console.error('获取请求统计失败:', response.error);
  return null;
}

/**
 * 获取数据库状态
 */
export async function getDatabaseStatus(): Promise<DatabaseStatusResponse | null> {
  const response = await apiGet<DatabaseStatusResponse>(
    '/system/admin/database',
    undefined,
    { requireAuth: false }
  );

  if (response.success) {
    return response.data;
  }

  console.error('获取数据库状态失败:', response.error);
  return null;
}

/**
 * 获取缓存状态
 */
export async function getCacheStatus(): Promise<CacheStatusResponse | null> {
  const response = await apiGet<CacheStatusResponse>(
    '/system/admin/cache',
    undefined,
    { requireAuth: false }
  );

  if (response.success) {
    return response.data;
  }

  console.error('获取缓存状态失败:', response.error);
  return null;
}
