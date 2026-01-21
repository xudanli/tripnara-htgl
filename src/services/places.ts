/**
 * 地点/POI管理 API 服务
 */

import { apiGet, apiPut, apiDelete } from '@/lib/api-client';
import type {
  Place,
  PlaceListItem,
  GetPlacesParams,
  GetPlacesResponse,
  UpdatePlaceRequest,
} from '@/types/api';

/**
 * 获取地点列表
 * 使用 /places/admin 接口
 */
export async function getPlaces(
  params?: GetPlacesParams
): Promise<GetPlacesResponse | null> {
  // 构建查询参数，过滤掉 undefined 值
  const queryParams: Record<string, string | number | boolean> = {};
  if (params?.page !== undefined) queryParams.page = params.page;
  if (params?.limit !== undefined) queryParams.limit = params.limit;
  if (params?.search) queryParams.search = params.search;
  if (params?.category) queryParams.category = params.category;
  if (params?.cityId !== undefined) queryParams.cityId = params.cityId;
  if (params?.countryCode) queryParams.countryCode = params.countryCode;
  if (params?.orderBy) queryParams.orderBy = params.orderBy;
  if (params?.orderDirection) queryParams.orderDirection = params.orderDirection;

  const response = await apiGet<GetPlacesResponse>(
    '/places/admin',
    queryParams,
    {
      requireAuth: false, // 根据文档，地点接口无需认证
    }
  );
  
  if (response.success) {
    return response.data;
  }
  
  console.error('获取地点列表失败:', response.error);
  return null;
}

/**
 * 获取地点详情
 */
export async function getPlaceById(id: number): Promise<Place | null> {
  const response = await apiGet<Place>(`/places/admin/${id}`, {}, {
    requireAuth: false, // 根据文档，地点接口无需认证
  });
  
  if (response.success) {
    return response.data;
  }
  
  console.error('获取地点详情失败:', response.error);
  return null;
}

/**
 * 更新地点信息
 */
export async function updatePlace(
  id: number,
  data: UpdatePlaceRequest
): Promise<Place | null> {
  const response = await apiPut<Place>(`/places/admin/${id}`, data, {
    requireAuth: false, // 根据文档，地点接口无需认证
  });
  
  if (response.success) {
    return response.data;
  }
  
  console.error('更新地点失败:', response.error);
  return null;
}

/**
 * 删除地点
 */
export async function deletePlace(
  id: number
): Promise<{ message: string; id: number } | null> {
  const response = await apiDelete<{ message: string; id: number }>(
    `/places/admin/${id}`,
    {
      requireAuth: false, // 根据文档，地点接口无需认证
    }
  );
  
  if (response.success) {
    return response.data;
  }
  
  console.error('删除地点失败:', response.error);
  return null;
}
