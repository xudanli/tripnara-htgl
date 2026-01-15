/**
 * 用户管理 API 服务
 */

import { apiGet, apiPut } from '@/lib/api-client';
import type {
  User,
  GetUsersParams,
  GetUsersResponse,
  UpdateUserRequest,
} from '@/types/api';

/**
 * 获取用户列表
 */
export async function getUsers(
  params?: GetUsersParams
): Promise<GetUsersResponse | null> {
  const response = await apiGet<GetUsersResponse>('/users/admin', params);
  
  if (response.success) {
    return response.data;
  }
  
  console.error('获取用户列表失败:', response.error);
  return null;
}

/**
 * 获取用户详情
 */
export async function getUserById(id: string): Promise<User | null> {
  const response = await apiGet<User>(`/users/admin/${id}`);
  
  if (response.success) {
    return response.data;
  }
  
  console.error('获取用户详情失败:', response.error);
  return null;
}

/**
 * 更新用户信息
 */
export async function updateUser(
  id: string,
  data: UpdateUserRequest
): Promise<User | null> {
  const response = await apiPut<User>(`/users/admin/${id}`, data);
  
  if (response.success) {
    return response.data;
  }
  
  console.error('更新用户信息失败:', response.error);
  return null;
}
