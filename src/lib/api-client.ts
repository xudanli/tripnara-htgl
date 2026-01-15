/**
 * API 客户端基础配置
 */

import type { ApiResponse, ErrorResponse } from '@/types/api';

// API 基础配置
// 支持 Vite (import.meta.env) 和 Next.js (process.env)
const getEnvVar = (key: string): string | undefined => {
  // Next.js 客户端环境变量（在浏览器中）
  if (typeof window !== 'undefined') {
    // Next.js 会将 NEXT_PUBLIC_* 变量注入到客户端
    if (typeof process !== 'undefined' && process.env) {
      return process.env[key];
    }
  }
  // Vite 环境变量
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    return import.meta.env[key];
  }
  // Node.js/Next.js 服务端环境变量
  if (typeof process !== 'undefined' && process.env) {
    return process.env[key];
  }
  return undefined;
};

const API_BASE_URL = 
  getEnvVar('NEXT_PUBLIC_API_BASE_URL') || 
  getEnvVar('VITE_API_BASE_URL') || 
  'http://localhost:3000/api';

/**
 * 获取完整的API URL
 */
function getApiUrl(path: string): string {
  // 如果path已经包含/api前缀，直接使用
  if (path.startsWith('/api')) {
    return `${API_BASE_URL.replace(/\/api$/, '')}${path}`;
  }
  // 否则添加前缀
  return `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}

/**
 * 获取认证Token（从localStorage或其他存储中）
 */
function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('access_token');
}

/**
 * 检查响应是否为错误响应
 */
function isErrorResponse<T>(response: ApiResponse<T>): response is ErrorResponse {
  return !response.success;
}

/**
 * API 请求配置
 */
interface RequestConfig extends RequestInit {
  requireAuth?: boolean; // 是否需要认证，默认true
}

/**
 * 通用API请求函数
 */
export async function apiRequest<T>(
  path: string,
  config: RequestConfig = {}
): Promise<ApiResponse<T>> {
  const {
    requireAuth = true,
    headers = {},
    ...restConfig
  } = config;

  // 构建请求头
  const requestHeaders: HeadersInit = {
    'Content-Type': 'application/json',
    ...headers,
  };

  // 添加认证Token
  if (requireAuth) {
    const token = getAuthToken();
    if (token) {
      requestHeaders['Authorization'] = `Bearer ${token}`;
    }
  }

  try {
    const url = getApiUrl(path);
    const response = await fetch(url, {
      ...restConfig,
      headers: requestHeaders,
    });

    // 解析响应
    const data = await response.json();

    // 如果HTTP状态码不是2xx，返回错误响应
    if (!response.ok) {
      return {
        success: false,
        error: {
          code: data.error?.code || 'HTTP_ERROR',
          message: data.error?.message || `HTTP ${response.status}: ${response.statusText}`,
        },
      };
    }

    return data as ApiResponse<T>;
  } catch (error) {
    // 网络错误或其他异常
    return {
      success: false,
      error: {
        code: 'NETWORK_ERROR',
        message: error instanceof Error ? error.message : '网络请求失败',
      },
    };
  }
}

/**
 * GET 请求
 */
export async function apiGet<T>(
  path: string,
  params?: Record<string, string | number | boolean | undefined>,
  config?: Omit<RequestConfig, 'method' | 'body'>
): Promise<ApiResponse<T>> {
  // 构建查询参数
  let url = path;
  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      url += `?${queryString}`;
    }
  }

  return apiRequest<T>(url, {
    ...config,
    method: 'GET',
  });
}

/**
 * POST 请求
 */
export async function apiPost<T>(
  path: string,
  body?: unknown,
  config?: Omit<RequestConfig, 'method' | 'body'>
): Promise<ApiResponse<T>> {
  return apiRequest<T>(path, {
    ...config,
    method: 'POST',
    body: body ? JSON.stringify(body) : undefined,
  });
}

/**
 * PUT 请求
 */
export async function apiPut<T>(
  path: string,
  body?: unknown,
  config?: Omit<RequestConfig, 'method' | 'body'>
): Promise<ApiResponse<T>> {
  return apiRequest<T>(path, {
    ...config,
    method: 'PUT',
    body: body ? JSON.stringify(body) : undefined,
  });
}

/**
 * DELETE 请求
 */
export async function apiDelete<T>(
  path: string,
  config?: Omit<RequestConfig, 'method' | 'body'>
): Promise<ApiResponse<T>> {
  return apiRequest<T>(path, {
    ...config,
    method: 'DELETE',
  });
}

/**
 * 导出工具函数
 */
export { isErrorResponse, getApiUrl, getAuthToken };
