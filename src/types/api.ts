/**
 * API 类型定义
 */

// ==================== 基础响应类型 ====================

export interface SuccessResponse<T> {
  success: true;
  data: T;
}

export interface ErrorResponse {
  success: false;
  error: {
    code: string; // NOT_FOUND, VALIDATION_ERROR, INTERNAL_ERROR 等
    message: string;
  };
}

export type ApiResponse<T> = SuccessResponse<T> | ErrorResponse;

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ==================== 用户管理 ====================

export interface User {
  id: string;
  googleSub?: string;
  email?: string;
  emailVerified?: boolean;
  displayName?: string;
  avatarUrl?: string;
  createdAt: string; // ISO datetime
  updatedAt: string; // ISO datetime
}

export interface GetUsersParams {
  page?: number;
  limit?: number;
  search?: string;
  emailVerified?: boolean;
}

export interface GetUsersResponse {
  users: User[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface UpdateUserRequest {
  displayName?: string;
  email?: string;
  emailVerified?: boolean;
  avatarUrl?: string;
}

// ==================== 联系消息管理 ====================

export interface ContactMessageImage {
  id: string;
  filePath: string;
  fileName: string;
  fileSize: string; // 字节数（字符串格式）
  mimeType: string;
  fileUrl?: string;
  createdAt: string;
}

export interface ContactMessage {
  id: string;
  userId?: string; // 可为空（匿名用户）
  message?: string;
  status: 'pending' | 'read' | 'replied' | 'resolved';
  createdAt: string;
  updatedAt: string;
  images: ContactMessageImage[];
}

export interface GetContactMessagesParams {
  page?: number;
  limit?: number;
  status?: 'pending' | 'read' | 'replied' | 'resolved';
  userId?: string;
  search?: string;
}

export interface GetContactMessagesResponse {
  messages: ContactMessage[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface UpdateMessageStatusRequest {
  status: 'pending' | 'read' | 'replied' | 'resolved';
}

export interface ReplyMessageRequest {
  reply: string;
}

export interface ReplyMessageResponse extends ContactMessage {
  reply: string;
  repliedAt: string;
}

// ==================== 准备度Pack管理 ====================

export interface ReadinessPackListItem {
  id: string;
  packId: string; // Pack标识符，如 'pack.is.iceland'
  destinationId: string; // 目的地ID，如 'IS-ICELAND'
  displayName: string | {
    en: string;
    zh?: string;
  };
  version: string; // 版本号，如 '1.0.0'
  lastReviewedAt: string;
  countryCode: string;
  region?: string;
  city?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface GetReadinessPacksParams {
  page?: number;
  limit?: number;
  countryCode?: string;
  destinationId?: string;
  isActive?: boolean;
  search?: string;
}

export interface GetReadinessPacksResponse {
  packs: ReadinessPackListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ReadinessPackGeo {
  countryCode: string;
  region?: string;
  city?: string;
  lat?: number;
  lng?: number;
}

export interface ReadinessPack {
  packId: string;
  destinationId: string;
  displayName: string | {
    en: string;
    zh?: string;
  };
  version: string;
  lastReviewedAt: string;
  geo: ReadinessPackGeo;
  supportedSeasons: string[]; // ['summer', 'winter', 'spring', 'autumn']
  rules: any[];
  checklists: any[];
  hazards?: any[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateReadinessPackRequest {
  pack: ReadinessPack;
}

export interface UpdateReadinessPackRequest {
  pack?: ReadinessPack;
  isActive?: boolean;
}

// ==================== 地点/POI管理 ====================

export type PlaceCategory = 'ATTRACTION' | 'RESTAURANT' | 'SHOPPING' | 'HOTEL' | 'TRANSIT_HUB';

export interface PlaceLocation {
  lat: number;
  lng: number;
}

export interface PlaceCity {
  id: number;
  name: string;
  nameCN?: string;
  nameEN?: string;
  countryCode: string;
  timezone?: string;
}

export interface PlaceStatus {
  isOpen: boolean;
  text: string;
  hoursToday?: string;
}

export interface PlaceListItem {
  id: number;
  uuid: string;
  nameCN: string;
  nameEN?: string;
  category: PlaceCategory;
  address?: string;
  description?: string; // 地点介绍
  rating?: number;
  googlePlaceId?: string;
  location?: PlaceLocation;
  metadata?: any;
  physicalMetadata?: any;
  city?: PlaceCity;
  countryCode?: string; // 从城市信息中提取，方便筛选和显示
  createdAt: string;
  updatedAt: string;
}

export interface Place extends PlaceListItem {
  status?: PlaceStatus;
}

export interface GetPlacesParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: PlaceCategory;
  cityId?: number;
  countryCode?: string; // 国家代码（ISO 3166-1 alpha-2）
}

export interface GetPlacesResponse {
  places: PlaceListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface UpdatePlaceRequest {
  nameCN?: string;
  nameEN?: string;
  category?: PlaceCategory;
  address?: string;
  description?: string; // 地点介绍
  lat?: number;
  lng?: number;
  cityId?: number;
  googlePlaceId?: string;
  rating?: number;
  metadata?: any;
  physicalMetadata?: any;
}
