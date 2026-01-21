/**
 * 准备度Pack管理 API 服务
 */

import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api-client';
import type {
  ReadinessPack,
  GetReadinessPacksParams,
  GetReadinessPacksResponse,
  CreateReadinessPackRequest,
  UpdateReadinessPackRequest,
  DeleteReadinessPackResponse,
} from '@/types/api';

/**
 * 获取Pack列表
 */
export async function getReadinessPacks(
  params?: GetReadinessPacksParams
): Promise<GetReadinessPacksResponse | null> {
  // 构建查询参数，确保布尔值正确传递
  const queryParams: Record<string, string | number | boolean> = {};
  if (params?.page !== undefined) queryParams.page = params.page;
  if (params?.limit !== undefined) queryParams.limit = params.limit;
  if (params?.countryCode) queryParams.countryCode = params.countryCode;
  if (params?.destinationId) queryParams.destinationId = params.destinationId;
  if (params?.isActive !== undefined) queryParams.isActive = params.isActive;
  if (params?.search) queryParams.search = params.search;

  const response = await apiGet<GetReadinessPacksResponse>(
    '/readiness/admin/packs',
    queryParams,
    { requireAuth: false }
  );
  
  if (response.success) {
    return response.data;
  }
  
  console.error('获取Pack列表失败:', response.error);
  return null;
}

/**
 * 获取Pack详情
 */
export async function getReadinessPackById(
  id: string
): Promise<ReadinessPack | null> {
  console.log('正在获取Pack详情, ID:', id);
  const response = await apiGet<ReadinessPack>(
    `/readiness/admin/packs/${id}`,
    undefined,
    { requireAuth: false }
  );
  
  console.log('Pack详情API响应:', response);
  
  if (response.success) {
    console.log('Pack详情数据:', response.data);
    return response.data;
  }
  
  console.error('获取Pack详情失败:', response.error);
  return null;
}

/**
 * 创建Pack
 */
export async function createReadinessPack(
  data: CreateReadinessPackRequest
): Promise<ReadinessPack | null> {
  const response = await apiPost<ReadinessPack>(
    '/readiness/admin/packs',
    data,
    { requireAuth: false }
  );
  
  if (response.success) {
    return response.data;
  }
  
  console.error('创建Pack失败:', response.error);
  return null;
}

/**
 * 更新Pack
 */
export async function updateReadinessPack(
  id: string,
  data: UpdateReadinessPackRequest
): Promise<ReadinessPack | null> {
  const response = await apiPut<ReadinessPack>(
    `/readiness/admin/packs/${id}`,
    data,
    { requireAuth: false }
  );
  
  if (response.success) {
    return response.data;
  }
  
  console.error('更新Pack失败:', response.error);
  return null;
}

/**
 * 删除Pack
 */
export async function deleteReadinessPack(
  id: string
): Promise<DeleteReadinessPackResponse | null> {
  const response = await apiDelete<DeleteReadinessPackResponse>(
    `/readiness/admin/packs/${id}`,
    { requireAuth: false }
  );
  
  if (response.success) {
    return response.data;
  }
  
  console.error('删除Pack失败:', response.error);
  return null;
}
