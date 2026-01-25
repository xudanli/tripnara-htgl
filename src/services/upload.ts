/**
 * 图片上传服务
 * 对接后端 OSS 上传接口
 */

import type { ApiResponse } from '@/types/api';

// 上传结果类型
export interface UploadResult {
  url: string;
  key: string;
}

// 景点图片类型
export interface PlaceImage {
  url: string;
  key?: string;
  caption?: string;
  source: 'upload' | 'unsplash' | 'external';
  isPrimary: boolean;
  uploadedAt?: string;
}

// 景点图片上传响应
export interface PlaceImagesUploadResult {
  placeId: number;
  placeName: string;
  newImages: PlaceImage[];
  totalImages: number;
}

// 景点图片列表响应
export interface PlaceImagesListResult {
  placeId: number;
  placeName: string;
  images: PlaceImage[];
  count: number;
}

// Unsplash 图片类型
export interface UnsplashPhoto {
  id: string;
  width: number;
  height: number;
  color: string;
  blurHash: string;
  description: string | null;
  altDescription: string | null;
  urls: {
    raw: string;
    full: string;
    regular: string;
    small: string;
    thumb: string;
  };
  user: {
    name: string;
    username: string;
    link: string;
  };
  attribution: {
    photographerName: string;
    photographerUrl: string;
    unsplashUrl: string;
  };
}

// 批量获取图片请求参数
export interface BatchPlaceImageRequest {
  placeId?: string;
  placeName: string;
  placeNameEn?: string;
  country?: string;
  category?: string;
}

// 批量获取图片响应结果
export interface BatchPlaceImageResult {
  placeId?: string;
  placeName: string;
  photo: UnsplashPhoto | null;
  cached: boolean;
  error?: string;
}

// 批量获取图片响应
export interface BatchPlaceImagesResponse {
  success: true;
  results: BatchPlaceImageResult[];
  stats: {
    total: number;
    found: number;
    cached: number;
    failed: number;
  };
  processingTimeMs: number;
}

// 保存图片请求参数
export interface SavePlaceImageRequest {
  placeId: number;
  photo: UnsplashPhoto;
  isPrimary?: boolean;
}

// 保存图片响应
export interface SavePlaceImageResult {
  success: true;
  placeId: number;
  placeName: string;
  savedImage: {
    url: string;
    caption: string;
    source: 'unsplash';
    isPrimary: boolean;
    savedAt: string;
    attribution: {
      photographerName: string;
      photographerUrl: string;
      unsplashUrl: string;
    };
  };
  totalImages: number;
}

// 删除图片响应
export interface DeletePlaceImageResult {
  placeId: number;
  placeName: string;
  deletedImage: {
    url: string;
    key?: string;
    caption?: string;
  };
  remainingImages: number;
  totalImages: number;
}

/**
 * 上传单张图片
 * POST /api/upload/image
 */
