'use client';

import { useState, useEffect } from 'react';
import type React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { createPlace, getPlaces } from '@/services/places';
import DeepSeekAssistant from '@/components/places/DeepSeekAssistant';
import type { CreatePlaceDto, PlaceCategory, UpdatePlaceRequest, PlaceListItem } from '@/types/api';

const categoryLabels: Record<PlaceCategory, string> = {
  ATTRACTION: '景点',
  RESTAURANT: '餐厅',
  SHOPPING: '购物',
  HOTEL: '酒店',
  TRANSIT_HUB: '交通枢纽',
};

export default function NewPlacePage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [samplePlaces, setSamplePlaces] = useState<PlaceListItem[]>([]); // 示例地点，用于AI识别城市
  const [formData, setFormData] = useState<CreatePlaceDto>({
    nameCN: '',
    nameEN: '',
    category: 'ATTRACTION',
    lat: 0,
    lng: 0,
    address: '',
    cityId: 0,
    rating: undefined,
    description: '',
    googlePlaceId: '',
    metadata: {},
  });

  // 加载示例地点（用于AI识别城市和根据坐标匹配城市ID）
  useEffect(() => {
    async function loadSamplePlaces() {
      // 查询足够多的地点，用于根据坐标匹配城市ID
      const result = await getPlaces({
        limit: 500, // 获取更多地点以提取城市列表
        page: 1,
      });
      if (result) {
        setSamplePlaces(result.places);
      }
    }
    loadSamplePlaces();
  }, []);

  // 根据经纬度自动获取城市ID
  useEffect(() => {
    // 只有当有经纬度但没有城市ID时才自动获取
    if (formData.lat && formData.lng && formData.lat !== 0 && formData.lng !== 0 && (!formData.cityId || formData.cityId === 0)) {
      // 防抖：延迟500ms执行，避免频繁请求
      const timer = setTimeout(async () => {
        try {
          // 使用反向地理编码获取地址
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${formData.lat}&lon=${formData.lng}&addressdetails=1&accept-language=zh-CN,en&zoom=18`,
            {
              headers: {
                'User-Agent': 'TripNara-Admin/1.0',
                'Referer': typeof window !== 'undefined' ? window.location.origin : '',
              },
            }
          );

          if (response.ok) {
            const data = await response.json();
            if (data && data.address) {
              const address = data.display_name || '';
              const cityName = data.address.city || data.address.town || data.address.village || data.address.municipality;
              const countryCode = data.address.country_code?.toUpperCase();

              // 根据地址匹配城市ID
              if (address && samplePlaces.length > 0) {
                // 匹配城市
                for (const place of samplePlaces) {
                  if (!place.city) continue;

                  const placeCityName = place.city.name?.toLowerCase() || '';
                  const placeCityNameCN = place.city.nameCN?.toLowerCase() || '';
                  const placeCityNameEN = place.city.nameEN?.toLowerCase() || '';
                  const placeCountryCode = place.city.countryCode?.toUpperCase() || place.countryCode?.toUpperCase() || '';
                  const addressLower = address.toLowerCase();
                  const cityNameLower = cityName?.toLowerCase() || '';

                  // 优先使用城市名称匹配
                  if (cityNameLower && (
                    placeCityName === cityNameLower ||
                    placeCityNameCN === cityNameLower ||
                    placeCityNameEN === cityNameLower
                  )) {
                    if (countryCode && placeCountryCode && placeCountryCode !== countryCode) {
                      continue;
                    }
                    setFormData((prev) => ({ ...prev, cityId: place.city!.id }));
                    return;
                  }

                  // 匹配地址中的城市名称
                  if (
                    (placeCityNameCN && addressLower.includes(placeCityNameCN)) ||
                    (placeCityNameEN && addressLower.includes(placeCityNameEN)) ||
                    (placeCityName && addressLower.includes(placeCityName))
                  ) {
                    if (countryCode && placeCountryCode && placeCountryCode !== countryCode) {
                      continue;
                    }
                    setFormData((prev) => ({ ...prev, cityId: place.city!.id }));
                    return;
                  }
                }

                // 如果地址匹配失败，尝试根据坐标匹配最近的地点
                let nearest: { place: PlaceListItem; distance: number } | null = null;
                let minDistance = Infinity;

                for (const place of samplePlaces) {
                  if (place.location?.lat && place.location?.lng) {
                    const distance = Math.sqrt(
                      Math.pow(place.location.lat - formData.lat, 2) +
                      Math.pow(place.location.lng - formData.lng, 2)
                    ) * 111; // 粗略转换为公里
                    if (distance < minDistance) {
                      minDistance = distance;
                      nearest = { place, distance };
                    }
                  }
                }

                if (nearest && nearest.place.city && nearest.distance < 50) {
                  // 50公里内认为可能是同一城市
                  setFormData((prev) => ({ ...prev, cityId: nearest!.place.city!.id }));
                }
              }
            }
          }
        } catch (error) {
          console.error('根据经纬度获取城市ID失败:', error);
        }
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [formData.lat, formData.lng, formData.cityId, samplePlaces]);

  async function handleSave(e?: React.MouseEvent) {
    // 防止默认行为
    if (e) {
      e.preventDefault();
    }

    console.log('handleSave 被调用，formData:', formData);
    
    // 验证必填字段
    if (!formData.nameCN || !formData.nameCN.trim()) {
      alert('请输入中文名称');
      return;
    }

    if (!formData.category) {
      alert('请选择地点类别');
      return;
    }

    if (formData.lat === undefined || formData.lat === null || formData.lat === 0) {
      alert('请输入有效的纬度（不能为0）');
      return;
    }

    if (formData.lng === undefined || formData.lng === null || formData.lng === 0) {
      alert('请输入有效的经度（不能为0）');
      return;
    }

    if (!formData.cityId || formData.cityId === 0) {
      alert('请输入有效的城市ID（不能为0）');
      return;
    }

    console.log('验证通过，开始创建...');
    setSaving(true);
    
    try {
      console.log('准备创建地点，数据:', JSON.stringify(formData, null, 2));
      const result = await createPlace(formData);
      console.log('创建结果:', result);
      
      if (result) {
        alert('创建成功！地点ID: ' + result.id);
        router.push(`/admin/places/${result.id}`);
      } else {
        alert('创建失败：服务器返回空结果\n\n可能原因：\n1. 后端服务未启动\n2. 后端服务返回错误\n3. 请查看浏览器控制台获取详细信息');
      }
    } catch (error) {
      console.error('创建失败:', error);
      const errorMessage = error instanceof Error ? error.message : '未知错误';
      alert(`创建失败：${errorMessage}\n\n请检查：\n1. 后端服务是否已启动（http://10.108.62.42:3000）\n2. 网络连接是否正常\n3. 查看浏览器控制台获取详细错误信息`);
    } finally {
      setSaving(false);
    }
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
            <h1 className="text-3xl font-bold">新增地点</h1>
            <p className="text-muted-foreground mt-2">创建新的地点/POI</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* 基本信息 */}
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">基本信息</h2>
          <div className="space-y-4">
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
                placeholder="English Name"
              />
            </div>
            <div>
              <Label>地点类别 *</Label>
              <select
                className="w-full mt-1 px-3 py-2 border rounded-md"
                value={formData.category}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, category: e.target.value as PlaceCategory }))
                }
              >
                {Object.entries(categoryLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label>城市ID *</Label>
              <Input
                type="number"
                value={formData.cityId || ''}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, cityId: Number(e.target.value) }))
                }
                className="mt-1"
                placeholder="城市ID"
              />
            </div>
            <div>
              <Label>地址</Label>
              <Input
                value={formData.address || ''}
                onChange={(e) => setFormData((prev) => ({ ...prev, address: e.target.value }))}
                className="mt-1"
                placeholder="详细地址"
              />
            </div>
          </div>
        </div>

        {/* 位置信息 */}
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">位置信息</h2>
          <div className="space-y-4">
            <div>
              <Label>纬度 (Lat) *</Label>
              <Input
                type="number"
                step="any"
                value={formData.lat || ''}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, lat: Number(e.target.value) }))
                }
                className="mt-1"
                placeholder="64.1466"
              />
            </div>
            <div>
              <Label>经度 (Lng) *</Label>
              <Input
                type="number"
                step="any"
                value={formData.lng || ''}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, lng: Number(e.target.value) }))
                }
                className="mt-1"
                placeholder="-21.9426"
              />
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
          </div>
        </div>
      </div>

      {/* 描述信息 */}
      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <h2 className="text-lg font-semibold mb-4">描述信息</h2>
        <div>
          <Label>地点介绍</Label>
          <Textarea
            value={formData.description || ''}
            onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
            className="mt-1"
            placeholder="地点详细介绍..."
            rows={5}
          />
        </div>
      </div>

      {/* 元数据（高级） */}
      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <h2 className="text-lg font-semibold mb-4">元数据（JSON格式）</h2>
        <div>
          <Label>元数据</Label>
          <Textarea
            value={JSON.stringify(formData.metadata || {}, null, 2)}
            onChange={(e) => {
              try {
                const parsed = JSON.parse(e.target.value);
                setFormData((prev) => ({ ...prev, metadata: parsed }));
              } catch {
                // 无效JSON，暂时不更新
              }
            }}
            className="mt-1 font-mono text-sm"
            placeholder='{"openingHours": "Mo-Fr 09:00-18:00", "tags": ["photography", "nature"]}'
            rows={6}
          />
          <p className="text-xs text-muted-foreground mt-1">
            请输入有效的JSON格式数据
          </p>
        </div>
      </div>

      {/* AI小助手 */}
      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <h2 className="text-lg font-semibold mb-4">AI小助手</h2>
        <p className="text-sm text-muted-foreground mb-4">
          使用AI小助手自动完善地点信息。可以输入地点名称、描述或其他信息，AI会自动提取并填充表单。
        </p>
        <DeepSeekAssistant
          places={samplePlaces} // 传递示例地点，帮助AI识别城市ID
          place={{
            id: 0, // 虚拟ID，用于创建模式
            uuid: '',
            nameCN: formData.nameCN || '',
            nameEN: formData.nameEN,
            category: formData.category,
            address: formData.address,
            description: formData.description,
            location: formData.lat && formData.lng ? { lat: formData.lat, lng: formData.lng } : undefined,
            rating: formData.rating,
            googlePlaceId: formData.googlePlaceId,
            metadata: formData.metadata || {},
            physicalMetadata: {},
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            city: formData.cityId ? { id: formData.cityId, name: '', countryCode: '' } : undefined,
          }}
          formData={{
            nameCN: formData.nameCN,
            nameEN: formData.nameEN,
            category: formData.category,
            address: formData.address,
            description: formData.description,
            lat: formData.lat,
            lng: formData.lng,
            cityId: formData.cityId,
            rating: formData.rating,
            googlePlaceId: formData.googlePlaceId,
            metadata: formData.metadata,
          }}
          onUpdate={async (placeId, data) => {
            // 在创建模式下，更新表单数据而不是调用API
            setFormData((prev) => {
              const updated: CreatePlaceDto = {
                ...prev,
                nameCN: data.nameCN !== undefined ? data.nameCN : prev.nameCN,
                nameEN: data.nameEN !== undefined ? data.nameEN : prev.nameEN,
                category: data.category !== undefined ? data.category : prev.category,
                address: data.address !== undefined ? data.address : prev.address,
                description: data.description !== undefined ? data.description : prev.description,
                lat: data.lat !== undefined ? data.lat : prev.lat,
                lng: data.lng !== undefined ? data.lng : prev.lng,
                cityId: data.cityId !== undefined ? data.cityId : prev.cityId,
                rating: data.rating !== undefined ? data.rating : prev.rating,
                googlePlaceId: data.googlePlaceId !== undefined ? data.googlePlaceId : prev.googlePlaceId,
                metadata: data.metadata !== undefined ? data.metadata : prev.metadata,
              };
              return updated;
            });
          }}
        />
      </div>

      {/* 操作按钮 */}
      <div className="flex gap-4">
        <Button onClick={handleSave} disabled={saving}>
          <Save className="mr-2 h-4 w-4" />
          {saving ? '创建中...' : '创建'}
        </Button>
        <Button variant="outline" onClick={() => router.back()}>
          取消
        </Button>
      </div>
    </div>
  );
}
