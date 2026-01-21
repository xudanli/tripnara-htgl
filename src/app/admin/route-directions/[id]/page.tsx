'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Save, Plus, X } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  getRouteDirectionById,
  updateRouteDirection,
  deleteRouteDirection,
} from '@/services/route-directions';
import type {
  RouteDirection,
  UpdateRouteDirectionDto,
} from '@/types/api';

export default function RouteDirectionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const directionId = Number(params.id);

  const [direction, setDirection] = useState<RouteDirection | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<UpdateRouteDirectionDto>({
    countryCode: '',
    name: '',
    nameCN: '',
    nameEN: '',
    description: '',
    tags: [],
    regions: [],
    entryHubs: [],
    isActive: true,
  });
  const [tagInput, setTagInput] = useState('');
  const [regionInput, setRegionInput] = useState('');
  const [entryHubInput, setEntryHubInput] = useState('');

  useEffect(() => {
    if (directionId && !isNaN(directionId)) {
      loadDirection();
    }
  }, [directionId]);

  async function loadDirection() {
    setLoading(true);
    try {
      const directionData = await getRouteDirectionById(directionId);
      if (directionData) {
        setDirection(directionData);
        setFormData({
          countryCode: directionData.countryCode,
          name: directionData.name,
          nameCN: directionData.nameCN || '',
          nameEN: directionData.nameEN || '',
          description: directionData.description || '',
          tags: directionData.tags || [],
          regions: directionData.regions || [],
          entryHubs: directionData.entryHubs || [],
          isActive: directionData.isActive,
        });
      }
    } catch (error) {
      console.error('加载路线方向详情失败:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    try {
      const updated = await updateRouteDirection(directionId, formData);
      if (updated) {
        setDirection(updated);
        alert('保存成功');
      }
    } catch (error) {
      console.error('保存失败:', error);
      alert('保存失败，请重试');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm('确定要删除这个路线方向吗？')) {
      return;
    }

    try {
      const result = await deleteRouteDirection(directionId);
      if (result) {
        alert('删除成功');
        router.push('/admin/route-directions');
      }
    } catch (error) {
      console.error('删除失败:', error);
      alert('删除失败，请重试');
    }
  }

  function handleAddTag() {
    if (tagInput.trim() && !formData.tags?.includes(tagInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...(prev.tags || []), tagInput.trim()],
      }));
      setTagInput('');
    }
  }

  function handleRemoveTag(tag: string) {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags?.filter((t) => t !== tag) || [],
    }));
  }

  function handleAddRegion() {
    if (regionInput.trim() && !formData.regions?.includes(regionInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        regions: [...(prev.regions || []), regionInput.trim()],
      }));
      setRegionInput('');
    }
  }

  function handleRemoveRegion(region: string) {
    setFormData((prev) => ({
      ...prev,
      regions: prev.regions?.filter((r) => r !== region) || [],
    }));
  }

  function handleAddEntryHub() {
    if (entryHubInput.trim() && !formData.entryHubs?.includes(entryHubInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        entryHubs: [...(prev.entryHubs || []), entryHubInput.trim()],
      }));
      setEntryHubInput('');
    }
  }

  function handleRemoveEntryHub(hub: string) {
    setFormData((prev) => ({
      ...prev,
      entryHubs: prev.entryHubs?.filter((h) => h !== hub) || [],
    }));
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">加载中...</div>
      </div>
    );
  }

  if (!direction) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">路线方向不存在</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/route-directions">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">路线方向详情</h1>
            <p className="text-muted-foreground mt-2">编辑路线方向信息</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* 基本信息 */}
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">基本信息</h2>
          <div className="space-y-4">
            <div>
              <Label>路线方向ID</Label>
              <Input value={direction.id} disabled className="mt-1 bg-muted" />
            </div>
            <div>
              <Label>UUID</Label>
              <Input value={direction.uuid} disabled className="mt-1 bg-muted font-mono text-xs" />
            </div>
            <div>
              <Label>国家代码 *</Label>
              <Input
                value={formData.countryCode}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    countryCode: e.target.value.toUpperCase(),
                  }))
                }
                className="mt-1"
                placeholder="如: IS"
                maxLength={2}
              />
            </div>
            <div>
              <Label>名称 *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                className="mt-1"
                placeholder="路线方向名称"
              />
            </div>
            <div>
              <Label>中文名称</Label>
              <Input
                value={formData.nameCN || ''}
                onChange={(e) => setFormData((prev) => ({ ...prev, nameCN: e.target.value }))}
                className="mt-1"
                placeholder="中文名称"
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
              <Label>描述</Label>
              <Textarea
                value={formData.description || ''}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, description: e.target.value }))
                }
                className="mt-1"
                placeholder="路线方向描述"
                rows={4}
              />
            </div>
            <div>
              <Label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, isActive: e.target.checked }))
                  }
                />
                <span>激活状态</span>
              </Label>
            </div>
          </div>
        </div>

        {/* 标签和区域 */}
        <div className="space-y-6">
          {/* 标签 */}
          <div className="rounded-lg border bg-card p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-4">标签</h2>
            <div className="space-y-2">
              <div className="flex gap-2">
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                  placeholder="输入标签后按回车"
                />
                <Button onClick={handleAddTag} variant="outline">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.tags?.map((tag) => (
                  <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                    {tag}
                    <button
                      onClick={() => handleRemoveTag(tag)}
                      className="hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          {/* 区域 */}
          <div className="rounded-lg border bg-card p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-4">区域</h2>
            <div className="space-y-2">
              <div className="flex gap-2">
                <Input
                  value={regionInput}
                  onChange={(e) => setRegionInput(e.target.value)}
                  onKeyDown={(e) =>
                    e.key === 'Enter' && (e.preventDefault(), handleAddRegion())
                  }
                  placeholder="输入区域后按回车"
                />
                <Button onClick={handleAddRegion} variant="outline">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.regions?.map((region) => (
                  <Badge key={region} variant="secondary" className="flex items-center gap-1">
                    {region}
                    <button
                      onClick={() => handleRemoveRegion(region)}
                      className="hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          {/* 入口枢纽 */}
          <div className="rounded-lg border bg-card p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-4">入口枢纽</h2>
            <div className="space-y-2">
              <div className="flex gap-2">
                <Input
                  value={entryHubInput}
                  onChange={(e) => setEntryHubInput(e.target.value)}
                  onKeyDown={(e) =>
                    e.key === 'Enter' && (e.preventDefault(), handleAddEntryHub())
                  }
                  placeholder="输入入口枢纽后按回车"
                />
                <Button onClick={handleAddEntryHub} variant="outline">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.entryHubs?.map((hub) => (
                  <Badge key={hub} variant="secondary" className="flex items-center gap-1">
                    {hub}
                    <button
                      onClick={() => handleRemoveEntryHub(hub)}
                      className="hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          {/* 时间信息 */}
          <div className="rounded-lg border bg-card p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-4">时间信息</h2>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-muted-foreground">创建时间:</span>{' '}
                <span className="font-medium">
                  {new Date(direction.createdAt).toLocaleString('zh-CN')}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">更新时间:</span>{' '}
                <span className="font-medium">
                  {new Date(direction.updatedAt).toLocaleString('zh-CN')}
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
        <Button variant="destructive" onClick={handleDelete}>
          删除
        </Button>
        <Link href={`/admin/route-directions/templates?routeDirectionId=${direction.id}`}>
          <Button variant="outline">查看模板</Button>
        </Link>
      </div>
    </div>
  );
}
