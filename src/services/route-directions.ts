/**
 * 路线模块（Route Directions）API 服务
 */

import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api-client';
import type {
  RouteDirection,
  CreateRouteDirectionDto,
  UpdateRouteDirectionDto,
  QueryRouteDirectionDto,
  RouteTemplate,
  CreateRouteTemplateDto,
  UpdateRouteTemplateDto,
  QueryRouteTemplateDto,
  CreateTripFromRouteTemplateDto,
  ImportCountryPackDto,
  RouteDirectionCard,
  RouteDirectionInteraction,
  RouteDirectionExplainer,
  TraceReport,
  RouteDirectionMetrics,
} from '@/types/api';

// ==================== 路线方向（RouteDirection）CRUD ====================

/**
 * 创建路线方向
 * POST /route-directions
 */
export async function createRouteDirection(
  data: CreateRouteDirectionDto
): Promise<RouteDirection | null> {
  const response = await apiPost<RouteDirection>('/route-directions', data);
  
  if (response.success) {
    return response.data;
  }
  
  console.error('创建路线方向失败:', response.error);
  return null;
}

/**
 * 查询路线方向列表
 * GET /route-directions
 */
export async function getRouteDirections(
  params?: QueryRouteDirectionDto
): Promise<RouteDirection[] | null> {
  // 处理 tags 数组参数
  const queryParams: Record<string, string | number | boolean> = {};
  if (params?.countryCode) queryParams.countryCode = params.countryCode;
  if (params?.tag) queryParams.tag = params.tag;
  if (params?.tags && params.tags.length > 0) {
    // 如果 tags 是数组，可能需要转换为逗号分隔的字符串
    queryParams.tags = params.tags.join(',');
  }
  if (params?.isActive !== undefined) queryParams.isActive = params.isActive;
  if (params?.month !== undefined) queryParams.month = params.month;

  const response = await apiGet<RouteDirection[]>('/route-directions', queryParams);
  
  if (response.success) {
    return response.data;
  }
  
  console.error('查询路线方向列表失败:', response.error);
  return null;
}

/**
 * 根据ID获取路线方向
 * GET /route-directions/:id
 */
export async function getRouteDirectionById(id: number): Promise<RouteDirection | null> {
  const response = await apiGet<RouteDirection>(`/route-directions/${id}`);
  
  if (response.success) {
    return response.data;
  }
  
  console.error('获取路线方向失败:', response.error);
  return null;
}

/**
 * 根据UUID获取路线方向
 * GET /route-directions/uuid/:uuid
 */
export async function getRouteDirectionByUuid(uuid: string): Promise<RouteDirection | null> {
  const response = await apiGet<RouteDirection>(`/route-directions/uuid/${uuid}`);
  
  if (response.success) {
    return response.data;
  }
  
  console.error('获取路线方向失败:', response.error);
  return null;
}

/**
 * 更新路线方向
 * PUT /route-directions/:id
 */
export async function updateRouteDirection(
  id: number,
  data: UpdateRouteDirectionDto
): Promise<RouteDirection | null> {
  const response = await apiPut<RouteDirection>(`/route-directions/${id}`, data);
  
  if (response.success) {
    return response.data;
  }
  
  console.error('更新路线方向失败:', response.error);
  return null;
}

/**
 * 删除路线方向（软删除）
 * DELETE /route-directions/:id
 */
export async function deleteRouteDirection(
  id: number
): Promise<{ message: string } | null> {
  const response = await apiDelete<{ message: string }>(`/route-directions/${id}`);
  
  if (response.success) {
    return response.data;
  }
  
  console.error('删除路线方向失败:', response.error);
  return null;
}

/**
 * 根据国家获取路线方向（用于 Agent 路由）
 * GET /route-directions/by-country/:countryCode
 */
export async function getRouteDirectionsByCountry(
  countryCode: string,
  params?: {
    tags?: string[];
    month?: number;
    limit?: number;
  }
): Promise<RouteDirection[] | null> {
  const queryParams: Record<string, string | number> = {};
  if (params?.tags && params.tags.length > 0) {
    queryParams.tags = params.tags.join(',');
  }
  if (params?.month !== undefined) queryParams.month = params.month;
  if (params?.limit !== undefined) queryParams.limit = params.limit;

  const response = await apiGet<RouteDirection[]>(
    `/route-directions/by-country/${countryCode}`,
    queryParams
  );
  
  if (response.success) {
    return response.data;
  }
  
  console.error('根据国家获取路线方向失败:', response.error);
  return null;
}

// ==================== 路线模板（RouteTemplate）CRUD ====================

/**
 * 创建路线模板
 * POST /route-directions/templates
 */
