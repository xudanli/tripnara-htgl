/**
 * 图片上传服务
 * 对接后端 OSS 上传接口
 */

import { ApiResponse } from '@/lib/api-client';

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
