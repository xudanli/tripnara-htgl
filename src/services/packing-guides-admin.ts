/**
 * 打包指南管理 API 服务（Admin）
 */

import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api-client';
import type {
  PackingGuideListItem,
  PackingGuideDetail,
  GetPackingGuidesParams,
  GetPackingGuidesResponse,
  CreatePackingGuideRequest,
  UpdatePackingGuideRequest,
  ActivatePackingGuideRequest,
  BatchImportPackingGuidesRequest,
  BatchImportPackingGuidesResponse,
  PackingGuidesStats,
  DeletePackingGuideResponse,
} from '@/types/api';

/**
 * 获取打包指南列表
 */
export async function getPackingGuides(
  params?: GetPackingGuidesParams
): Promise<GetPackingGuidesResponse | null> {
  const queryParams: Record<string, string | number | boolean> = {};
  if (params?.page !== undefined) queryParams.page = params.page;
  if (params?.limit !== undefined) queryParams.limit = params.limit;
  if (params?.version) queryParams.version = params.version;
  if (params?.isActive !== undefined) queryParams.isActive = params.isActive;
  if (params?.search) queryParams.search = params.search;

  const response = await apiGet<GetPackingGuidesResponse>(
    '/readiness/admin/packing-guides',
    queryParams,
    { requireAuth: false }
  );

  if (response.success) {
    return response.data;
  }

  console.error('获取打包指南列表失败:', response.error);
  return null;
}

/**
 * 获取打包指南详情
 */
export async function getPackingGuideDetail(
  id: string
): Promise<PackingGuideDetail | null> {
  const response = await apiGet<PackingGuideDetail>(
    `/readiness/admin/packing-guides/${id}`,
    undefined,
    { requireAuth: false }
  );

  if (response.success) {
    return response.data;
  }

  console.error('获取打包指南详情失败:', response.error);
  return null;
}

/**
 * 创建打包指南
 */
export async function createPackingGuide(
  data: CreatePackingGuideRequest
): Promise<PackingGuideListItem | null> {
  const response = await apiPost<PackingGuideListItem>(
    '/readiness/admin/packing-guides',
    data,
    { requireAuth: false }
  );

  if (response.success) {
    return response.data;
  }

  console.error('创建打包指南失败:', response.error);
  return null;
}

/**
 * 更新打包指南
 */
export async function updatePackingGuide(
  id: string,
  data: UpdatePackingGuideRequest
): Promise<PackingGuideListItem | null> {
  const response = await apiPut<PackingGuideListItem>(
    `/readiness/admin/packing-guides/${id}`,
    data,
    { requireAuth: false }
  );

  if (response.success) {
    return response.data;
  }

  console.error('更新打包指南失败:', response.error);
  return null;
}

/**
 * 删除打包指南（软删除）
 */
export async function deletePackingGuide(
  id: string
): Promise<DeletePackingGuideResponse | null> {
  const response = await apiDelete<DeletePackingGuideResponse>(
    `/readiness/admin/packing-guides/${id}`,
    { requireAuth: false }
  );

  if (response.success) {
    return response.data;
  }

  console.error('删除打包指南失败:', response.error);
  return null;
}

/**
 * 激活/停用打包指南
 */
export async function activatePackingGuide(
  id: string,
  data: ActivatePackingGuideRequest
): Promise<PackingGuideListItem | null> {
  // 使用 apiRequest 来发送 PATCH 请求
  const { apiRequest } = await import('@/lib/api-client');
  const response = await apiRequest<PackingGuideListItem>(
    `/readiness/admin/packing-guides/${id}/activate`,
    {
      method: 'PATCH',
      body: JSON.stringify(data),
      requireAuth: false,
    }
  );

  if (response.success) {
    return response.data;
  }

  console.error('激活/停用打包指南失败:', response.error);
  return null;
}

/**
 * 批量导入打包指南
 */
export async function batchImportPackingGuides(
  data: BatchImportPackingGuidesRequest
): Promise<BatchImportPackingGuidesResponse | null> {
  const response = await apiPost<BatchImportPackingGuidesResponse>(
    '/readiness/admin/packing-guides/batch-import',
    data,
    { requireAuth: false }
  );

  if (response.success) {
    return response.data;
  }

  console.error('批量导入打包指南失败:', response.error);
  return null;
}

/**
 * 获取打包指南统计信息
 */
export async function getPackingGuidesStats(): Promise<PackingGuidesStats | null> {
  const response = await apiGet<PackingGuidesStats>(
    '/readiness/admin/packing-guides/stats',
    undefined,
    { requireAuth: false }
  );

  if (response.success) {
    return response.data;
  }

  console.error('获取打包指南统计信息失败:', response.error);
  return null;
}
