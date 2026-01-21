'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Search, Trash2, MapPin, AlertTriangle, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getPlaces, deletePlace } from '@/services/places';
import type { PlaceListItem, PlaceCategory } from '@/types/api';

const categoryLabels: Record<PlaceCategory, string> = {
  ATTRACTION: '景点',
  RESTAURANT: '餐厅',
  SHOPPING: '购物',
  HOTEL: '酒店',
  TRANSIT_HUB: '交通枢纽',
};

interface DuplicateGroup {
  key: string; // 坐标key，如 "35.6586_139.7454"
  lat: number;
  lng: number;
  places: PlaceListItem[];
}

export default function DuplicatesPage() {
  const [loading, setLoading] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [duplicates, setDuplicates] = useState<DuplicateGroup[]>([]);
  const [totalPlaces, setTotalPlaces] = useState(0);
  const [scannedPlaces, setScannedPlaces] = useState(0);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [selectedForDelete, setSelectedForDelete] = useState<Set<number>>(new Set());
  const [batchDeleting, setBatchDeleting] = useState(false);
  const [distanceThreshold, setDistanceThreshold] = useState(0); // 距离阈值（米），0表示完全相同

  // 计算两点之间的距离（米）
  function calculateDistanceMeters(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371000; // 地球半径（米）
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  // 生成坐标key（用于精确匹配）
  function getCoordKey(lat: number, lng: number, precision: number = 6): string {
    return `${lat.toFixed(precision)}_${lng.toFixed(precision)}`;
  }

  // 扫描重复地点
  async function scanDuplicates() {
    setScanning(true);
    setDuplicates([]);
    setScannedPlaces(0);
    setSelectedForDelete(new Set());

    try {
      const allPlaces: PlaceListItem[] = [];
      let page = 1;
      const limit = 100;
      let hasMore = true;

      // 获取所有地点
      while (hasMore) {
        const result = await getPlaces({ page, limit });
        if (result && result.places.length > 0) {
          allPlaces.push(...result.places);
          setScannedPlaces(allPlaces.length);
          setTotalPlaces(result.total);
          
          if (allPlaces.length >= result.total || result.places.length < limit) {
            hasMore = false;
          } else {
            page++;
          }
        } else {
          hasMore = false;
        }
      }

      // 按坐标分组
      const coordMap = new Map<string, PlaceListItem[]>();
      
      for (const place of allPlaces) {
        if (place.location?.lat && place.location?.lng) {
          if (distanceThreshold === 0) {
            // 精确匹配
            const key = getCoordKey(place.location.lat, place.location.lng);
            if (!coordMap.has(key)) {
              coordMap.set(key, []);
            }
            coordMap.get(key)!.push(place);
          } else {
            // 基于距离阈值匹配
            let foundGroup = false;
            for (const [key, group] of coordMap.entries()) {
              const [lat, lng] = key.split('_').map(Number);
              const distance = calculateDistanceMeters(
                place.location.lat,
                place.location.lng,
                lat,
                lng
              );
              if (distance <= distanceThreshold) {
                group.push(place);
                foundGroup = true;
                break;
              }
            }
            if (!foundGroup) {
              const key = getCoordKey(place.location.lat, place.location.lng);
              coordMap.set(key, [place]);
            }
          }
        }
      }

      // 找出重复项（多于1个地点的组）
      const duplicateGroups: DuplicateGroup[] = [];
      for (const [key, places] of coordMap.entries()) {
        if (places.length > 1) {
          const [lat, lng] = key.split('_').map(Number);
          duplicateGroups.push({
            key,
            lat,
            lng,
            places: places.sort((a, b) => a.id - b.id), // 按ID排序，ID小的通常是先创建的
          });
        }
      }

      // 按重复数量降序排序
      duplicateGroups.sort((a, b) => b.places.length - a.places.length);
      setDuplicates(duplicateGroups);

    } catch (error) {
      console.error('扫描失败:', error);
      alert('扫描失败，请重试');
    } finally {
      setScanning(false);
    }
  }

  // 删除单个地点
  async function handleDelete(placeId: number) {
    if (!confirm(`确定要删除地点 ID ${placeId} 吗？此操作不可撤销。`)) {
      return;
    }

    setDeleting(placeId);
    try {
      const result = await deletePlace(placeId);
      if (result) {
        // 从列表中移除
        setDuplicates((prev) =>
          prev
            .map((group) => ({
              ...group,
              places: group.places.filter((p) => p.id !== placeId),
            }))
            .filter((group) => group.places.length > 1) // 移除只剩1个的组
        );
        setSelectedForDelete((prev) => {
          const newSet = new Set(prev);
          newSet.delete(placeId);
          return newSet;
        });
        alert('删除成功');
      } else {
        alert('删除失败');
      }
    } catch (error) {
      console.error('删除失败:', error);
      alert('删除失败，请重试');
    } finally {
      setDeleting(null);
    }
  }

  // 切换选择
  function toggleSelect(placeId: number) {
    setSelectedForDelete((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(placeId)) {
        newSet.delete(placeId);
      } else {
        newSet.add(placeId);
      }
      return newSet;
    });
  }

  // 选择组内除第一个以外的所有地点（保留最早创建的）
  function selectAllExceptFirst(group: DuplicateGroup) {
    setSelectedForDelete((prev) => {
      const newSet = new Set(prev);
      // 跳过第一个（ID最小的，通常是最早创建的）
      for (let i = 1; i < group.places.length; i++) {
        newSet.add(group.places[i].id);
      }
      return newSet;
    });
  }

  // 取消选择组内所有
  function deselectAll(group: DuplicateGroup) {
    setSelectedForDelete((prev) => {
      const newSet = new Set(prev);
      for (const place of group.places) {
        newSet.delete(place.id);
      }
      return newSet;
    });
  }

  // 批量删除选中的地点
  async function handleBatchDelete() {
    if (selectedForDelete.size === 0) {
      alert('请先选择要删除的地点');
      return;
    }

    if (!confirm(`确定要删除选中的 ${selectedForDelete.size} 个地点吗？此操作不可撤销。`)) {
      return;
    }

    setBatchDeleting(true);
    let successCount = 0;
    let failCount = 0;

    for (const placeId of selectedForDelete) {
      try {
        const result = await deletePlace(placeId);
        if (result) {
          successCount++;
          // 从列表中移除
          setDuplicates((prev) =>
            prev
              .map((group) => ({
                ...group,
                places: group.places.filter((p) => p.id !== placeId),
              }))
              .filter((group) => group.places.length > 1)
          );
        } else {
          failCount++;
        }
      } catch (error) {
        console.error(`删除地点 ${placeId} 失败:`, error);
        failCount++;
      }
    }

    setSelectedForDelete(new Set());
    setBatchDeleting(false);
    alert(`删除完成：成功 ${successCount} 个，失败 ${failCount} 个`);
  }

  // 计算总重复数
  const totalDuplicates = duplicates.reduce((sum, group) => sum + group.places.length - 1, 0);

  return (
    <div className="space-y-6">
      {/* 头部 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/places">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">检测重复地点</h1>
            <p className="text-muted-foreground mt-2">
              扫描并删除坐标相同的重复地点
            </p>
          </div>
        </div>
      </div>

      {/* 控制面板 */}
      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <label className="text-sm font-medium">距离阈值（米）</label>
            <div className="mt-1 flex items-center gap-2">
              <input
                type="number"
                value={distanceThreshold}
                onChange={(e) => setDistanceThreshold(Number(e.target.value))}
                className="w-24 px-3 py-2 border rounded-md"
                min="0"
                max="1000"
                disabled={scanning}
              />
              <span className="text-sm text-muted-foreground">
                {distanceThreshold === 0 ? '（完全相同）' : `（${distanceThreshold}米内视为重复）`}
              </span>
            </div>
          </div>
          <Button onClick={scanDuplicates} disabled={scanning}>
            {scanning ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                扫描中... ({scannedPlaces}/{totalPlaces || '?'})
              </>
            ) : (
              <>
                <Search className="mr-2 h-4 w-4" />
                开始扫描
              </>
            )}
          </Button>
          {selectedForDelete.size > 0 && (
            <Button
              variant="destructive"
              onClick={handleBatchDelete}
              disabled={batchDeleting}
            >
              {batchDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  删除中...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  批量删除 ({selectedForDelete.size})
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      {/* 统计信息 */}
      {duplicates.length > 0 && (
        <div className="rounded-lg border bg-card p-4 shadow-sm">
          <div className="flex items-center gap-2 text-amber-600">
            <AlertTriangle className="h-5 w-5" />
            <span className="font-medium">
              发现 {duplicates.length} 组重复地点，共 {totalDuplicates} 个可删除的重复项
            </span>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            提示：每组中ID最小的地点通常是最早创建的，建议保留。点击"选择重复项"可快速选中除第一个以外的所有地点。
          </p>
        </div>
      )}

      {/* 扫描结果为空 */}
      {!scanning && scannedPlaces > 0 && duplicates.length === 0 && (
        <div className="rounded-lg border bg-card p-8 shadow-sm text-center">
          <Check className="mx-auto h-12 w-12 text-green-500" />
          <h3 className="mt-4 text-lg font-semibold">未发现重复地点</h3>
          <p className="mt-2 text-muted-foreground">
            已扫描 {scannedPlaces} 个地点，没有发现坐标相同的重复项。
          </p>
        </div>
      )}

      {/* 重复地点列表 */}
      {duplicates.length > 0 && (
        <div className="space-y-6">
          {duplicates.map((group) => (
            <div key={group.key} className="rounded-lg border bg-card shadow-sm overflow-hidden">
              {/* 组头部 */}
              <div className="bg-muted/50 px-4 py-3 border-b">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-red-500" />
                    <div>
                      <span className="font-medium">
                        坐标: {group.lat.toFixed(6)}, {group.lng.toFixed(6)}
                      </span>
                      <Badge variant="destructive" className="ml-2">
                        {group.places.length} 个重复
                      </Badge>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => selectAllExceptFirst(group)}
                    >
                      选择重复项
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deselectAll(group)}
                    >
                      取消选择
                    </Button>
                  </div>
                </div>
              </div>

              {/* 地点列表 */}
              <div className="divide-y">
                {group.places.map((place, index) => (
                  <div
                    key={place.id}
                    className={`px-4 py-3 flex items-center gap-4 ${
                      selectedForDelete.has(place.id) ? 'bg-red-50' : ''
                    } ${index === 0 ? 'bg-green-50' : ''}`}
                  >
                    {/* 选择框 */}
                    <input
                      type="checkbox"
                      checked={selectedForDelete.has(place.id)}
                      onChange={() => toggleSelect(place.id)}
                      className="h-4 w-4 rounded border-gray-300"
                    />

                    {/* 序号 */}
                    <div className="w-8 text-center">
                      {index === 0 ? (
                        <Badge variant="outline" className="bg-green-100 text-green-800">
                          原始
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">#{index + 1}</span>
                      )}
                    </div>

                    {/* 地点信息 */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">ID: {place.id}</span>
                        <Badge variant="secondary">
                          {categoryLabels[place.category] || place.category}
                        </Badge>
                      </div>
                      <div className="text-sm truncate">
                        {place.nameCN || place.nameEN || '未命名'}
                        {place.nameEN && place.nameCN && (
                          <span className="text-muted-foreground ml-2">
                            ({place.nameEN})
                          </span>
                        )}
                      </div>
                      {place.address && (
                        <div className="text-xs text-muted-foreground truncate">
                          {place.address}
                        </div>
                      )}
                      <div className="text-xs text-muted-foreground">
                        创建时间: {new Date(place.createdAt).toLocaleString('zh-CN')}
                      </div>
                    </div>

                    {/* 操作按钮 */}
                    <div className="flex gap-2">
                      <Link href={`/admin/places/${place.id}`}>
                        <Button variant="outline" size="sm">
                          查看
                        </Button>
                      </Link>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(place.id)}
                        disabled={deleting === place.id}
                      >
                        {deleting === place.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