export async function uploadImage(
  file: File,
  folder?: string
): Promise<ApiResponse<UploadResult>> {
  try {
    const formData = new FormData();
    formData.append('file', file);
    if (folder) {
      formData.append('folder', folder);
    }

    const response = await fetch('/api/upload/image', {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();
    
    if (!response.ok) {
      return {
        success: false,
        error: data.error || { code: 'UPLOAD_ERROR', message: '上传失败' },
      };
    }

    return {
      success: true,
      data: data.data,
    };
  } catch (error) {
    console.error('上传图片失败:', error);
    return {
      success: false,
      error: {
        code: 'NETWORK_ERROR',
        message: error instanceof Error ? error.message : '网络错误',
      },
    };
  }
}

/**
 * 批量上传图片（最多10张）
 * POST /api/upload/images
 */
export async function uploadImages(
  files: File[],
  folder?: string
): Promise<ApiResponse<UploadResult[]> & { count?: number }> {
  try {
    if (files.length === 0) {
      return {
        success: false,
        error: { code: 'VALIDATION_ERROR', message: '请选择要上传的图片' },
      };
    }

    if (files.length > 10) {
      return {
        success: false,
        error: { code: 'VALIDATION_ERROR', message: '最多只能同时上传10张图片' },
      };
    }

    const formData = new FormData();
    files.forEach(file => formData.append('files', file));
    if (folder) {
      formData.append('folder', folder);
    }

    const response = await fetch('/api/upload/images', {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();
    
    if (!response.ok) {
      return {
        success: false,
        error: data.error || { code: 'UPLOAD_ERROR', message: '批量上传失败' },
      };
    }

    return {
      success: true,
      data: data.data,
      count: data.count,
    };
  } catch (error) {
    console.error('批量上传图片失败:', error);
    return {
      success: false,
      error: {
        code: 'NETWORK_ERROR',
        message: error instanceof Error ? error.message : '网络错误',
      },
    };
  }
}

/**
 * 为景点上传图片
 * POST /api/upload/place/:placeId/images
 */
export async function uploadPlaceImages(
  placeId: number,
  files: File[],
  captions?: string[]
): Promise<ApiResponse<PlaceImagesUploadResult>> {
  try {
    if (files.length === 0) {
      return {
        success: false,
        error: { code: 'VALIDATION_ERROR', message: '请选择要上传的图片' },
      };
    }

    const formData = new FormData();
    files.forEach(file => formData.append('files', file));
    if (captions && captions.length > 0) {
      formData.append('captions', JSON.stringify(captions));
    }

    const response = await fetch(`/api/upload/place/${placeId}/images`, {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();
    
    if (!response.ok) {
      return {
        success: false,
        error: data.error || { code: 'UPLOAD_ERROR', message: '上传景点图片失败' },
      };
    }

    return {
      success: true,
      data: data.data,
    };
  } catch (error) {
    console.error('上传景点图片失败:', error);
    return {
      success: false,
      error: {
        code: 'NETWORK_ERROR',
        message: error instanceof Error ? error.message : '网络错误',
      },
    };
  }
}

/**
 * 获取景点图片列表
 * GET /api/upload/place/:placeId/images
 */
export async function getPlaceImages(
  placeId: number
): Promise<ApiResponse<PlaceImagesListResult>> {
  try {
    const response = await fetch(`/api/upload/place/${placeId}/images`);
    const data = await response.json();
    
    if (!response.ok) {
      return {
        success: false,
        error: data.error || { code: 'FETCH_ERROR', message: '获取图片列表失败' },
      };
    }

    return {
      success: true,
      data: data.data,
    };
  } catch (error) {
    console.error('获取景点图片列表失败:', error);
    return {
      success: false,
      error: {
        code: 'NETWORK_ERROR',
        message: error instanceof Error ? error.message : '网络错误',
      },
    };
  }
}

/**
 * 批量获取 Unsplash 图片
 * POST /api/places/images/batch
 */
export async function batchGetPlaceImages(
  places: BatchPlaceImageRequest[]
): Promise<ApiResponse<BatchPlaceImagesResponse>> {
  try {
    if (places.length === 0 || places.length > 20) {
      return {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'places 数组长度必须在 1-20 之间',
        },
      };
    }

    const response = await fetch('/api/places/images/batch', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ places }),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || {
          code: 'FETCH_ERROR',
          message: '批量获取图片失败',
        },
      };
    }

    return {
      success: true,
      data: data,
    };
  } catch (error) {
    console.error('批量获取 Unsplash 图片失败:', error);
    return {
      success: false,
      error: {
        code: 'NETWORK_ERROR',
        message: error instanceof Error ? error.message : '网络错误',
      },
    };
  }
}

/**
 * 保存 Unsplash 图片到数据库
 * POST /api/places/images/save
 */
export async function savePlaceImage(
  placeId: number,
  photo: UnsplashPhoto,
  isPrimary?: boolean
): Promise<ApiResponse<SavePlaceImageResult>> {
  try {
    const response = await fetch('/api/places/images/save', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        placeId,
        photo,
        isPrimary,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || {
          code: 'SAVE_ERROR',
          message: '保存图片失败',
        },
      };
    }

    return {
      success: true,
      data: data,
    };
  } catch (error) {
    console.error('保存 Unsplash 图片失败:', error);
    return {
      success: false,
      error: {
        code: 'NETWORK_ERROR',
        message: error instanceof Error ? error.message : '网络错误',
      },
    };
  }
}

/**
 * 删除景点图片
 * DELETE /api/upload/place/:placeId/images
 */
export async function deletePlaceImage(
  placeId: number,
  options: { key?: string; index?: number }
): Promise<ApiResponse<DeletePlaceImageResult>> {
  try {
    if (!options.key && options.index === undefined) {
      return {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: '必须提供 key 或 index 参数',
        },
      };
    }

    const searchParams = new URLSearchParams();
    if (options.key) {
      searchParams.append('key', options.key);
    }
    if (options.index !== undefined) {
      searchParams.append('index', String(options.index));
    }

    const url = `/api/upload/place/${placeId}/images?${searchParams.toString()}`;
    console.log('🗑️ 删除图片请求:', url);

    const response = await fetch(url, {
      method: 'DELETE',
    });

    console.log('🗑️ 删除图片响应状态:', response.status, response.statusText);

    // 检查响应是否有内容
    const contentType = response.headers.get('content-type');
    let data;
    
    if (contentType && contentType.includes('application/json')) {
      try {
        const text = await response.text();
        if (text) {
          data = JSON.parse(text);
        } else {
          // 空响应体
          if (response.ok) {
            return {
              success: false,
              error: {
                code: 'DELETE_ERROR',
                message: '删除成功，但服务器未返回数据',
              },
            };
          }
        }
      } catch (parseError) {
        console.error('❌ JSON 解析失败:', parseError);
        return {
          success: false,
          error: {
            code: 'PARSE_ERROR',
            message: '服务器响应格式错误',
          },
        };
      }
    } else {
      // 非 JSON 响应
      if (!response.ok) {
        return {
          success: false,
          error: {
            code: 'DELETE_ERROR',
            message: `删除失败: ${response.status} ${response.statusText}`,
          },
        };
      }
    }

    if (!response.ok) {
      return {
        success: false,
        error: data?.error || {
          code: 'DELETE_ERROR',
          message: data?.message || `删除图片失败: ${response.status}`,
        },
      };
    }

    return {
      success: true,
      data: data?.data || data,
    };
  } catch (error) {
    console.error('❌ 删除景点图片失败:', error);
    return {
      success: false,
      error: {
        code: 'NETWORK_ERROR',
        message: error instanceof Error ? error.message : '网络错误',
      },
    };
  }
}
