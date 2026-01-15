'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Save, MapPin } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { getPlaceById, updatePlace } from '@/services/places';
import type { Place, UpdatePlaceRequest, PlaceCategory } from '@/types/api';
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
    if (placeId) {
      loadPlace();
    }
  }, [placeId]);

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
            
            const updated = await updatePlace(placeId, updateData);
            if (updated) {
              setPlace(updated);
              setFormData({
                nameCN: updated.nameCN || '',
                nameEN: updated.nameEN || '',
                category: updated.category,
                address: updated.address || '',
                description: updated.description || '',
                lat: updated.location?.lat,
                lng: updated.location?.lng,
                cityId: updated.city?.id,
                googlePlaceId: updated.googlePlaceId || '',
                rating: updated.rating,
                metadata: updated.metadata || {},
                physicalMetadata: updated.physicalMetadata || {},
              });
              alert('更新成功！');
            } else {
              throw new Error('更新失败');
            }
          }}
        />
      )}
    </div>
  );
}
