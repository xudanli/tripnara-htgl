'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Save, Plus, X, Calendar, Power, Trash2, MapPin, Search } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  getRouteTemplateById,
  updateRouteTemplate,
  hardDeleteRouteTemplate,
  createTripFromRouteTemplate,
  getAvailablePOIsForTemplate,
} from '@/services/route-directions';
import { getPlacesBatch } from '@/services/places';
import type {
  RouteTemplate,
  UpdateRouteTemplateDto,
  CreateTripFromRouteTemplateDto,
  PacePreference,
  PlaceListItem,
  Place,
  PlaceCategory,
  RouteDayPlan,
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
  
  // POI选择器相关状态
  const [showPOISelector, setShowPOISelector] = useState(false);
  const [currentDayPlanIndex, setCurrentDayPlanIndex] = useState<number | null>(null);
  const [availablePOIs, setAvailablePOIs] = useState<PlaceListItem[]>([]);
  const [poiSearch, setPOISearch] = useState('');
  const [poiCategory, setPOICategory] = useState<PlaceCategory | ''>('');
  const [loadingPOIs, setLoadingPOIs] = useState(false);
  const [selectedPOIDetails, setSelectedPOIDetails] = useState<Record<number, Place[]>>({});

  useEffect(() => {
    if (templateId && !isNaN(templateId)) {
      loadTemplate();
    }
  }, [templateId]);

  async function loadTemplate() {
    setLoading(true);
    try {
      const templateData = await getRouteTemplateById(templateId);
      console.log('[loadTemplate] 从后端加载的数据:', templateData);
      
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
    // 数据验证
    if (!formData.routeDirectionId || formData.routeDirectionId === 0) {
      alert('❌ 保存失败：请选择关联的路线方向');
      return;
    }

    if (!formData.name || !formData.name.trim()) {
      alert('❌ 保存失败：请输入模板名称');
      return;
    }

    if (!formData.durationDays || formData.durationDays <= 0) {
      alert('❌ 保存失败：请输入有效的行程天数（必须大于0）');
      return;
    }

    // 验证日计划数据
    if (formData.dayPlans && formData.dayPlans.length > 0) {
      for (const dayPlan of formData.dayPlans) {
        if (!dayPlan.day || dayPlan.day <= 0) {
          alert(`❌ 保存失败：日计划第${formData.dayPlans.indexOf(dayPlan) + 1}天的天数无效`);
          return;
        }
      }
    }

    // 确保 defaultPacePreference 是正确的枚举值
    const normalizePacePreference = (value: string | undefined): PacePreference => {
      if (!value) return 'BALANCED';
      const upperValue = value.toUpperCase();
      if (upperValue === 'RELAXED' || upperValue === 'BALANCED' || upperValue === 'INTENSE') {
        return upperValue as PacePreference;
      }
      // 处理中文值
      if (value.includes('轻松') || value.includes('relaxed')) return 'RELAXED';
      if (value.includes('紧凑') || value.includes('intense')) return 'INTENSE';
      return 'BALANCED';
    };

    // 构建更新数据
    const updateData: UpdateRouteTemplateDto = {
      routeDirectionId: formData.routeDirectionId,
      durationDays: formData.durationDays,
      name: formData.name,
      nameCN: formData.nameCN || undefined,
      nameEN: formData.nameEN || undefined,
      dayPlans: formData.dayPlans?.map(dp => ({
        day: dp.day,
        theme: dp.theme || '',
        requiredNodes: dp.requiredNodes?.map(id => typeof id === 'string' ? id : String(id)) || [],
      })),
      defaultPacePreference: normalizePacePreference(formData.defaultPacePreference),
      isActive: formData.isActive,
    };

    // 调试：打印保存的数据
    console.log('=== 保存数据调试 ===');
    console.log('updateData.dayPlans:', JSON.stringify(updateData.dayPlans, null, 2));

    setSaving(true);
    
    try {
      const updated = await updateRouteTemplate(templateId, updateData);
      if (updated) {
        setTemplate(updated);
        // 同步更新 formData，确保页面显示最新数据
        setFormData({
          routeDirectionId: updated.routeDirectionId,
          durationDays: updated.durationDays,
          name: updated.name,
          nameCN: updated.nameCN || '',
          nameEN: updated.nameEN || '',
          dayPlans: updated.dayPlans || [],
          defaultPacePreference: updated.defaultPacePreference || 'BALANCED',
          isActive: updated.isActive,
        });
        alert('✅ 保存成功！');
      }
    } catch (error) {
      console.error('保存失败:', error);
      const errorMessage = error instanceof Error ? error.message : '未知错误';
      alert(`❌ 保存失败：${errorMessage}`);
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleActive() {
    const newActiveState = !formData.isActive;
    const action = newActiveState ? '激活' : '禁用';
    
    if (!confirm(`确定要${action}这个路线模板吗？`)) {
      return;
    }

    setSaving(true);
    try {
      const updated = await updateRouteTemplate(templateId, {
        ...formData,
        isActive: newActiveState,
      });
      if (updated) {
        setTemplate(updated);
        setFormData((prev) => ({ ...prev, isActive: newActiveState }));
        alert(`✅ ${action}成功！路线模板已${action}。`);
      } else {
        alert(`❌ ${action}失败：服务器返回空结果\n\n可能原因：\n1. 后端服务未启动\n2. 后端服务返回错误\n3. 请查看浏览器控制台获取详细信息`);
      }
    } catch (error) {
      console.error(`${action}失败:`, error);
      const errorMessage = error instanceof Error ? error.message : '未知错误';
      alert(`❌ ${action}失败：${errorMessage}\n\n请检查：\n1. 后端服务是否已启动（默认端口 3000）\n2. 网络连接是否正常\n3. 查看浏览器控制台获取详细错误信息`);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm('⚠️ 警告：确定要删除这个路线模板吗？\n\n删除后数据将无法恢复！')) {
      return;
    }

    if (!confirm('请再次确认：这将永久删除该模板，无法恢复！')) {
      return;
    }

    try {
      const result = await hardDeleteRouteTemplate(templateId);
      if (result) {
        alert('✅ 删除成功！路线模板已永久删除。');
        router.push('/admin/route-directions/templates');
      } else {
        alert('❌ 删除失败：服务器返回空结果\n\n可能原因：\n1. 后端服务未启动\n2. 后端服务返回错误\n3. 请查看浏览器控制台获取详细信息');
      }
    } catch (error) {
      console.error('删除失败:', error);
      const errorMessage = error instanceof Error ? error.message : '未知错误';
      alert(`❌ 删除失败：${errorMessage}\n\n请检查：\n1. 后端服务是否已启动（默认端口 3000）\n2. 网络连接是否正常\n3. 查看浏览器控制台获取详细错误信息`);
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
        alert('✅ 创建行程成功！');
        setShowCreateTripForm(false);
      } else {
        alert('❌ 创建行程失败：服务器返回空结果\n\n可能原因：\n1. 后端服务未启动\n2. 后端服务返回错误\n3. 请查看浏览器控制台获取详细信息');
      }
    } catch (error) {
      console.error('创建行程失败:', error);
      const errorMessage = error instanceof Error ? error.message : '未知错误';
      alert(`❌ 创建行程失败：${errorMessage}\n\n请检查：\n1. 后端服务是否已启动（默认端口 3000）\n2. 网络连接是否正常\n3. 查看浏览器控制台获取详细错误信息`);
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

  // 加载可用POI列表
  async function loadAvailablePOIs() {
    if (!templateId) return;
    
    setLoadingPOIs(true);
    try {
      const result = await getAvailablePOIsForTemplate(templateId, {
        category: poiCategory || undefined,
        search: poiSearch || undefined,
        limit: 100,
      });
      
      if (result) {
        setAvailablePOIs(result.places || []);
      }
    } catch (error) {
      console.error('加载POI列表失败:', error);
    } finally {
      setLoadingPOIs(false);
    }
  }

  // 打开POI选择器
  function handleOpenPOISelector(dayPlanIndex: number) {
    setCurrentDayPlanIndex(dayPlanIndex);
    setShowPOISelector(true);
    setPOISearch('');
    setPOICategory('');
    loadAvailablePOIs();
  }

  // 关闭POI选择器
  function handleClosePOISelector() {
    setShowPOISelector(false);
    setCurrentDayPlanIndex(null);
    setPOISearch('');
    setPOICategory('');
  }

  // 添加POI到日计划
  function handleAddPOIToDayPlan(poiId: number) {
    if (currentDayPlanIndex === null) return;
    
    const poiIdStr = String(poiId);
    setFormData((prev) => {
      const updatedDayPlans = [...(prev.dayPlans || [])];
      const dayPlan = updatedDayPlans[currentDayPlanIndex];
      
      // 检查是否已存在
      if (dayPlan.requiredNodes?.includes(poiIdStr)) {
        return prev;
      }
      
      updatedDayPlans[currentDayPlanIndex] = {
        ...dayPlan,
        requiredNodes: [...(dayPlan.requiredNodes || []), poiIdStr],
      };
      
      return {
        ...prev,
        dayPlans: updatedDayPlans,
      };
    });
    
    // 加载POI详情用于显示
    loadPOIDetailsForDayPlan(currentDayPlanIndex);
  }

  // 从日计划移除POI
  function handleRemovePOIFromDayPlan(dayPlanIndex: number, poiId: string) {
    setFormData((prev) => {
      const updatedDayPlans = [...(prev.dayPlans || [])];
      const dayPlan = updatedDayPlans[dayPlanIndex];
      
      updatedDayPlans[dayPlanIndex] = {
        ...dayPlan,
        requiredNodes: (dayPlan.requiredNodes || []).filter(id => id !== poiId),
      };
      
      return {
        ...prev,
        dayPlans: updatedDayPlans,
      };
    });
    
    // 更新POI详情缓存
    loadPOIDetailsForDayPlan(dayPlanIndex);
  }

  // 加载日计划的POI详情
  async function loadPOIDetailsForDayPlan(dayPlanIndex: number) {
    const dayPlan = formData.dayPlans?.[dayPlanIndex];
    if (!dayPlan?.requiredNodes || dayPlan.requiredNodes.length === 0) {
      setSelectedPOIDetails((prev) => {
        const updated = { ...prev };
        delete updated[dayPlanIndex];
        return updated;
      });
      return;
    }
    
    try {
      const poiIds = dayPlan.requiredNodes.map(id => Number(id));
      const result = await getPlacesBatch(poiIds);
      
      if (result) {
        setSelectedPOIDetails((prev) => ({
          ...prev,
          [dayPlanIndex]: result.places,
        }));
      }
    } catch (error) {
      console.error('加载POI详情失败:', error);
    }
  }

  // 初始化时加载所有日计划的POI详情
  useEffect(() => {
    if (formData.dayPlans && formData.dayPlans.length > 0) {
      formData.dayPlans.forEach((_, index) => {
        loadPOIDetailsForDayPlan(index);
      });
    }
  }, [formData.dayPlans?.map(p => p.requiredNodes?.join(',')).join('|')]); // 当POI变化时重新加载

  // 搜索POI时重新加载
  useEffect(() => {
    if (showPOISelector) {
      const timer = setTimeout(() => {
        loadAvailablePOIs();
      }, 300); // 防抖
      
      return () => clearTimeout(timer);
    }
  }, [poiSearch, poiCategory]);

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
                ?.map((plan, originalIndex) => ({ plan, originalIndex }))
                .sort((a, b) => a.plan.day - b.plan.day)
                .map(({ plan, originalIndex }) => {
                  const poiDetails = selectedPOIDetails[originalIndex] || [];
                  
                  return (
                    <div
                      key={`${plan.day}-${originalIndex}`}
                      className="p-3 bg-muted rounded border space-y-2"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 flex-1">
                          <Badge variant="outline" className="shrink-0">
                            <Calendar className="mr-1 h-3 w-3" />
                            第{plan.day}天
                          </Badge>
                          <Input
                            className="h-7 text-sm flex-1"
                            placeholder="输入主题..."
                            value={plan.theme || ''}
                            onChange={(e) => {
                              const newDayPlans = [...(formData.dayPlans || [])];
                              newDayPlans[originalIndex] = {
                                ...newDayPlans[originalIndex],
                                theme: e.target.value,
                              };
                              setFormData((prev) => ({ ...prev, dayPlans: newDayPlans }));
                            }}
                          />
                        </div>
                        <div className="flex gap-1 shrink-0">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenPOISelector(originalIndex)}
                            title="添加POI"
                          >
                            <MapPin className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveDayPlan(originalIndex)}
                          >
                            <X className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                      
                      {/* 已选POI列表 */}
                      {poiDetails.length > 0 && (
                        <div className="mt-2 pt-2 border-t space-y-1">
                          <div className="text-xs text-muted-foreground mb-1">已选POI:</div>
                          <div className="flex flex-wrap gap-1">
                            {poiDetails.map((poi) => (
                              <Badge
                                key={poi.id}
                                variant="secondary"
                                className="text-xs flex items-center gap-1"
                              >
                                <MapPin className="h-3 w-3" />
                                {poi.nameCN || poi.nameEN}
                                <button
                                  onClick={() => handleRemovePOIFromDayPlan(originalIndex, String(poi.id))}
                                  className="ml-1 hover:text-destructive"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
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
        <Button
          variant={formData.isActive ? 'secondary' : 'default'}
          onClick={handleToggleActive}
          disabled={saving}
        >
          <Power className="mr-2 h-4 w-4" />
          {formData.isActive ? '禁用' : '激活'}
        </Button>
        <Button variant="destructive" onClick={handleDelete} disabled={saving}>
          <Trash2 className="mr-2 h-4 w-4" />
          删除
        </Button>
      </div>

      {/* POI选择器对话框 */}
      <Dialog open={showPOISelector} onOpenChange={setShowPOISelector}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>选择POI</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 flex-1 overflow-hidden flex flex-col">
            {/* 搜索和筛选 */}
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="搜索POI..."
                  value={poiSearch}
                  onChange={(e) => setPOISearch(e.target.value)}
                  className="pl-8"
                />
              </div>
              <select
                className="px-3 py-2 border rounded-md text-sm"
                value={poiCategory}
                onChange={(e) => setPOICategory(e.target.value as PlaceCategory | '')}
              >
                <option value="">全部类别</option>
                <option value="ATTRACTION">景点</option>
                <option value="RESTAURANT">餐厅</option>
                <option value="SHOPPING">购物</option>
                <option value="HOTEL">酒店</option>
                <option value="TRANSIT_HUB">交通枢纽</option>
              </select>
            </div>
            
            {/* POI列表 */}
            <div className="flex-1 overflow-y-auto border rounded-md">
              {loadingPOIs ? (
                <div className="p-8 text-center text-muted-foreground">加载中...</div>
              ) : availablePOIs.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">暂无POI</div>
              ) : (
                <div className="divide-y">
                  {availablePOIs.map((poi) => {
                    const isSelected = currentDayPlanIndex !== null &&
                      formData.dayPlans?.[currentDayPlanIndex]?.requiredNodes?.includes(String(poi.id));
                    
                    return (
                      <div
                        key={poi.id}
                        className={`p-3 hover:bg-muted cursor-pointer ${
                          isSelected ? 'bg-muted' : ''
                        }`}
                        onClick={() => !isSelected && handleAddPOIToDayPlan(poi.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="font-medium text-sm">
                              {poi.nameCN || poi.nameEN}
                            </div>
                            {poi.nameEN && poi.nameCN && (
                              <div className="text-xs text-muted-foreground">{poi.nameEN}</div>
                            )}
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className="text-xs">
                                {poi.category === 'ATTRACTION' ? '景点' :
                                 poi.category === 'RESTAURANT' ? '餐厅' :
                                 poi.category === 'SHOPPING' ? '购物' :
                                 poi.category === 'HOTEL' ? '酒店' :
                                 poi.category === 'TRANSIT_HUB' ? '交通枢纽' : poi.category}
                              </Badge>
                              {poi.rating && (
                                <span className="text-xs text-muted-foreground">
                                  ⭐ {poi.rating.toFixed(1)}
                                </span>
                              )}
                            </div>
                          </div>
                          {isSelected && (
                            <Badge variant="default" className="ml-2">
                              已选择
                            </Badge>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={handleClosePOISelector}>
              关闭
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