export async function createRouteTemplate(
  data: CreateRouteTemplateDto
): Promise<RouteTemplate | null> {
  const response = await apiPost<RouteTemplate>('/route-directions/templates', data);
  
  if (response.success) {
    return response.data;
  }
  
  console.error('创建路线模板失败:', response.error);
  return null;
}

/**
 * 查询路线模板列表
 * GET /route-directions/templates
 */
export async function getRouteTemplates(
  params?: QueryRouteTemplateDto
): Promise<RouteTemplate[] | null> {
  const queryParams: Record<string, string | number | boolean> = {};
  if (params?.routeDirectionId !== undefined) {
    queryParams.routeDirectionId = params.routeDirectionId;
  }
  if (params?.durationDays !== undefined) {
    queryParams.durationDays = params.durationDays;
  }
  if (params?.isActive !== undefined) {
    queryParams.isActive = params.isActive;
  }
  if (params?.limit !== undefined) {
    queryParams.limit = params.limit;
  }
  if (params?.offset !== undefined) {
    queryParams.offset = params.offset;
  }

  const response = await apiGet<RouteTemplate[]>('/route-directions/templates', queryParams);
  
  if (response.success) {
    return response.data;
  }
  
  console.error('查询路线模板列表失败:', response.error);
  return null;
}

/**
 * 根据ID获取路线模板
 * GET /route-directions/templates/:id
 */
export async function getRouteTemplateById(id: number): Promise<RouteTemplate | null> {
  const response = await apiGet<RouteTemplate>(`/route-directions/templates/${id}`);
  
  if (response.success) {
    return response.data;
  }
  
  console.error('获取路线模板失败:', response.error);
  return null;
}

/**
 * 更新路线模板
 * PUT /route-directions/templates/:id
 */
export async function updateRouteTemplate(
  id: number,
  data: UpdateRouteTemplateDto
): Promise<RouteTemplate | null> {
  const response = await apiPut<RouteTemplate>(`/route-directions/templates/${id}`, data);
  
  if (response.success && response.data) {
    return response.data;
  }
  
  const errorCode = response.error?.code || 'UNKNOWN_ERROR';
  const errorMessage = response.error?.message || '更新路线模板失败';
  throw new Error(`[${errorCode}] ${errorMessage}`);
}

/**
 * 删除路线模板（软删除）
 * DELETE /route-directions/templates/:id
 * @param id 模板ID
 */
export async function deleteRouteTemplate(
  id: number
): Promise<{ message: string } | null> {
  const response = await apiDelete<{ message: string }>(`/route-directions/templates/${id}`);
  
  if (response.success) {
    return response.data;
  }
  
  console.error('删除路线模板失败:', response.error);
  return null;
}

/**
 * 物理删除路线模板（从数据库彻底删除）
 * DELETE /route-directions/templates/:id/hard
 * @param id 模板ID
 */
export async function hardDeleteRouteTemplate(
  id: number
): Promise<{ message: string } | null> {
  const response = await apiDelete<{ message: string }>(`/route-directions/templates/${id}/hard`);
  
  if (response.success) {
    return response.data;
  }
  
  console.error('物理删除路线模板失败:', response.error);
  return null;
}

/**
 * 获取路线模板可用的POI列表
 * GET /route-directions/templates/:id/available-pois
 * 根据路线模板关联的路线方向，自动获取该国家/地区的可用POI列表
 * @param id 模板ID
 * @param params 查询参数
 */
export async function getAvailablePOIsForTemplate(
  id: number,
  params?: {
    category?: string;
    search?: string;
    page?: number;
    limit?: number;
  }
): Promise<{
  places: any[];
  total: number;
  page: number;
  limit: number;
  routeDirection?: {
    id: number;
    countryCode: string;
    nameCN?: string;
    nameEN?: string;
  };
} | null> {
  const queryParams: Record<string, string | number> = {};
  if (params?.category) queryParams.category = params.category;
  if (params?.search) queryParams.search = params.search;
  if (params?.page !== undefined) queryParams.page = params.page;
  if (params?.limit !== undefined) queryParams.limit = params.limit;
  
  const response = await apiGet<{
    places: any[];
    total: number;
    page: number;
    limit: number;
    routeDirection?: {
      id: number;
      countryCode: string;
      nameCN?: string;
      nameEN?: string;
    };
  }>(`/route-directions/templates/${id}/available-pois`, queryParams);
  
  if (response.success) {
    return response.data;
  }
  
  console.error('获取可用POI列表失败:', response.error);
  return null;
}

/**
 * 使用模板创建行程
 * POST /route-directions/templates/:id/create-trip
 */
export async function createTripFromRouteTemplate(
  id: number,
  data: CreateTripFromRouteTemplateDto
): Promise<unknown | null> {
  const response = await apiPost<unknown>(
    `/route-directions/templates/${id}/create-trip`,
    data
  );
  
  if (response.success) {
    return response.data;
  }
  
  console.error('使用模板创建行程失败:', response.error);
  return null;
}

