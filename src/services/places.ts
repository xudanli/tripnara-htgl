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
 */
export async function getPlaces(
  params?: GetPlacesParams
): Promise<GetPlacesResponse | null> {
  const response = await apiGet<GetPlacesResponse>(
    '/places/admin',
    params as Record<string, string | number | boolean | undefined>,
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
