/**
 * 准备度Pack管理 API 服务
 */

import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api-client';
import type {
  ReadinessPack,
  ReadinessPackListItem,
  GetReadinessPacksParams,
  GetReadinessPacksResponse,
  CreateReadinessPackRequest,
  UpdateReadinessPackRequest,
} from '@/types/api';

/**
 * 获取Pack列表
 */
export async function getReadinessPacks(
  params?: GetReadinessPacksParams
): Promise<GetReadinessPacksResponse | null> {
  const response = await apiGet<GetReadinessPacksResponse>(
    '/readiness/admin/packs',
    params
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
  const response = await apiGet<ReadinessPack>(
    `/readiness/admin/packs/${id}`
  );
  
  if (response.success) {
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
    data
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
    data
  );
  
  if (response.success) {
    return response.data;
  }
  
  console.error('更新Pack失败:', response.error);
  return null;
}

/**
 * 删除Pack（软删除）
 */
export async function deleteReadinessPack(
  id: string
): Promise<{ message: string } | null> {
  const response = await apiDelete<{ message: string }>(
    `/readiness/admin/packs/${id}`
  );
  
  if (response.success) {
    return response.data;
  }
  
  console.error('删除Pack失败:', response.error);
  return null;
}
