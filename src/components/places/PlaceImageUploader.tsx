'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { Upload, X, Image as ImageIcon, Loader2, Star, Trash2, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  uploadPlaceImages, 
  getPlaceImages, 
  batchGetPlaceImages,
  savePlaceImage,
  deletePlaceImage,
  type PlaceImage,
  type BatchPlaceImageRequest,
} from '@/services/upload';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface PlaceImageUploaderProps {
  placeId: number;
  placeName: string;
  placeNameEn?: string;
  country?: string;
  category?: string;
  onImagesChange?: (images: PlaceImage[]) => void;
}

export default function PlaceImageUploader({ 
  placeId, 
  placeName,
  placeNameEn,
  country,
  category,
  onImagesChange 
}: PlaceImageUploaderProps) {
  const [images, setImages] = useState<PlaceImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [fetchingUnsplash, setFetchingUnsplash] = useState(false);
  const [deletingIndex, setDeletingIndex] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [captions, setCaptions] = useState<string[]>([]);
  const [unsplashDialogOpen, setUnsplashDialogOpen] = useState(false);

  // 加载图片列表
  const loadImages = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('开始加载图片，placeId:', placeId);
      const result = await getPlaceImages(placeId);
      console.log('获取图片结果:', result);
      if (result.success && result.data) {
        console.log('图片数据:', result.data.images);
        setImages(result.data.images);
        onImagesChange?.(result.data.images);
      } else {
        const errorMsg = result.error?.message || '加载图片失败';
        console.error('加载图片失败:', errorMsg, result.error);
        setError(errorMsg);
      }
    } catch (err) {
      console.error('加载图片异常:', err);
      setError(err instanceof Error ? err.message : '加载图片失败');
    } finally {
      setLoading(false);
      setInitialized(true);
    }
  }, [placeId, onImagesChange]);

  // 初始化时加载图片
  useEffect(() => {
    if (placeId) {
      loadImages();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [placeId]);

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

  // 批量获取 Unsplash 图片
  const handleFetchUnsplash = async () => {
    setFetchingUnsplash(true);
    setError(null);
    try {
      // 将 Prisma 格式的 category 转换为图片搜索格式
      const categoryMap: Record<string, string> = {
        'ATTRACTION': 'landmark',
        'RESTAURANT': 'restaurant',
        'SHOPPING': 'shopping',
        'HOTEL': 'hotel',
        'TRANSIT_HUB': 'landmark',
      };
      
      const searchCategory = category ? (categoryMap[category] || category.toLowerCase()) : undefined;

      // 优先使用英文名称进行搜索
      const request: BatchPlaceImageRequest = {
        placeId: String(placeId),
        placeName: placeNameEn || placeName, // 如果有英文名称，优先使用英文名称
        placeNameEn: placeNameEn, // 明确传递英文名称，后端会优先使用
        country,
        category: searchCategory,
      };

      console.log('搜索 Unsplash 图片，使用名称:', placeNameEn || placeName, '英文名称:', placeNameEn);
      const result = await batchGetPlaceImages([request]);

      console.log('批量获取图片完整结果:', JSON.stringify(result, null, 2));

      if (result.success && result.data) {
        const imageResult = result.data.results[0];
        console.log('图片结果详情:', imageResult);
        
        if (imageResult.photo) {
          console.log('✅ 找到图片，photo 数据:', imageResult.photo);
          const imageUrl = imageResult.photo.urls?.regular || imageResult.photo.urls?.full || imageResult.photo.urls?.small;
          console.log('图片 URL:', imageUrl);
          console.log('图片 ID:', imageResult.photo.id);
          
          // 先立即显示获取到的图片（临时显示）
          const tempImage: PlaceImage & { attribution?: any } = {
            url: imageUrl || '',
            source: 'unsplash',
            isPrimary: images.length === 0, // 如果没有图片，设为主图
            caption: imageResult.photo.description || imageResult.photo.altDescription || undefined,
            attribution: imageResult.photo.attribution,
          };
          
          // 将新图片添加到现有图片列表的前面
          setImages(prevImages => {
            const newImages = [tempImage, ...prevImages];
            console.log('✅ 临时显示图片，当前图片列表数量:', newImages.length);
            onImagesChange?.(newImages);
            return newImages;
          });
          
          setUnsplashDialogOpen(false);
          
          // 保存图片到数据库
          console.log('💾 开始保存图片到数据库...');
          const saveResult = await savePlaceImage(
            placeId,
            imageResult.photo,
            images.length === 0 // 如果没有图片，设为主图
          );
          
          if (saveResult.success && saveResult.data) {
            console.log('✅ 图片已成功保存到数据库！', saveResult.data);
            // 刷新图片列表，获取保存后的数据
            await loadImages();
          } else {
            console.error('❌ 保存图片失败:', saveResult.error);
            setError(saveResult.error?.message || '保存图片失败，但图片已临时显示');
          }
        } else {
          const errorMsg = imageResult.error || '未找到合适的图片';
          console.warn('未找到图片:', errorMsg);
          setError(errorMsg);
        }
      } else {
        const errorMsg = result.error?.message || '获取图片失败';
        console.error('获取图片失败:', errorMsg, result.error);
        setError(errorMsg);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取图片失败');
    } finally {
      setFetchingUnsplash(false);
    }
  };

  // 删除图片
  const handleDeleteImage = async (index: number) => {
    if (!confirm('确定要删除这张图片吗？')) {
      return;
    }

    setDeletingIndex(index);
    setError(null);
    try {
      const result = await deletePlaceImage(placeId, { index });

      if (result.success && result.data) {
        // 刷新图片列表
        await loadImages();
      } else {
        setError(result.error?.message || '删除失败');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '删除失败');
    } finally {
      setDeletingIndex(null);
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

  // 获取图片的 Unsplash 归属信息
  const getUnsplashAttribution = (image: PlaceImage) => {
    // 如果图片有 metadata，尝试从中获取归属信息
    if ((image as any).attribution) {
      return (image as any).attribution;
    }
    return null;
  };

  return (
    <div className="rounded-lg border bg-card p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <ImageIcon className="h-5 w-5" />
          图片管理
        </h2>
        <div className="flex gap-2">
          <Dialog open={unsplashDialogOpen} onOpenChange={setUnsplashDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" disabled={fetchingUnsplash}>
                <Search className="h-4 w-4 mr-2" />
                从 Unsplash 获取
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>从 Unsplash 获取图片</DialogTitle>
                <DialogDescription>
                  系统将根据地点名称自动搜索并添加合适的图片
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  <p>地点名称: {placeName}</p>
                  {placeNameEn && <p>英文名称: {placeNameEn}</p>}
                  {country && <p>国家: {country}</p>}
                  {category && <p>类别: {category}</p>}
                </div>
                <Button 
                  onClick={handleFetchUnsplash} 
                  disabled={fetchingUnsplash}
                  className="w-full"
                >
                  {fetchingUnsplash ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      搜索中...
                    </>
                  ) : (
                    <>
                      <Search className="h-4 w-4 mr-2" />
                      开始搜索
                    </>
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
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
          {images.map((image, index) => {
            const attribution = getUnsplashAttribution(image);
            return (
              <div key={index} className="group relative rounded-lg overflow-hidden bg-muted aspect-square">
                <img
                  src={image.url}
                  alt={image.caption || `${placeName} 图片 ${index + 1}`}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                {/* 主图标识 */}
                {image.isPrimary && (
                  <div className="absolute top-2 left-2 z-10">
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-500 text-white text-xs rounded-full">
                      <Star className="h-3 w-3 fill-current" />
                      主图
                    </span>
                  </div>
                )}
                {/* 来源标识和删除按钮容器 */}
                <div className="absolute top-2 right-2 z-10 flex flex-col gap-2 items-end">
                  {/* 来源标识 */}
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    image.source === 'upload' 
                      ? 'bg-blue-500 text-white' 
                      : image.source === 'unsplash'
                      ? 'bg-purple-500 text-white'
                      : 'bg-gray-500 text-white'
                  }`}>
                    {image.source === 'upload' ? '上传' : image.source === 'unsplash' ? 'Unsplash' : '外部'}
                  </span>
                  {/* 删除按钮 */}
                  <Button
                    variant="destructive"
                    size="icon"
                    className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => handleDeleteImage(index)}
                    disabled={deletingIndex === index}
                  >
                    {deletingIndex === index ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                {/* 图片说明和归属信息 */}
                {(image.caption || attribution) && (
                  <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
                    {image.caption && (
                      <p className="text-white text-xs truncate mb-1">{image.caption}</p>
                    )}
                    {attribution && (
                      <p className="text-white text-xs">
                        Photo by{' '}
                        <a 
                          href={attribution.photographerUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="underline hover:no-underline"
                        >
                          {attribution.photographerName}
                        </a>
                        {' '}on{' '}
                        <a 
                          href={attribution.unsplashUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="underline hover:no-underline"
                        >
                          Unsplash
                        </a>
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          <ImageIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
          <p>暂无图片</p>
          <p className="text-sm mt-1">点击上方按钮上传图片或从 Unsplash 获取</p>
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
