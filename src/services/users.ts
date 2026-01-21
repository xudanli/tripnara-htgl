/**
 * 用户管理 API 服务
 */

import { apiGet, apiPut, apiDelete } from '@/lib/api-client';
import type {
  User,
  UserDetail,
  UserStats,
  GetUsersParams,
  GetUsersResponse,
  UpdateUserRequest,
  DeleteUserResponse,
} from '@/types/api';

/**
 * 获取用户统计信息
 */
export async function getUserStats(): Promise<UserStats | null> {
  const response = await apiGet<UserStats>('/users/admin/stats', undefined, {
    requireAuth: false,
  });

  if (response.success) {
    return response.data;
  }

  console.error('获取用户统计失败:', response.error);
  return null;
}

/**
 * 获取用户列表
 */
export async function getUsers(
  params?: GetUsersParams
): Promise<GetUsersResponse | null> {
  const queryParams: Record<string, string | number | boolean> = {};
  if (params?.page !== undefined) queryParams.page = params.page;
  if (params?.limit !== undefined) queryParams.limit = params.limit;
  if (params?.search) queryParams.search = params.search;
  if (params?.emailVerified !== undefined) queryParams.emailVerified = params.emailVerified;

  const response = await apiGet<GetUsersResponse>('/users/admin', queryParams, {
    requireAuth: false,
  });

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
  const response = await apiGet<User>(`/users/admin/${id}`, undefined, {
    requireAuth: false,
  });

  if (response.success) {
    return response.data;
  }

  console.error('获取用户详情失败:', response.error);
  return null;
}

/**
 * 获取用户详情（含关联数据）
 */
export async function getUserDetail(id: string): Promise<UserDetail | null> {
  const response = await apiGet<UserDetail>(`/users/admin/${id}/detail`, undefined, {
    requireAuth: false,
  });

  if (response.success) {
    return response.data;
  }

  console.error('获取用户详情（含关联数据）失败:', response.error);
  return null;
}

/**
 * 更新用户信息
 */
export async function updateUser(
  id: string,
  data: UpdateUserRequest
): Promise<User | null> {
  const response = await apiPut<User>(`/users/admin/${id}`, data, {
    requireAuth: false,
  });

  if (response.success) {
    return response.data;
  }

  console.error('更新用户信息失败:', response.error);
  return null;
}

/**
 * 删除用户
 */
export async function deleteUser(id: string): Promise<DeleteUserResponse | null> {
  const response = await apiDelete<DeleteUserResponse>(`/users/admin/${id}`, {
    requireAuth: false,
  });

  if (response.success) {
    return response.data;
  }

  console.error('删除用户失败:', response.error);
  return null;
}
