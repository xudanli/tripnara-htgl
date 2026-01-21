'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Search, Eye, Edit, Trash2, Plus, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  getRouteDirections,
  deleteRouteDirection,
  createRouteDirection,
} from '@/services/route-directions';
import type {
  RouteDirection,
  QueryRouteDirectionDto,
  CreateRouteDirectionDto,
} from '@/types/api';

export default function RouteDirectionsPage() {
  const [directions, setDirections] = useState<RouteDirection[]>([]);
  const [loading, setLoading] = useState(true);
  const [params, setParams] = useState<QueryRouteDirectionDto>({});
  const [search, setSearch] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createForm, setCreateForm] = useState<CreateRouteDirectionDto>({
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
    loadDirections();
  }, [params]);

  async function loadDirections() {
    setLoading(true);
    try {
      const result = await getRouteDirections(params);
      if (result) {
        setDirections(result);
      }
    } catch (error) {
      console.error('加载路线方向列表失败:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('确定要删除这个路线方向吗？')) {
      return;
    }

    try {
      const result = await deleteRouteDirection(id);
      if (result) {
        alert('删除成功');
        loadDirections();
      }
    } catch (error) {
      console.error('删除失败:', error);
      alert('删除失败，请重试');
    }
  }

  async function handleCreate() {
    if (!createForm.countryCode || !createForm.name) {
      alert('请填写国家代码和名称');
      return;
    }

    setCreating(true);
    try {
      const result = await createRouteDirection(createForm);
      if (result) {
        alert('创建成功');
        setShowCreateForm(false);
        setCreateForm({
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
        loadDirections();
      }
    } catch (error) {
      console.error('创建失败:', error);
      alert('创建失败，请重试');
    } finally {
      setCreating(false);
    }
  }

  function handleAddTag() {
    if (tagInput.trim() && !createForm.tags?.includes(tagInput.trim())) {
      setCreateForm((prev) => ({
        ...prev,
        tags: [...(prev.tags || []), tagInput.trim()],
      }));
      setTagInput('');
    }
  }

  function handleRemoveTag(tag: string) {
    setCreateForm((prev) => ({
      ...prev,
      tags: prev.tags?.filter((t) => t !== tag) || [],
    }));
  }

  function handleAddRegion() {
    if (regionInput.trim() && !createForm.regions?.includes(regionInput.trim())) {
      setCreateForm((prev) => ({
        ...prev,
        regions: [...(prev.regions || []), regionInput.trim()],
      }));
      setRegionInput('');
    }
  }

  function handleRemoveRegion(region: string) {
    setCreateForm((prev) => ({
      ...prev,
      regions: prev.regions?.filter((r) => r !== region) || [],
    }));
  }

  function handleAddEntryHub() {
    if (entryHubInput.trim() && !createForm.entryHubs?.includes(entryHubInput.trim())) {
      setCreateForm((prev) => ({
        ...prev,
        entryHubs: [...(prev.entryHubs || []), entryHubInput.trim()],
      }));
      setEntryHubInput('');
    }
  }

  function handleRemoveEntryHub(hub: string) {
    setCreateForm((prev) => ({
      ...prev,
      entryHubs: prev.entryHubs?.filter((h) => h !== hub) || [],
    }));
  }

  function handleSearch() {
    // 搜索功能可以根据需要实现
    loadDirections();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">路线方向管理</h1>
          <p className="text-muted-foreground mt-2">管理系统中的所有路线方向</p>
        </div>
        <Button onClick={() => setShowCreateForm(!showCreateForm)}>
          <Plus className="mr-2 h-4 w-4" />
          创建路线方向
        </Button>
      </div>

      {/* 创建表单 */}
      {showCreateForm && (
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">创建路线方向</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium">国家代码 *</label>
              <input
                type="text"
                className="w-full mt-1 px-3 py-2 border rounded-md"
                placeholder="如: IS, JP"
                value={createForm.countryCode}
                onChange={(e) =>
                  setCreateForm((prev) => ({ ...prev, countryCode: e.target.value.toUpperCase() }))
                }
                maxLength={2}
              />
            </div>
            <div>
              <label className="text-sm font-medium">名称 *</label>
              <input
                type="text"
                className="w-full mt-1 px-3 py-2 border rounded-md"
                placeholder="路线方向名称"
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
            <div className="md:col-span-2">
              <label className="text-sm font-medium">描述</label>
              <textarea
                className="w-full mt-1 px-3 py-2 border rounded-md"
                rows={3}
                placeholder="路线方向描述"
                value={createForm.description || ''}
                onChange={(e) =>
                  setCreateForm((prev) => ({ ...prev, description: e.target.value }))
                }
              />
            </div>
            <div>
              <label className="text-sm font-medium">标签</label>
              <div className="flex gap-2 mt-1">
                <input
                  type="text"
                  className="flex-1 px-3 py-2 border rounded-md"
                  placeholder="输入标签后按回车"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                />
                <Button type="button" onClick={handleAddTag} variant="outline">
                  添加
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {createForm.tags?.map((tag) => (
                  <Badge key={tag} variant="secondary" className="cursor-pointer">
                    {tag}
                    <button
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-1 hover:text-destructive"
                    >
                      ×
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">区域</label>
              <div className="flex gap-2 mt-1">
                <input
                  type="text"
                  className="flex-1 px-3 py-2 border rounded-md"
                  placeholder="输入区域后按回车"
                  value={regionInput}
                  onChange={(e) => setRegionInput(e.target.value)}
                  onKeyDown={(e) =>
                    e.key === 'Enter' && (e.preventDefault(), handleAddRegion())
                  }
                />
                <Button type="button" onClick={handleAddRegion} variant="outline">
                  添加
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {createForm.regions?.map((region) => (
                  <Badge key={region} variant="secondary" className="cursor-pointer">
                    {region}
                    <button
                      onClick={() => handleRemoveRegion(region)}
                      className="ml-1 hover:text-destructive"
                    >
                      ×
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
            <div className="md:col-span-2">
              <label className="text-sm font-medium">入口枢纽</label>
              <div className="flex gap-2 mt-1">
                <input
                  type="text"
                  className="flex-1 px-3 py-2 border rounded-md"
                  placeholder="输入入口枢纽后按回车"
                  value={entryHubInput}
                  onChange={(e) => setEntryHubInput(e.target.value)}
                  onKeyDown={(e) =>
                    e.key === 'Enter' && (e.preventDefault(), handleAddEntryHub())
                  }
                />
                <Button type="button" onClick={handleAddEntryHub} variant="outline">
                  添加
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {createForm.entryHubs?.map((hub) => (
                  <Badge key={hub} variant="secondary" className="cursor-pointer">
                    {hub}
                    <button
                      onClick={() => handleRemoveEntryHub(hub)}
                      className="ml-1 hover:text-destructive"
                    >
                      ×
                    </button>
                  </Badge>
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
        <div className="flex-1 flex gap-2 min-w-[300px]">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="搜索路线方向名称..."
              className="w-full pl-10 pr-4 py-2 border rounded-md"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <Button onClick={handleSearch}>搜索</Button>
        </div>
        <input
          type="text"
          placeholder="国家代码 (如: IS)"
          className="px-4 py-2 border rounded-md w-32"
          value={params.countryCode || ''}
          onChange={(e) =>
            setParams((prev) => ({
              ...prev,
              countryCode: e.target.value.toUpperCase() || undefined,
            }))
          }
        />
        <input
          type="text"
          placeholder="标签"
          className="px-4 py-2 border rounded-md w-32"
          value={params.tag || ''}
          onChange={(e) =>
            setParams((prev) => ({
              ...prev,
              tag: e.target.value || undefined,
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
        <input
          type="number"
          placeholder="月份 (1-12)"
          min="1"
          max="12"
          className="px-4 py-2 border rounded-md w-32"
          value={params.month || ''}
          onChange={(e) =>
            setParams((prev) => ({
              ...prev,
              month: e.target.value ? Number(e.target.value) : undefined,
            }))
          }
        />
      </div>

      {/* 路线方向列表 */}
      <div className="rounded-lg border bg-card shadow-sm">
        {loading ? (
          <div className="p-8 text-center text-muted-foreground">加载中...</div>
        ) : directions.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">暂无路线方向</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-medium">ID</th>
                    <th className="px-6 py-3 text-left text-sm font-medium">名称</th>
                    <th className="px-6 py-3 text-left text-sm font-medium">国家</th>
                    <th className="px-6 py-3 text-left text-sm font-medium">标签</th>
                    <th className="px-6 py-3 text-left text-sm font-medium">区域</th>
                    <th className="px-6 py-3 text-left text-sm font-medium">入口枢纽</th>
                    <th className="px-6 py-3 text-left text-sm font-medium">状态</th>
                    <th className="px-6 py-3 text-right text-sm font-medium">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {directions.map((direction) => (
                    <tr key={direction.id} className="hover:bg-muted/50">
                      <td className="px-6 py-4 text-sm font-mono">{direction.id}</td>
                      <td className="px-6 py-4 text-sm">
                        <div>
                          <div className="font-medium">{direction.nameCN || direction.name}</div>
                          {direction.nameEN && (
                            <div className="text-xs text-muted-foreground">{direction.nameEN}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <Badge variant="outline">{direction.countryCode}</Badge>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex flex-wrap gap-1">
                          {direction.tags?.slice(0, 3).map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                          {direction.tags && direction.tags.length > 3 && (
                            <Badge variant="secondary" className="text-xs">
                              +{direction.tags.length - 3}
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex flex-wrap gap-1">
                          {direction.regions?.slice(0, 2).map((region) => (
                            <span key={region} className="text-xs text-muted-foreground">
                              {region}
                            </span>
                          ))}
                          {direction.regions && direction.regions.length > 2 && (
                            <span className="text-xs text-muted-foreground">
                              +{direction.regions.length - 2}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex flex-wrap gap-1">
                          {direction.entryHubs?.slice(0, 2).map((hub) => (
                            <span key={hub} className="text-xs">
                              {hub}
                            </span>
                          ))}
                          {direction.entryHubs && direction.entryHubs.length > 2 && (
                            <span className="text-xs text-muted-foreground">
                              +{direction.entryHubs.length - 2}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <Badge
                          variant={direction.isActive ? 'default' : 'secondary'}
                          className={
                            direction.isActive
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }
                        >
                          {direction.isActive ? '激活' : '未激活'}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <Link href={`/admin/route-directions/${direction.id}`}>
                            <Button variant="ghost" size="icon">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Link href={`/admin/route-directions/${direction.id}`}>
                            <Button variant="ghost" size="icon">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(direction.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
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
