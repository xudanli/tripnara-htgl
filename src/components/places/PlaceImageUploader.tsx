'use client';

import { useState, useRef, useCallback } from 'react';
import { Upload, X, Image as ImageIcon, Loader2, Star, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { uploadPlaceImages, getPlaceImages, type PlaceImage } from '@/services/upload';

interface PlaceImageUploaderProps {
  placeId: number;
  placeName: string;
  onImagesChange?: (images: PlaceImage[]) => void;
}

export default function PlaceImageUploader({ placeId, placeName, onImagesChange }: PlaceImageUploaderProps) {
  const [images, setImages] = useState<PlaceImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [captions, setCaptions] = useState<string[]>([]);

  // 加载图片列表
  const loadImages = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getPlaceImages(placeId);
      if (result.success && result.data) {
        setImages(result.data.images);
        onImagesChange?.(result.data.images);
      } else {
        setError(result.error?.message || '加载图片失败');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载图片失败');
    } finally {
      setLoading(false);
      setInitialized(true);
    }
  }, [placeId, onImagesChange]);

  // 初始化时加载图片
  if (!initialized && !loading) {
    loadImages();
  }

  // 选择文件
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // 验证文件类型
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    const invalidFiles = files.filter(f => !validTypes.includes(f.type));
    if (invalidFiles.length > 0) {
      setError('只支持 JPG、PNG、GIF、WebP 格式的图片');
      return;
    }

    // 验证文件大小
    const oversizedFiles = files.filter(f => f.size > 10 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      setError('每张图片大小不能超过 10MB');
      return;
    }

    setSelectedFiles(files);
    setCaptions(files.map(() => ''));
    setError(null);
  };

  // 更新图片说明
  const updateCaption = (index: number, value: string) => {
    const newCaptions = [...captions];
    newCaptions[index] = value;
    setCaptions(newCaptions);
  };

  // 移除待上传的文件
  const removeFile = (index: number) => {
    const newFiles = [...selectedFiles];
    const newCaptions = [...captions];
    newFiles.splice(index, 1);
    newCaptions.splice(index, 1);
    setSelectedFiles(newFiles);
    setCaptions(newCaptions);
  };

  // 上传图片
  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;

    setUploading(true);
    setError(null);
    try {
      const filteredCaptions = captions.filter((c, i) => i < selectedFiles.length && c.trim());
      const result = await uploadPlaceImages(
        placeId,
        selectedFiles,
        filteredCaptions.length > 0 ? captions : undefined
      );

      if (result.success && result.data) {
        // 刷新图片列表
        await loadImages();
        // 清空选择
        setSelectedFiles([]);
        setCaptions([]);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } else {
        setError(result.error?.message || '上传失败');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '上传失败');
    } finally {
      setUploading(false);
    }
  };

  // 取消选择
  const handleCancel = () => {
    setSelectedFiles([]);
    setCaptions([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="rounded-lg border bg-card p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <ImageIcon className="h-5 w-5" />
          图片管理
        </h2>
        <Button
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
        >
          <Upload className="h-4 w-4 mr-2" />
          选择图片
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {error && (
        <div className="mb-4 p-3 bg-destructive/10 text-destructive text-sm rounded-md">
          {error}
        </div>
      )}

      {/* 待上传文件预览 */}
      {selectedFiles.length > 0 && (
        <div className="mb-4 p-4 border rounded-lg bg-muted/50">
          <h3 className="text-sm font-medium mb-3">待上传的图片 ({selectedFiles.length})</h3>
          <div className="space-y-3">
            {selectedFiles.map((file, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="w-16 h-16 rounded overflow-hidden bg-muted flex-shrink-0">
                  <img
                    src={URL.createObjectURL(file)}
                    alt={file.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{file.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </div>
                  <Input
                    placeholder="图片说明（可选）"
                    value={captions[index] || ''}
                    onChange={(e) => updateCaption(index, e.target.value)}
                    className="mt-1 h-8 text-sm"
                  />
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeFile(index)}
                  className="flex-shrink-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
          <div className="flex gap-2 mt-4">
            <Button onClick={handleUpload} disabled={uploading} size="sm">
              {uploading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  上传中...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  上传 ({selectedFiles.length})
                </>
              )}
            </Button>
            <Button variant="outline" onClick={handleCancel} disabled={uploading} size="sm">
              取消
            </Button>
          </div>
        </div>
      )}

      {/* 已有图片列表 */}
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : images.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {images.map((image, index) => (
            <div key={index} className="group relative rounded-lg overflow-hidden bg-muted aspect-square">
              <img
                src={image.url}
                alt={image.caption || `${placeName} 图片 ${index + 1}`}
                className="w-full h-full object-cover"
                loading="lazy"
              />
              {/* 主图标识 */}
              {image.isPrimary && (
                <div className="absolute top-2 left-2">
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-500 text-white text-xs rounded-full">
                    <Star className="h-3 w-3 fill-current" />
                    主图
                  </span>
                </div>
              )}
              {/* 来源标识 */}
              <div className="absolute top-2 right-2">
                <span className={`px-2 py-1 text-xs rounded-full ${
                  image.source === 'upload' 
                    ? 'bg-blue-500 text-white' 
                    : image.source === 'unsplash'
                    ? 'bg-purple-500 text-white'
                    : 'bg-gray-500 text-white'
                }`}>
                  {image.source === 'upload' ? '上传' : image.source === 'unsplash' ? 'Unsplash' : '外部'}
                </span>
              </div>
              {/* 图片说明 */}
              {image.caption && (
                <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/60 to-transparent">
                  <p className="text-white text-xs truncate">{image.caption}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          <ImageIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
          <p>暂无图片</p>
          <p className="text-sm mt-1">点击上方按钮上传图片</p>
        </div>
      )}

      {images.length > 0 && (
        <div className="mt-4 text-sm text-muted-foreground">
          共 {images.length} 张图片
        </div>
      )}
    </div>
  );
}
