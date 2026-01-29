'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Search, Eye, Edit, Trash2, Plus, Calendar, Power } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  getRouteTemplates,
  hardDeleteRouteTemplate,
  createRouteTemplate,
  updateRouteTemplate,
  getRouteTemplateById,
} from '@/services/route-directions';
import type {
  RouteTemplate,
  QueryRouteTemplateDto,
  CreateRouteTemplateDto,
  PacePreference,
} from '@/types/api';

const paceLabels: Record<PacePreference, string> = {
  RELAXED: '轻松',
  BALANCED: '平衡',
  INTENSE: '紧凑',
};

export default function RouteTemplatesPage() {
  const searchParams = useSearchParams();
  const routeDirectionIdParam = searchParams.get('routeDirectionId');

  const [templates, setTemplates] = useState<RouteTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [params, setParams] = useState<QueryRouteTemplateDto>({
    routeDirectionId: routeDirectionIdParam ? Number(routeDirectionIdParam) : undefined,
  });
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createForm, setCreateForm] = useState<CreateRouteTemplateDto>({
    routeDirectionId: routeDirectionIdParam ? Number(routeDirectionIdParam) : 0,
    durationDays: 7,
    name: '',
    nameCN: '',
    nameEN: '',
    dayPlans: [],
    defaultPacePreference: 'BALANCED',
    isActive: true,
  });
  const [dayPlanInput, setDayPlanInput] = useState({ day: 1, theme: '' });

  useEffect(() => {
    loadTemplates();
  }, [params]);

  async function loadTemplates() {
    setLoading(true);
    try {
      const result = await getRouteTemplates(params);
      if (result) {
        setTemplates(result);
      }
    } catch (error) {
      console.error('加载路线模板列表失败:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleToggleActive(id: number, currentActive: boolean) {
    const newActiveState = !currentActive;
    const action = newActiveState ? '激活' : '禁用';
    
    if (!confirm(`确定要${action}这个路线模板吗？`)) {
      return;
    }

    try {
      const templateData = await getRouteTemplateById(id);
      if (!templateData) {
        alert('获取模板信息失败');
        return;
      }

      const updated = await updateRouteTemplate(id, {
        routeDirectionId: templateData.routeDirectionId,
        durationDays: templateData.durationDays,
        name: templateData.name,
        nameCN: templateData.nameCN,
        nameEN: templateData.nameEN,
        dayPlans: templateData.dayPlans || [],
        defaultPacePreference: templateData.defaultPacePreference,
        isActive: newActiveState,
      });

      if (updated) {
        alert(`${action}成功`);
        loadTemplates();
      }
    } catch (error) {
      console.error(`${action}失败:`, error);
      alert(`${action}失败，请重试`);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('⚠️ 警告：确定要删除这个路线模板吗？\n\n删除后数据将无法恢复！')) {
      return;
    }

    if (!confirm('请再次确认：这将永久删除该模板，无法恢复！')) {
      return;
    }

    try {
      const result = await hardDeleteRouteTemplate(id);
      if (result) {
        alert('已删除');
        loadTemplates();
      }
    } catch (error) {
      console.error('删除失败:', error);
      alert('删除失败，请重试');
    }
  }

  async function handleCreate() {
    if (!createForm.routeDirectionId || !createForm.name || !createForm.durationDays) {
      alert('请填写路线方向ID、名称和天数');
      return;
    }

    setCreating(true);
    try {
      const result = await createRouteTemplate(createForm);
      if (result) {
        alert('创建成功');
        setShowCreateForm(false);
        setCreateForm({
          routeDirectionId: routeDirectionIdParam ? Number(routeDirectionIdParam) : 0,
          durationDays: 7,
          name: '',
          nameCN: '',
          nameEN: '',
          dayPlans: [],
          defaultPacePreference: 'BALANCED',
          isActive: true,
        });
        loadTemplates();
      }
    } catch (error) {
      console.error('创建失败:', error);
      alert('创建失败，请重试');
    } finally {
      setCreating(false);
    }
  }

  function handleAddDayPlan() {
    if (dayPlanInput.day > 0 && dayPlanInput.theme.trim()) {
      const newDayPlan = {
        day: dayPlanInput.day,
        theme: dayPlanInput.theme.trim(),
        requiredNodes: [],
      };
      setCreateForm((prev) => ({
        ...prev,
        dayPlans: [...(prev.dayPlans || []), newDayPlan],
      }));
      setDayPlanInput({ day: (prev.dayPlans?.length || 0) + 2, theme: '' });
    }
  }

  function handleRemoveDayPlan(index: number) {
    setCreateForm((prev) => ({
      ...prev,
      dayPlans: prev.dayPlans?.filter((_, i) => i !== index) || [],
    }));
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">路线模板管理</h1>
          <p className="text-muted-foreground mt-2">管理基于路线方向的行程模板</p>
        </div>
        <Button onClick={() => setShowCreateForm(!showCreateForm)}>
          <Plus className="mr-2 h-4 w-4" />
          创建路线模板
        </Button>
      </div>

      {/* 创建表单 */}
      {showCreateForm && (
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">创建路线模板</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium">路线方向ID *</label>
              <input
                type="number"
                className="w-full mt-1 px-3 py-2 border rounded-md"
                placeholder="路线方向ID"
                value={createForm.routeDirectionId || ''}
                onChange={(e) =>
                  setCreateForm((prev) => ({
                    ...prev,
                    routeDirectionId: Number(e.target.value),
                  }))
                }
              />
            </div>
            <div>
              <label className="text-sm font-medium">天数 *</label>
              <input
                type="number"
                className="w-full mt-1 px-3 py-2 border rounded-md"
                placeholder="7"
                min="1"
                value={createForm.durationDays}
                onChange={(e) =>
                  setCreateForm((prev) => ({
                    ...prev,
                    durationDays: Number(e.target.value),
                  }))
                }
              />
            </div>
            <div>
              <label className="text-sm font-medium">名称 *</label>
              <input
                type="text"
                className="w-full mt-1 px-3 py-2 border rounded-md"
                placeholder="模板名称"
                value={createForm.name}
                onChange={(e) => setCreateForm((prev) => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-sm font-medium">中文名称</label>
              <input
                type="text"
                className="w-full mt-1 px-3 py-2 border rounded-md"
                placeholder="中文名称"
                value={createForm.nameCN || ''}
                onChange={(e) => setCreateForm((prev) => ({ ...prev, nameCN: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-sm font-medium">英文名称</label>
              <input
                type="text"
                className="w-full mt-1 px-3 py-2 border rounded-md"
                placeholder="English Name"
                value={createForm.nameEN || ''}
                onChange={(e) => setCreateForm((prev) => ({ ...prev, nameEN: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-sm font-medium">默认节奏偏好</label>
              <select
                className="w-full mt-1 px-3 py-2 border rounded-md"
                value={createForm.defaultPacePreference}
                onChange={(e) =>
                  setCreateForm((prev) => ({
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
            <div className="md:col-span-2">
              <label className="text-sm font-medium">日计划</label>
              <div className="flex gap-2 mt-1">
                <input
                  type="number"
                  className="w-20 px-3 py-2 border rounded-md"
                  placeholder="天数"
                  min="1"
                  value={dayPlanInput.day}
                  onChange={(e) =>
                    setDayPlanInput((prev) => ({ ...prev, day: Number(e.target.value) }))
                  }
                />
                <input
                  type="text"
                  className="flex-1 px-3 py-2 border rounded-md"
                  placeholder="主题"
                  value={dayPlanInput.theme}
                  onChange={(e) =>
                    setDayPlanInput((prev) => ({ ...prev, theme: e.target.value }))
                  }
                  onKeyDown={(e) =>
                    e.key === 'Enter' && (e.preventDefault(), handleAddDayPlan())
                  }
                />
                <Button type="button" onClick={handleAddDayPlan} variant="outline">
                  添加
                </Button>
              </div>
              <div className="mt-2 space-y-1">
                {createForm.dayPlans?.map((plan, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 bg-muted rounded"
                  >
                    <span className="text-sm">
                      第{plan.day}天: {plan.theme}
                    </span>
                    <button
                      onClick={() => handleRemoveDayPlan(index)}
                      className="text-destructive hover:underline"
                    >
                      删除
                    </button>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={createForm.isActive}
                  onChange={(e) =>
                    setCreateForm((prev) => ({ ...prev, isActive: e.target.checked }))
                  }
                />
                <span className="text-sm font-medium">激活状态</span>
              </label>
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <Button onClick={handleCreate} disabled={creating}>
              {creating ? '创建中...' : '创建'}
            </Button>
            <Button variant="outline" onClick={() => setShowCreateForm(false)}>
              取消
            </Button>
          </div>
        </div>
      )}

      {/* 搜索和筛选 */}
      <div className="flex gap-4 items-center flex-wrap">
        <input
          type="number"
          placeholder="路线方向ID"
          className="px-4 py-2 border rounded-md w-40"
          value={params.routeDirectionId || ''}
          onChange={(e) =>
            setParams((prev) => ({
              ...prev,
              routeDirectionId: e.target.value ? Number(e.target.value) : undefined,
            }))
          }
        />
        <input
          type="number"
          placeholder="天数"
          className="px-4 py-2 border rounded-md w-32"
          value={params.durationDays || ''}
          onChange={(e) =>
            setParams((prev) => ({
              ...prev,
              durationDays: e.target.value ? Number(e.target.value) : undefined,
            }))
          }
        />
        <select
          className="px-4 py-2 border rounded-md"
          value={params.isActive?.toString() || 'all'}
          onChange={(e) =>
            setParams((prev) => ({
              ...prev,
              isActive:
                e.target.value === 'all'
                  ? undefined
                  : e.target.value === 'true',
            }))
          }
        >
          <option value="all">全部状态</option>
          <option value="true">激活</option>
          <option value="false">未激活</option>
        </select>
      </div>

      {/* 模板列表 */}
      <div className="rounded-lg border bg-card shadow-sm">
        {loading ? (
          <div className="p-8 text-center text-muted-foreground">加载中...</div>
        ) : templates.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">暂无路线模板</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-medium">ID</th>
                    <th className="px-6 py-3 text-left text-sm font-medium">名称</th>
                    <th className="px-6 py-3 text-left text-sm font-medium">路线方向ID</th>
                    <th className="px-6 py-3 text-left text-sm font-medium">天数</th>
                    <th className="px-6 py-3 text-left text-sm font-medium">节奏偏好</th>
                    <th className="px-6 py-3 text-left text-sm font-medium">状态</th>
                    <th className="px-6 py-3 text-right text-sm font-medium">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {templates.map((template) => (
                    <tr key={template.id} className="hover:bg-muted/50">
                      <td className="px-6 py-4 text-sm font-mono">{template.id}</td>
                      <td className="px-6 py-4 text-sm">
                        <div>
                          <div className="font-medium">{template.nameCN || template.name}</div>
                          {template.nameEN && (
                            <div className="text-xs text-muted-foreground">{template.nameEN}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <Link
                          href={`/admin/route-directions/${template.routeDirectionId}`}
                          className="text-blue-600 hover:underline"
                        >
                          {template.routeDirectionId}
                        </Link>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <Badge variant="outline">
                          <Calendar className="mr-1 h-3 w-3" />
                          {template.durationDays}天
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {template.defaultPacePreference && (
                          <Badge variant="secondary">
                            {paceLabels[template.defaultPacePreference]}
                          </Badge>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <Badge
                          variant={template.isActive ? 'default' : 'secondary'}
                          className={
                            template.isActive
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }
                        >
                          {template.isActive ? '激活' : '未激活'}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <Link href={`/admin/route-directions/templates/${template.id}`}>
                            <Button variant="ghost" size="icon" title="查看详情">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Link href={`/admin/route-directions/templates/${template.id}`}>
                            <Button variant="ghost" size="icon" title="编辑">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleToggleActive(template.id, template.isActive)}
                            title={template.isActive ? '禁用' : '激活'}
                            className={template.isActive ? 'text-orange-600 hover:text-orange-700' : 'text-green-600 hover:text-green-700'}
                          >
                            <Power className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(template.id)}
                            title="删除（永久删除，不可恢复）"
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
