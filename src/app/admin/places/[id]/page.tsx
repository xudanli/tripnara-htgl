'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Save, MapPin, ChevronUp, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { getPlaceById, updatePlace, getPlaces } from '@/services/places';
import type { Place, UpdatePlaceRequest, PlaceCategory, PlaceListItem } from '@/types/api';
import DeepSeekAssistant from '@/components/places/DeepSeekAssistant';

const categoryLabels: Record<PlaceCategory, string> = {
  ATTRACTION: '景点',
  RESTAURANT: '餐厅',
  SHOPPING: '购物',
  HOTEL: '酒店',
  TRANSIT_HUB: '交通枢纽',
};

export default function PlaceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const placeId = Number(params.id);

  const [place, setPlace] = useState<Place | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [prevPlaceId, setPrevPlaceId] = useState<number | null>(null);
  const [nextPlaceId, setNextPlaceId] = useState<number | null>(null);
  const [loadingNeighbors, setLoadingNeighbors] = useState(false);
  const [formData, setFormData] = useState<UpdatePlaceRequest>({
    nameCN: '',
    nameEN: '',
    category: 'ATTRACTION',
    address: '',
    description: '',
    lat: undefined,
    lng: undefined,
    cityId: undefined,
    googlePlaceId: '',
    rating: undefined,
    metadata: {},
    physicalMetadata: {},
  });

  useEffect(() => {
    if (placeId && !isNaN(placeId)) {
      loadPlace();
      // 同时加载相邻地点，不依赖place，因为loadNeighborPlaces内部会处理
      loadNeighborPlaces();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [placeId, params.id]);

  // 键盘快捷键支持
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Ctrl/Cmd + 上箭头：上一条
      if ((e.ctrlKey || e.metaKey) && e.key === 'ArrowUp') {
        e.preventDefault();
        if (prevPlaceId) {
          handleNavigateToPlace(prevPlaceId);
        }
      }
      // Ctrl/Cmd + 下箭头：下一条
      if ((e.ctrlKey || e.metaKey) && e.key === 'ArrowDown') {
        e.preventDefault();
        if (nextPlaceId) {
          handleNavigateToPlace(nextPlaceId);
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [prevPlaceId, nextPlaceId]);

  async function loadPlace() {
    setLoading(true);
    try {
      const placeData = await getPlaceById(placeId);
      if (placeData) {
        setPlace(placeData);
        setFormData({
          nameCN: placeData.nameCN || '',
          nameEN: placeData.nameEN || '',
          category: placeData.category,
          address: placeData.address || '',
          description: placeData.description || '',
          lat: placeData.location?.lat,
          lng: placeData.location?.lng,
          cityId: placeData.city?.id,
          googlePlaceId: placeData.googlePlaceId || '',
          rating: placeData.rating,
          metadata: placeData.metadata || {},
          physicalMetadata: placeData.physicalMetadata || {},
        });
      }
    } catch (error) {
      console.error('加载地点详情失败:', error);
    } finally {
      setLoading(false);
    }
  }

  async function loadNeighborPlaces() {
    setLoadingNeighbors(true);
    try {
      console.log('开始加载相邻地点，当前地点ID:', placeId);
      
      // 使用新接口，按ID降序排序（默认），这样可以更高效地找到相邻地点
      const limit = 100;
      const firstPage = await getPlaces({
        limit,
        page: 1,
        orderBy: 'id',
        orderDirection: 'desc', // 默认降序
      });

      if (!firstPage) {
        console.warn('获取地点列表失败: result is null');
        setPrevPlaceId(null);
        setNextPlaceId(null);
        return;
      }

      console.log(`地点总数: ${firstPage.total}, 总页数: ${firstPage.totalPages}`);

      // 在第一页查找当前地点
      const firstPageIndex = firstPage.places.findIndex((p: PlaceListItem) => p.id === placeId);
      if (firstPageIndex !== -1) {
        // 在第一页找到了
        const prevId = firstPageIndex > 0 ? firstPage.places[firstPageIndex - 1].id : null;
        const nextId = firstPageIndex < firstPage.places.length - 1 ? firstPage.places[firstPageIndex + 1].id : null;
        console.log(`在第一页找到当前地点，位置: ${firstPageIndex + 1}/${firstPage.places.length}`);
        console.log(`设置相邻地点 - 上一条: ${prevId}, 下一条: ${nextId}`);
        setPrevPlaceId(prevId);
        setNextPlaceId(nextId);
        return;
      }

      // 如果第一页没找到，需要查找更多页面
      // 计算当前地点可能在哪一页（基于ID排序）
      let allPlaces: PlaceListItem[] = [...firstPage.places];
      let currentPage = 1;
      let found = false;

      // 继续获取剩余页面，直到找到当前地点
      while (currentPage < firstPage.totalPages && !found) {
        currentPage++;
        console.log(`正在获取第 ${currentPage} 页地点数据...`);
        
        const result = await getPlaces({
          limit,
          page: currentPage,
          orderBy: 'id',
          orderDirection: 'desc',
        });

        if (!result || result.places.length === 0) {
          break;
        }

        allPlaces = [...allPlaces, ...result.places];

        // 检查当前地点是否在这一页
        const currentIndex = result.places.findIndex((p: PlaceListItem) => p.id === placeId);
        if (currentIndex !== -1) {
          found = true;
          // 计算在整个列表中的位置
          const globalIndex = (currentPage - 1) * limit + currentIndex;
          console.log(`在第 ${currentPage} 页找到当前地点，在列表中的位置: ${globalIndex + 1}/${allPlaces.length}`);

          const prevId = globalIndex > 0 ? allPlaces[globalIndex - 1].id : null;
          const nextId = globalIndex < allPlaces.length - 1 ? allPlaces[globalIndex + 1].id : null;
          
          console.log(`设置相邻地点 - 上一条: ${prevId}, 下一条: ${nextId}`);
          setPrevPlaceId(prevId);
          setNextPlaceId(nextId);
          return;
        }

        // 如果这一页已经填满，继续下一页
        if (result.places.length < limit) {
          break;
        }
      }

      // 如果遍历了所有页面还没找到，在整个列表中查找
      if (!found && allPlaces.length > 0) {
        console.log('在所有已获取的地点中查找当前地点...');
        const globalIndex = allPlaces.findIndex((p: PlaceListItem) => p.id === placeId);
        if (globalIndex !== -1) {
          console.log(`在整个列表中找到当前地点，位置: ${globalIndex + 1}/${allPlaces.length}`);
          const prevId = globalIndex > 0 ? allPlaces[globalIndex - 1].id : null;
          const nextId = globalIndex < allPlaces.length - 1 ? allPlaces[globalIndex + 1].id : null;
          console.log(`设置相邻地点 - 上一条: ${prevId}, 下一条: ${nextId}`);
          setPrevPlaceId(prevId);
          setNextPlaceId(nextId);
        } else {
          console.warn(`未找到当前地点 ID ${placeId}，已获取 ${allPlaces.length} 个地点`);
          console.warn('前10个地点ID:', allPlaces.slice(0, 10).map(p => p.id));
          setPrevPlaceId(null);
          setNextPlaceId(null);
        }
      } else if (!found) {
        console.warn('未找到当前地点，且没有获取到任何地点数据');
        setPrevPlaceId(null);
        setNextPlaceId(null);
      }
    } catch (error) {
      console.error('加载相邻地点失败:', error);
      setPrevPlaceId(null);
      setNextPlaceId(null);
    } finally {
      setLoadingNeighbors(false);
      console.log('相邻地点加载完成');
    }
  }

  function handleNavigateToPlace(placeId: number) {
    if (!placeId) {
      console.warn('placeId is null or undefined');
      return;
    }
    if (placeId === place?.id) {
      console.warn('已经是当前地点，无需切换');
      return;
    }
    console.log('导航到地点:', placeId, '当前地点:', place?.id);
    // 使用 router.push 进行导航，Next.js 会自动处理路由变化
    router.push(`/admin/places/${placeId}`);
  }

  async function handleSave() {
    setSaving(true);
    try {
      const updated = await updatePlace(placeId, formData);
      if (updated) {
        setPlace(updated);
        alert('保存成功');
      }
    } catch (error) {
      console.error('保存失败:', error);
      alert('保存失败，请重试');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">加载中...</div>
      </div>
    );
  }

  if (!place) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">地点不存在</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/places">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">地点详情</h1>
            <p className="text-muted-foreground mt-2">编辑地点信息</p>
          </div>
        </div>
        {/* 上一条、下一条导航按钮 */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              console.log('点击上一条按钮，prevPlaceId:', prevPlaceId);
              if (prevPlaceId) {
                handleNavigateToPlace(prevPlaceId);
              } else {
                console.warn('prevPlaceId is null，无法导航');
                alert('没有上一条地点');
              }
            }}
            disabled={loadingNeighbors}
            title={prevPlaceId ? `上一条 (ID: ${prevPlaceId})` : loadingNeighbors ? '加载中...' : '没有上一条'}
          >
            <ChevronUp className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              console.log('点击下一条按钮，nextPlaceId:', nextPlaceId);
              if (nextPlaceId) {
                handleNavigateToPlace(nextPlaceId);
              } else {
                console.warn('nextPlaceId is null，无法导航');
                alert('没有下一条地点');
              }
            }}
            disabled={loadingNeighbors}
            title={nextPlaceId ? `下一条 (ID: ${nextPlaceId})` : loadingNeighbors ? '加载中...' : '没有下一条'}
          >
            <ChevronDown className="h-4 w-4" />
          </Button>
          {/* 调试信息（开发环境） */}
          {process.env.NODE_ENV === 'development' && (
            <div className="text-xs text-muted-foreground ml-2">
              {loadingNeighbors ? '加载中...' : (
                <>
                  {prevPlaceId ? `上:${prevPlaceId}` : '无上'} | {nextPlaceId ? `下:${nextPlaceId}` : '无下'}
                </>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* 基本信息 */}
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">基本信息</h2>
          <div className="space-y-4">
            <div>
              <Label>地点ID</Label>
              <Input value={place.id} disabled className="mt-1 bg-muted" />
            </div>
            <div>
              <Label>UUID</Label>
              <Input value={place.uuid} disabled className="mt-1 bg-muted font-mono text-xs" />
            </div>
            <div>
              <Label>中文名称 *</Label>
              <Input
                value={formData.nameCN}
                onChange={(e) => setFormData((prev) => ({ ...prev, nameCN: e.target.value }))}
                className="mt-1"
                placeholder="地点中文名称"
              />
            </div>
            <div>
              <Label>英文名称</Label>
              <Input
                value={formData.nameEN || ''}
                onChange={(e) => setFormData((prev) => ({ ...prev, nameEN: e.target.value }))}
                className="mt-1"
                placeholder="地点英文名称"
              />
            </div>
            <div>
              <Label>类别</Label>
              <select
                value={formData.category}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, category: e.target.value as PlaceCategory }))
                }
                className="mt-1 w-full px-3 py-2 border rounded-md"
              >
                <option value="ATTRACTION">景点</option>
                <option value="RESTAURANT">餐厅</option>
                <option value="SHOPPING">购物</option>
                <option value="HOTEL">酒店</option>
                <option value="TRANSIT_HUB">交通枢纽</option>
              </select>
            </div>
            <div>
              <Label>地址</Label>
              <Textarea
                value={formData.address || ''}
                onChange={(e) => setFormData((prev) => ({ ...prev, address: e.target.value }))}
                className="mt-1"
                placeholder="地点地址"
                rows={2}
              />
            </div>
            <div>
              <Label>地点介绍</Label>
              <Textarea
                value={formData.description || ''}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                className="mt-1"
                placeholder="地点详细介绍、特色、历史背景、推荐理由等..."
                rows={4}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>纬度</Label>
                <Input
                  type="number"
                  step="any"
                  value={formData.lat || ''}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      lat: e.target.value ? Number(e.target.value) : undefined,
                    }))
                  }
                  className="mt-1"
                  placeholder="35.6586"
                />
              </div>
              <div>
                <Label>经度</Label>
                <Input
                  type="number"
                  step="any"
                  value={formData.lng || ''}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      lng: e.target.value ? Number(e.target.value) : undefined,
                    }))
                  }
                  className="mt-1"
                  placeholder="139.7454"
                />
              </div>
            </div>
            <div>
              <Label>评分 (0-5)</Label>
              <Input
                type="number"
                step="0.1"
                min="0"
                max="5"
                value={formData.rating || ''}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    rating: e.target.value ? Number(e.target.value) : undefined,
                  }))
                }
                className="mt-1"
                placeholder="4.5"
              />
            </div>
            <div>
              <Label>Google Place ID</Label>
              <Input
                value={formData.googlePlaceId || ''}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, googlePlaceId: e.target.value }))
                }
                className="mt-1"
                placeholder="ChIJ..."
              />
            </div>
            <div>
              <Label>城市ID</Label>
              <Input
                type="number"
                value={formData.cityId || ''}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    cityId: e.target.value ? Number(e.target.value) : undefined,
                  }))
                }
                className="mt-1"
                placeholder="1"
                title="城市ID通常由系统自动关联，不建议手动修改"
              />
            </div>
          </div>
        </div>

        {/* 其他信息 */}
        <div className="space-y-6">
          {/* 城市信息 */}
          {place.city && (
            <div className="rounded-lg border bg-card p-6 shadow-sm">
              <h2 className="text-lg font-semibold mb-4">城市信息</h2>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-muted-foreground">城市名称:</span>{' '}
                  <span className="font-medium">
                    {place.city.nameCN || place.city.name}
                  </span>
                </div>
                {place.city.nameEN && (
                  <div>
                    <span className="text-muted-foreground">英文名:</span>{' '}
                    <span className="font-medium">{place.city.nameEN}</span>
                  </div>
                )}
                <div>
                  <span className="text-muted-foreground">国家代码:</span>{' '}
                  <span className="font-medium">{place.city.countryCode}</span>
                </div>
                {place.city.timezone && (
                  <div>
                    <span className="text-muted-foreground">时区:</span>{' '}
                    <span className="font-medium">{place.city.timezone}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 营业状态 */}
          {place.status && (
            <div className="rounded-lg border bg-card p-6 shadow-sm">
              <h2 className="text-lg font-semibold mb-4">营业状态</h2>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant={place.status.isOpen ? 'default' : 'secondary'}>
                    {place.status.text}
                  </Badge>
                </div>
                {place.status.hoursToday && (
                  <div className="text-sm text-muted-foreground">
                    今日营业时间: {place.status.hoursToday}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 元数据 */}
          <div className="rounded-lg border bg-card p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-4">元数据 (JSON)</h2>
            <Textarea
              value={JSON.stringify(formData.metadata || {}, null, 2)}
              onChange={(e) => {
                try {
                  const metadata = JSON.parse(e.target.value);
                  setFormData((prev) => ({ ...prev, metadata }));
                } catch {
                  // 无效JSON，忽略
                }
              }}
              className="font-mono text-xs min-h-[150px]"
              placeholder="{}"
            />
          </div>

          {/* 物理元数据 */}
          <div className="rounded-lg border bg-card p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-4">物理元数据 (JSON)</h2>
            <Textarea
              value={JSON.stringify(formData.physicalMetadata || {}, null, 2)}
              onChange={(e) => {
                try {
                  const physicalMetadata = JSON.parse(e.target.value);
                  setFormData((prev) => ({ ...prev, physicalMetadata }));
                } catch {
                  // 无效JSON，忽略
                }
              }}
              className="font-mono text-xs min-h-[150px]"
              placeholder="{}"
            />
          </div>

          {/* 时间信息 */}
          <div className="rounded-lg border bg-card p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-4">时间信息</h2>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-muted-foreground">创建时间:</span>{' '}
                <span className="font-medium">
                  {new Date(place.createdAt).toLocaleString('zh-CN')}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">更新时间:</span>{' '}
                <span className="font-medium">
                  {new Date(place.updatedAt).toLocaleString('zh-CN')}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 操作按钮 */}
      <div className="flex gap-4">
        <Button onClick={handleSave} disabled={saving}>
          <Save className="mr-2 h-4 w-4" />
          {saving ? '保存中...' : '保存'}
        </Button>
        <Button variant="outline" onClick={() => router.back()}>
          取消
        </Button>
      </div>

      {/* DeepSeek 对话助手 */}
      {place && (
        <DeepSeekAssistant
          place={place}
          formData={formData}
          onUpdate={async (placeId, data) => {
            // 确保经纬度数据被正确传递
            const updateData: UpdatePlaceRequest = {
              ...data,
              // 如果data中有lat和lng，确保它们被包含
              lat: data.lat !== undefined ? data.lat : (data as any).location?.lat,
              lng: data.lng !== undefined ? data.lng : (data as any).location?.lng,
            };
            
            console.log('准备发送到服务器的数据:', updateData);
            
            const updated = await updatePlace(placeId, updateData);
            if (updated) {
              setPlace(updated);
              // 重要：优先使用发送的数据来更新表单，因为服务器可能不返回完整的更新后数据
              setFormData((prev) => ({
                nameCN: updateData.nameCN !== undefined ? updateData.nameCN : (updated.nameCN || ''),
                nameEN: updateData.nameEN !== undefined ? updateData.nameEN : (updated.nameEN || ''),
                category: updateData.category !== undefined ? updateData.category : updated.category,
                address: updateData.address !== undefined ? updateData.address : (updated.address || ''),
                description: updateData.description !== undefined ? updateData.description : (updated.description || ''),
                lat: updateData.lat !== undefined ? updateData.lat : updated.location?.lat,
                lng: updateData.lng !== undefined ? updateData.lng : updated.location?.lng,
                cityId: updateData.cityId !== undefined ? updateData.cityId : updated.city?.id,
                googlePlaceId: updateData.googlePlaceId !== undefined ? updateData.googlePlaceId : (updated.googlePlaceId || ''),
                rating: updateData.rating !== undefined ? updateData.rating : updated.rating,
                metadata: updateData.metadata !== undefined ? updateData.metadata : (updated.metadata || {}),
                physicalMetadata: updateData.physicalMetadata !== undefined ? updateData.physicalMetadata : (updated.physicalMetadata || {}),
              }));
              console.log('表单已更新，使用的数据:', updateData);
            } else {
              throw new Error('更新失败');
            }
          }}
        />
      )}
    </div>
  );
}
