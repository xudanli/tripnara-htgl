/**
 * 打包清单模板管理 API 服务（Admin）
 */

import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api-client';
import type {
  PackingChecklistTemplateListItem,
  PackingChecklistTemplateDetail,
  GetPackingTemplatesParams,
  GetPackingTemplatesResponse,
  CreatePackingTemplateRequest,
  UpdatePackingTemplateRequest,
  ActivatePackingTemplateRequest,
  BatchImportPackingTemplatesRequest,
  BatchImportPackingTemplatesResponse,
  PackingTemplatesStats,
  DeletePackingTemplateResponse,
} from '@/types/api';

/**
 * 获取打包清单模板列表
 */
export async function getPackingTemplates(
  params?: GetPackingTemplatesParams
): Promise<GetPackingTemplatesResponse | null> {
  const queryParams: Record<string, string | number | boolean> = {};
  if (params?.page !== undefined) queryParams.page = params.page;
  if (params?.limit !== undefined) queryParams.limit = params.limit;
  if (params?.version) queryParams.version = params.version;
  if (params?.isActive !== undefined) queryParams.isActive = params.isActive;
  if (params?.search) queryParams.search = params.search;

  const response = await apiGet<GetPackingTemplatesResponse>(
    '/readiness/admin/packing-templates',
    queryParams,
    { requireAuth: false }
  );

  if (response.success) {
    return response.data;
  }

  console.error('获取打包清单模板列表失败:', response.error);
  return null;
}

/**
 * 获取打包清单模板详情
 */
export async function getPackingTemplateDetail(
  id: string
): Promise<PackingChecklistTemplateDetail | null> {
  const response = await apiGet<PackingChecklistTemplateDetail>(
    `/readiness/admin/packing-templates/${id}`,
    undefined,
    { requireAuth: false }
  );

  if (response.success) {
    return response.data;
  }

  console.error('获取打包清单模板详情失败:', response.error);
  return null;
}

/**
 * 创建打包清单模板
 */
export async function createPackingTemplate(
  data: CreatePackingTemplateRequest
): Promise<PackingChecklistTemplateListItem | null> {
  const response = await apiPost<PackingChecklistTemplateListItem>(
    '/readiness/admin/packing-templates',
    data,
    { requireAuth: false }
  );

  if (response.success) {
    return response.data;
  }

  console.error('创建打包清单模板失败:', response.error);
  return null;
}

/**
 * 更新打包清单模板
 */
export async function updatePackingTemplate(
  id: string,
  data: UpdatePackingTemplateRequest
): Promise<PackingChecklistTemplateListItem | null> {
  const response = await apiPut<PackingChecklistTemplateListItem>(
    `/readiness/admin/packing-templates/${id}`,
    data,
    { requireAuth: false }
  );

  if (response.success) {
    return response.data;
  }

  console.error('更新打包清单模板失败:', response.error);
  return null;
}

/**
 * 删除打包清单模板（软删除）
 */
export async function deletePackingTemplate(
  id: string
): Promise<DeletePackingTemplateResponse | null> {
  const response = await apiDelete<DeletePackingTemplateResponse>(
    `/readiness/admin/packing-templates/${id}`,
    { requireAuth: false }
  );

  if (response.success) {
    return response.data;
  }

  console.error('删除打包清单模板失败:', response.error);
  return null;
}

/**
 * 激活/停用打包清单模板
 */
export async function activatePackingTemplate(
  id: string,
  data: ActivatePackingTemplateRequest
): Promise<PackingChecklistTemplateListItem | null> {
  // 使用 apiRequest 来发送 PATCH 请求
  const { apiRequest } = await import('@/lib/api-client');
  const response = await apiRequest<PackingChecklistTemplateListItem>(
    `/readiness/admin/packing-templates/${id}/activate`,
    {
      method: 'PATCH',
      body: JSON.stringify(data),
      requireAuth: false,
    }
  );

  if (response.success) {
    return response.data;
  }

  console.error('激活/停用打包清单模板失败:', response.error);
  return null;
}

/**
 * 批量导入打包清单模板
 */
export async function batchImportPackingTemplates(
  data: BatchImportPackingTemplatesRequest
): Promise<BatchImportPackingTemplatesResponse | null> {
  const response = await apiPost<BatchImportPackingTemplatesResponse>(
    '/readiness/admin/packing-templates/batch-import',
    data,
    { requireAuth: false }
  );

  if (response.success) {
    return response.data;
  }

  console.error('批量导入打包清单模板失败:', response.error);
  return null;
}

/**
 * 获取打包清单模板统计信息
 */
export async function getPackingTemplatesStats(): Promise<PackingTemplatesStats | null> {
  const response = await apiGet<PackingTemplatesStats>(
    '/readiness/admin/packing-templates/stats',
    undefined,
    { requireAuth: false }
  );

  if (response.success) {
    return response.data;
  }

  console.error('获取打包清单模板统计信息失败:', response.error);
  return null;
}
