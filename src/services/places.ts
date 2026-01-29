/**
 * 地点/POI管理 API 服务
 */

import { apiGet, apiPut, apiDelete, apiPost } from '@/lib/api-client';
import type {
  Place,
  PlaceListItem,
  GetPlacesParams,
  GetPlacesResponse,
  CreatePlaceDto,
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
 * 创建新地点
 * POST /places/admin
 * @param data 地点创建数据
 */
export async function createPlace(
  data: CreatePlaceDto
): Promise<Place | null> {
  try {
    const response = await apiPost<Place>(
      '/places/admin',
      data,
      {
        requireAuth: false, // 根据文档，地点接口无需认证
      }
    );
    
    if (response.success) {
      return response.data;
    }
    
    // 如果响应不成功，抛出错误以便前端捕获
    const errorMessage = response.error?.message || '创建地点失败';
    const errorCode = response.error?.code || 'UNKNOWN_ERROR';
    console.error('创建地点失败:', response.error);
    
    // 抛出错误，让调用方可以捕获
    throw new Error(`${errorCode}: ${errorMessage}`);
  } catch (error) {
    // 如果是网络错误或其他错误，也抛出
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('创建地点时发生未知错误');
  }
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

/**
 * 批量获取POI详情
 * POST /places/admin/batch
 * 根据POI ID数组批量获取POI详情，用于在日计划中显示已选POI的完整信息
 * @param ids POI ID数组
 */
export async function getPlacesBatch(
  ids: number[]
): Promise<{ places: Place[] } | null> {
  if (!ids || ids.length === 0) {
    console.error('POI ID数组不能为空');
    return null;
  }

  const response = await apiPost<{ places: Place[] }>(
    '/places/admin/batch',
    { ids },
    {
      requireAuth: false, // 根据文档，地点接口无需认证
    }
  );
  
  if (response.success) {
    return response.data;
  }
  
  console.error('批量获取POI详情失败:', response.error);
  return null;
}
