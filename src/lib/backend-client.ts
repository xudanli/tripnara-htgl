/**
 * 后端服务客户端（服务端使用）
 * 用于 Next.js API 路由中调用真实的后端服务
 */

// 获取后端服务基础 URL（服务端环境变量，不需要 NEXT_PUBLIC_ 前缀）
// 注意：后端服务的基础 URL 已经包含了 /api 前缀
// 支持两种配置方式：
// 1. 直接配置完整 URL: BACKEND_API_BASE_URL=http://10.108.49.63:3000/api
// 2. 分别配置 HOST 和 PORT: BACKEND_HOST=10.108.49.63 BACKEND_PORT=3000
function getBackendBaseUrl(): string {
  // 优先使用完整的 URL 配置
  if (process.env.BACKEND_API_BASE_URL) {
    return process.env.BACKEND_API_BASE_URL;
  }
  if (process.env.NEXT_PUBLIC_BACKEND_API_BASE_URL) {
    return process.env.NEXT_PUBLIC_BACKEND_API_BASE_URL;
  }
  
  // 如果配置了 HOST 和 PORT，则组合使用
  const host = process.env.BACKEND_HOST || process.env.NEXT_PUBLIC_BACKEND_HOST || 'localhost';
  const port = process.env.BACKEND_PORT || process.env.NEXT_PUBLIC_BACKEND_PORT || '3000';
  
  return `http://${host}:${port}/api`;
}

const BACKEND_BASE_URL = getBackendBaseUrl();

/**
 * 获取后端服务的完整 URL
 */
export function getBackendUrl(path: string): string {
  // 如果 path 已经包含 /api 前缀，需要去掉它（因为后端服务基础 URL 已经包含 /api）
  let cleanPath = path;
  if (cleanPath.startsWith('/api')) {
    cleanPath = cleanPath.substring(4); // 去掉 '/api' 前缀
  }
  
  // 确保 path 以 / 开头
  if (!cleanPath.startsWith('/')) {
    cleanPath = `/${cleanPath}`;
  }
  
  // 拼接完整 URL
  return `${BACKEND_BASE_URL}${cleanPath}`;
}

/**
 * 代理请求到后端服务
 */
export async function proxyToBackend<T = unknown>(
  path: string,
  options: RequestInit = {}
): Promise<Response> {
  const url = getBackendUrl(path);
  
  // 构建请求配置
  const requestOptions: RequestInit = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  };

  try {
    console.log(`[Backend Client] 请求后端服务: ${url}`);
    const response = await fetch(url, requestOptions);
    console.log(`[Backend Client] 响应状态: ${response.status} ${response.statusText}`);
    return response;
  } catch (error: unknown) {
    const isConnectionRefused =
      error instanceof TypeError && (error as { cause?: { code?: string } }).cause?.code === 'ECONNREFUSED';
    const isFetchFailed = error instanceof TypeError && (error as Error).message === 'fetch failed';
    if (isConnectionRefused || isFetchFailed) {
      console.warn(`[Backend Client] 后端服务不可用 [${path}]: 请确认后端已启动 (默认 http://localhost:3000)`);
      return new Response(
        JSON.stringify({
          success: false,
          error: {
            code: 'BACKEND_UNAVAILABLE',
            message: '后端服务不可用，请确认后端已启动（默认端口 3000）',
          },
        }),
        {
          status: 503,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }
    console.error(`[Backend Client] 后端服务请求失败 [${path}]:`, error);
    throw error;
  }
}

/**
 * 代理 GET 请求到后端服务
 */
export async function proxyGetToBackend<T = unknown>(
  path: string,
  searchParams?: URLSearchParams | Record<string, string | number | boolean | undefined>
): Promise<Response> {
  let url = path;
  
  // 处理查询参数
  if (searchParams) {
    const params = new URLSearchParams();
    if (searchParams instanceof URLSearchParams) {
      searchParams.forEach((value, key) => {
        params.append(key, value);
      });
    } else {
      Object.entries(searchParams).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });
    }
    const queryString = params.toString();
    if (queryString) {
      url += `?${queryString}`;
    }
  }

  return proxyToBackend<T>(url, {
    method: 'GET',
  });
}

/**
 * 代理 POST 请求到后端服务
 */
export async function proxyPostToBackend<T = unknown>(
  path: string,
  body?: unknown
): Promise<Response> {
  return proxyToBackend<T>(path, {
    method: 'POST',
    body: body ? JSON.stringify(body) : undefined,
  });
}

/**
 * 代理 PUT 请求到后端服务
 */
export async function proxyPutToBackend<T = unknown>(
  path: string,
  body?: unknown
): Promise<Response> {
  return proxyToBackend<T>(path, {
    method: 'PUT',
    body: body ? JSON.stringify(body) : undefined,
  });
}

/**
 * 代理 DELETE 请求到后端服务
 */
export async function proxyDeleteToBackend<T = unknown>(
  path: string,
  searchParams?: URLSearchParams | Record<string, string | number | boolean | undefined>
): Promise<Response> {
  let url = path;
  
  // 处理查询参数
  if (searchParams) {
    const params = new URLSearchParams();
    if (searchParams instanceof URLSearchParams) {
      searchParams.forEach((value, key) => {
        params.append(key, value);
      });
    } else {
      Object.entries(searchParams).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });
    }
    const queryString = params.toString();
    if (queryString) {
      url += `?${queryString}`;
    }
  }

  return proxyToBackend<T>(url, {
    method: 'DELETE',
  });
}

/**
 * 代理 FormData 请求到后端服务（用于文件上传）
 */
export async function proxyFormDataToBackend(
  path: string,
  formData: FormData
): Promise<Response> {
  const url = getBackendUrl(path);

  try {
    console.log(`[Backend Client] FormData 请求后端服务: ${url}`);
    const response = await fetch(url, {
      method: 'POST',
      body: formData,
      // 注意：不要设置 Content-Type，让浏览器/Node 自动设置 boundary
    });
    console.log(`[Backend Client] 响应状态: ${response.status} ${response.statusText}`);
    return response;
  } catch (error: unknown) {
    const isConnectionRefused =
      error instanceof TypeError && (error as { cause?: { code?: string } }).cause?.code === 'ECONNREFUSED';
    const isFetchFailed = error instanceof TypeError && (error as Error).message === 'fetch failed';
    if (isConnectionRefused || isFetchFailed) {
      console.warn(`[Backend Client] 后端服务不可用 [${path}]: 请确认后端已启动`);
      return new Response(
        JSON.stringify({
          success: false,
          error: {
            code: 'BACKEND_UNAVAILABLE',
            message: '后端服务不可用，请确认后端已启动（默认端口 3000）',
          },
        }),
        {
          status: 503,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }
    console.error(`[Backend Client] FormData 请求失败 [${path}]:`, error);
    throw error;
  }
}
