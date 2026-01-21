'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Save, Plus, X, Calendar } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  getRouteTemplateById,
  updateRouteTemplate,
  deleteRouteTemplate,
  createTripFromRouteTemplate,
} from '@/services/route-directions';
import type {
  RouteTemplate,
  UpdateRouteTemplateDto,
  CreateTripFromRouteTemplateDto,
  PacePreference,
} from '@/types/api';

const paceLabels: Record<PacePreference, string> = {
  RELAXED: '轻松',
  BALANCED: '平衡',
  INTENSE: '紧凑',
};

export default function RouteTemplateDetailPage() {
  const params = useParams();
  const router = useRouter();
  const templateId = Number(params.id);

  const [template, setTemplate] = useState<RouteTemplate | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<UpdateRouteTemplateDto>({
    routeDirectionId: 0,
    durationDays: 7,
    name: '',
    nameCN: '',
    nameEN: '',
    dayPlans: [],
    defaultPacePreference: 'BALANCED',
    isActive: true,
  });
  const [dayPlanInput, setDayPlanInput] = useState({ day: 1, theme: '' });
  const [showCreateTripForm, setShowCreateTripForm] = useState(false);
  const [tripForm, setTripForm] = useState<CreateTripFromRouteTemplateDto>({
    destination: '',
    startDate: '',
    endDate: '',
    totalBudget: undefined,
    pacePreference: 'BALANCED',
    intensity: 'balanced',
    transport: 'car',
  });

  useEffect(() => {
    if (templateId && !isNaN(templateId)) {
      loadTemplate();
    }
  }, [templateId]);

  async function loadTemplate() {
    setLoading(true);
    try {
      const templateData = await getRouteTemplateById(templateId);
      if (templateData) {
        setTemplate(templateData);
        setFormData({
          routeDirectionId: templateData.routeDirectionId,
          durationDays: templateData.durationDays,
          name: templateData.name,
          nameCN: templateData.nameCN || '',
          nameEN: templateData.nameEN || '',
          dayPlans: templateData.dayPlans || [],
          defaultPacePreference: templateData.defaultPacePreference || 'BALANCED',
          isActive: templateData.isActive,
        });
        // 设置日计划输入框的默认天数
        setDayPlanInput({
          day: (templateData.dayPlans?.length || 0) + 1,
          theme: '',
        });
      }
    } catch (error) {
      console.error('加载路线模板详情失败:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    try {
      const updated = await updateRouteTemplate(templateId, formData);
      if (updated) {
        setTemplate(updated);
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
    if (!confirm('确定要删除这个路线模板吗？')) {
      return;
    }

    try {
      const result = await deleteRouteTemplate(templateId);
      if (result) {
        alert('删除成功');
        router.push('/admin/route-directions/templates');
      }
    } catch (error) {
      console.error('删除失败:', error);
      alert('删除失败，请重试');
    }
  }

  async function handleCreateTrip() {
    if (!tripForm.destination || !tripForm.startDate || !tripForm.endDate) {
      alert('请填写目的地、开始日期和结束日期');
      return;
    }

    try {
      const result = await createTripFromRouteTemplate(templateId, tripForm);
      if (result) {
        alert('创建行程成功');
        setShowCreateTripForm(false);
      }
    } catch (error) {
      console.error('创建行程失败:', error);
      alert('创建行程失败，请重试');
    }
  }

  function handleAddDayPlan() {
    if (dayPlanInput.day > 0 && dayPlanInput.theme.trim()) {
      const newDayPlan = {
        day: dayPlanInput.day,
        theme: dayPlanInput.theme.trim(),
        requiredNodes: [],
      };
      setFormData((prev) => ({
        ...prev,
        dayPlans: [...(prev.dayPlans || []), newDayPlan],
      }));
      setDayPlanInput({ day: dayPlanInput.day + 1, theme: '' });
    }
  }

  function handleRemoveDayPlan(index: number) {
    setFormData((prev) => ({
      ...prev,
      dayPlans: prev.dayPlans?.filter((_, i) => i !== index) || [],
    }));
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">加载中...</div>
      </div>
    );
  }

  if (!template) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">路线模板不存在</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/route-directions/templates">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">路线模板详情</h1>
            <p className="text-muted-foreground mt-2">编辑路线模板信息</p>
          </div>
        </div>
        <Button onClick={() => setShowCreateTripForm(!showCreateTripForm)} variant="outline">
          使用模板创建行程
        </Button>
      </div>

      {/* 创建行程表单 */}
      {showCreateTripForm && (
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">使用模板创建行程</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label>目的地 *</Label>
              <Input
                value={tripForm.destination}
                onChange={(e) =>
                  setTripForm((prev) => ({ ...prev, destination: e.target.value.toUpperCase() }))
                }
                className="mt-1"
                placeholder="国家代码，如: IS"
                maxLength={2}
              />
            </div>
            <div>
              <Label>开始日期 *</Label>
              <Input
                type="date"
                value={tripForm.startDate}
                onChange={(e) => setTripForm((prev) => ({ ...prev, startDate: e.target.value }))}
                className="mt-1"
              />
            </div>
            <div>
              <Label>结束日期 *</Label>
              <Input
                type="date"
                value={tripForm.endDate}
                onChange={(e) => setTripForm((prev) => ({ ...prev, endDate: e.target.value }))}
                className="mt-1"
              />
            </div>
            <div>
              <Label>总预算</Label>
              <Input
                type="number"
                value={tripForm.totalBudget || ''}
                onChange={(e) =>
                  setTripForm((prev) => ({
                    ...prev,
                    totalBudget: e.target.value ? Number(e.target.value) : undefined,
                  }))
                }
                className="mt-1"
                placeholder="50000"
              />
            </div>
            <div>
              <Label>节奏偏好</Label>
              <select
                className="w-full mt-1 px-3 py-2 border rounded-md"
                value={tripForm.pacePreference}
                onChange={(e) =>
                  setTripForm((prev) => ({
                    ...prev,
                    pacePreference: e.target.value as PacePreference,
                  }))
                }
              >
                <option value="RELAXED">轻松</option>
                <option value="BALANCED">平衡</option>
                <option value="INTENSE">紧凑</option>
              </select>
            </div>
            <div>
              <Label>强度</Label>
              <select
                className="w-full mt-1 px-3 py-2 border rounded-md"
                value={tripForm.intensity}
                onChange={(e) =>
                  setTripForm((prev) => ({
                    ...prev,
                    intensity: e.target.value as 'relaxed' | 'balanced' | 'intense',
                  }))
                }
              >
                <option value="relaxed">轻松</option>
                <option value="balanced">平衡</option>
                <option value="intense">紧凑</option>
              </select>
            </div>
            <div>
              <Label>交通方式</Label>
              <Input
                value={tripForm.transport}
                onChange={(e) => setTripForm((prev) => ({ ...prev, transport: e.target.value }))}
                className="mt-1"
                placeholder="car"
              />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <Button onClick={handleCreateTrip}>创建行程</Button>
            <Button variant="outline" onClick={() => setShowCreateTripForm(false)}>
              取消
            </Button>
          </div>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {/* 基本信息 */}
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">基本信息</h2>
          <div className="space-y-4">
            <div>
              <Label>模板ID</Label>
              <Input value={template.id} disabled className="mt-1 bg-muted" />
            </div>
            <div>
              <Label>路线方向ID *</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  type="number"
                  value={formData.routeDirectionId}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      routeDirectionId: Number(e.target.value),
                    }))
                  }
                  className="flex-1"
                />
                <Link href={`/admin/route-directions/${formData.routeDirectionId}`}>
                  <Button variant="outline" size="icon">
                    <ArrowLeft className="h-4 w-4 rotate-180" />
                  </Button>
                </Link>
              </div>
            </div>
            <div>
              <Label>天数 *</Label>
              <Input
                type="number"
                value={formData.durationDays}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    durationDays: Number(e.target.value),
                  }))
                }
                className="mt-1"
                min="1"
              />
            </div>
            <div>
              <Label>名称 *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                className="mt-1"
                placeholder="模板名称"
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
              <Label>默认节奏偏好</Label>
              <select
                className="w-full mt-1 px-3 py-2 border rounded-md"
                value={formData.defaultPacePreference}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    defaultPacePreference: e.target.value as PacePreference,
                  }))
                }
              >
                <option value="RELAXED">轻松</option>
                <option value="BALANCED">平衡</option>
                <option value="INTENSE">紧凑</option>
              </select>
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

        {/* 日计划 */}
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">日计划</h2>
          <div className="space-y-2">
            <div className="flex gap-2">
              <Input
                type="number"
                className="w-20"
                placeholder="天数"
                min="1"
                value={dayPlanInput.day}
                onChange={(e) =>
                  setDayPlanInput((prev) => ({ ...prev, day: Number(e.target.value) }))
                }
              />
              <Input
                className="flex-1"
                placeholder="主题"
                value={dayPlanInput.theme}
                onChange={(e) =>
                  setDayPlanInput((prev) => ({ ...prev, theme: e.target.value }))
                }
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddDayPlan())}
              />
              <Button onClick={handleAddDayPlan} variant="outline" size="icon">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {formData.dayPlans
                ?.sort((a, b) => a.day - b.day)
                .map((plan, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-muted rounded border"
                  >
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">
                        <Calendar className="mr-1 h-3 w-3" />
                        第{plan.day}天
                      </Badge>
                      <span className="text-sm">{plan.theme}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveDayPlan(index)}
                    >
                      <X className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>

      {/* 关联的路线方向信息 */}
      {template.routeDirection && (
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">关联的路线方向</h2>
          <div className="space-y-2 text-sm">
            <div>
              <span className="text-muted-foreground">名称:</span>{' '}
              <span className="font-medium">
                {template.routeDirection.nameCN || template.routeDirection.name}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">国家代码:</span>{' '}
              <span className="font-medium">{template.routeDirection.countryCode}</span>
            </div>
            <Link href={`/admin/route-directions/${template.routeDirection.id}`}>
              <Button variant="outline" size="sm" className="mt-2">
                查看详情
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* 时间信息 */}
      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <h2 className="text-lg font-semibold mb-4">时间信息</h2>
        <div className="space-y-2 text-sm">
          <div>
            <span className="text-muted-foreground">创建时间:</span>{' '}
            <span className="font-medium">
              {new Date(template.createdAt).toLocaleString('zh-CN')}
            </span>
          </div>
          <div>
            <span className="text-muted-foreground">更新时间:</span>{' '}
            <span className="font-medium">
              {new Date(template.updatedAt).toLocaleString('zh-CN')}
            </span>
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
      </div>
    </div>
  );
}