// ==================== 其他功能接口 ====================

/**
 * 批量导入国家 Pack
 * POST /route-directions/import-pack
 */
export async function importCountryPack(
  data: ImportCountryPackDto
): Promise<unknown | null> {
  const response = await apiPost<unknown>('/route-directions/import-pack', data);
  
  if (response.success) {
    return response.data;
  }
  
  console.error('批量导入国家 Pack 失败:', response.error);
  return null;
}

/**
 * 获取路线方向卡片列表
 * GET /route-directions/cards
 */
export async function getRouteDirectionCards(params: {
  countryCode: string;
  month?: number;
  preferences?: string[];
  pace?: 'relaxed' | 'moderate' | 'intense';
  riskTolerance?: 'low' | 'medium' | 'high';
}): Promise<RouteDirectionCard[] | null> {
  const queryParams: Record<string, string | number> = {
    countryCode: params.countryCode,
  };
  if (params.month !== undefined) queryParams.month = params.month;
  if (params.preferences && params.preferences.length > 0) {
    queryParams.preferences = params.preferences.join(',');
  }
  if (params.pace) queryParams.pace = params.pace;
  if (params.riskTolerance) queryParams.riskTolerance = params.riskTolerance;

  const response = await apiGet<RouteDirectionCard[]>('/route-directions/cards', queryParams);
  
  if (response.success) {
    return response.data;
  }
  
  console.error('获取路线方向卡片列表失败:', response.error);
  return null;
}

/**
 * 获取单个路线方向卡片
 * GET /route-directions/:id/card
 */
export async function getRouteDirectionCard(id: number): Promise<RouteDirectionCard | null> {
  const response = await apiGet<RouteDirectionCard>(`/route-directions/${id}/card`);
  
  if (response.success) {
    return response.data;
  }
  
  console.error('获取路线方向卡片失败:', response.error);
  return null;
}

/**
 * 获取路线方向交互列表
 * GET /route-directions/interactions
 */
export async function getRouteDirectionInteractions(params: {
  countryCode: string;
  month?: number;
  preferences?: string[];
  pace?: 'relaxed' | 'moderate' | 'intense';
  riskTolerance?: 'low' | 'medium' | 'high';
}): Promise<RouteDirectionInteraction[] | null> {
  const queryParams: Record<string, string | number> = {
    countryCode: params.countryCode,
  };
  if (params.month !== undefined) queryParams.month = params.month;
  if (params.preferences && params.preferences.length > 0) {
    queryParams.preferences = params.preferences.join(',');
  }
  if (params.pace) queryParams.pace = params.pace;
  if (params.riskTolerance) queryParams.riskTolerance = params.riskTolerance;

  const response = await apiGet<RouteDirectionInteraction[]>(
    '/route-directions/interactions',
    queryParams
  );
  
  if (response.success) {
    return response.data;
  }
  
  console.error('获取路线方向交互列表失败:', response.error);
  return null;
}

/**
 * 获取路线方向说明卡
 * GET /route-directions/:id/explainer
 */
export async function getRouteDirectionExplainer(
  id: number
): Promise<RouteDirectionExplainer | null> {
  const response = await apiGet<RouteDirectionExplainer>(`/route-directions/${id}/explainer`);
  
  if (response.success) {
    return response.data;
  }
  
  console.error('获取路线方向说明卡失败:', response.error);
  return null;
}

/**
 * 获取路线方向说明卡列表
 * GET /route-directions/explainers
 */
export async function getRouteDirectionExplainers(
  countryCode: string
): Promise<RouteDirectionExplainer[] | null> {
  const response = await apiGet<RouteDirectionExplainer[]>(
    '/route-directions/explainers',
    { countryCode }
  );
  
  if (response.success) {
    return response.data;
  }
  
  console.error('获取路线方向说明卡列表失败:', response.error);
  return null;
}

/**
 * 获取请求 trace 报告
 * GET /route-directions/observability/trace/:requestId
 */
export async function getTraceReport(requestId: string): Promise<TraceReport | null> {
  const response = await apiGet<TraceReport>(
    `/route-directions/observability/trace/${requestId}`
  );
  
  if (response.success) {
    return response.data;
  }
  
  console.error('获取 trace 报告失败:', response.error);
  return null;
}

/**
 * 获取聚合 metrics
 * GET /route-directions/observability/metrics
 */
export async function getRouteDirectionMetrics(): Promise<RouteDirectionMetrics | null> {
  const response = await apiGet<RouteDirectionMetrics>(
    '/route-directions/observability/metrics'
  );
  
  if (response.success) {
    return response.data;
  }
  
  console.error('获取 metrics 失败:', response.error);
  return null;
}
