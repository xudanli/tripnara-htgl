/**
 * 行程管理 API 服务（Admin）
 */

import { apiGet, apiPost } from '@/lib/api-client';
import type {
  TripListItem,
  GetTripsAdminParams,
  GetTripsAdminResponse,
  TripStats,
  GetTripStatsParams,
  TripDetail,
  BatchOperationRequest,
  BatchOperationResponse,
} from '@/types/api';

/**
 * 获取行程列表
 */
export async function getTripsAdmin(
  params?: GetTripsAdminParams
): Promise<GetTripsAdminResponse | null> {
  const queryParams: Record<string, string | number | boolean> = {};
  if (params?.page !== undefined) queryParams.page = params.page;
  if (params?.limit !== undefined) queryParams.limit = params.limit;
  if (params?.status) queryParams.status = params.status;
  if (params?.destination) queryParams.destination = params.destination;
  if (params?.startDateFrom) queryParams.startDateFrom = params.startDateFrom;
  if (params?.startDateTo) queryParams.startDateTo = params.startDateTo;
  if (params?.createdAtFrom) queryParams.createdAtFrom = params.createdAtFrom;
  if (params?.createdAtTo) queryParams.createdAtTo = params.createdAtTo;
  if (params?.userId) queryParams.userId = params.userId;
  if (params?.sortBy) queryParams.sortBy = params.sortBy;
  if (params?.sortOrder) queryParams.sortOrder = params.sortOrder;
  if (params?.search) queryParams.search = params.search;

  const response = await apiGet<GetTripsAdminResponse>('/trips/admin', queryParams, {
    requireAuth: false,
  });

  if (response.success) {
    return response.data;
  }

  console.error('获取行程列表失败:', response.error);
  return null;
}

/**
 * 获取行程统计信息
 */
export async function getTripStats(
  params?: GetTripStatsParams
): Promise<TripStats | null> {
  const queryParams: Record<string, string> = {};
  if (params?.startDate) queryParams.startDate = params.startDate;
  if (params?.endDate) queryParams.endDate = params.endDate;
  if (params?.destination) queryParams.destination = params.destination;

  const response = await apiGet<TripStats>('/trips/admin/stats', queryParams, {
    requireAuth: false,
  });

  if (response.success) {
    return response.data;
  }

  console.error('获取行程统计失败:', response.error);
  return null;
}

/**
 * 获取行程详情
 */
export async function getTripDetail(id: string): Promise<TripDetail | null> {
  const response = await apiGet<TripDetail>(`/trips/admin/${id}`, undefined, {
    requireAuth: false,
  });

  if (response.success) {
    return response.data;
  }

  console.error('获取行程详情失败:', response.error);
  return null;
}

/**
 * 批量操作
 */
export async function batchOperation(
  data: BatchOperationRequest
): Promise<BatchOperationResponse | null> {
  const response = await apiPost<BatchOperationResponse>('/trips/admin/batch', data, {
    requireAuth: false,
  });

  if (response.success) {
    return response.data;
  }

  console.error('批量操作失败:', response.error);
  return null;
}

/**
 * 导出行程数据
 */
export async function exportTripData(
  id: string,
  format: 'json' | 'csv' = 'json'
): Promise<Blob | null> {
  const response = await apiGet<Blob>(
    `/trips/admin/${id}/export`,
    { format },
    {
      requireAuth: false,
    }
  );

  if (response.success) {
    return response.data;
  }

  console.error('导出行程数据失败:', response.error);
  return null;
}
