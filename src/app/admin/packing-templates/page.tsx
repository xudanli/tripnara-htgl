'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Search,
  Eye,
  Edit,
  Trash2,
  Plus,
  Upload,
  BarChart3,
  Power,
  PowerOff,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  getPackingTemplates,
  getPackingTemplateDetail,
  deletePackingTemplate,
  activatePackingTemplate,
  batchImportPackingTemplates,
  getPackingTemplatesStats,
} from '@/services/packing-templates-admin';
import {
  getPackingGuides,
  getPackingGuideDetail,
  deletePackingGuide,
  activatePackingGuide,
  batchImportPackingGuides,
  getPackingGuidesStats,
} from '@/services/packing-guides-admin';
import type {
  PackingChecklistTemplateListItem,
  GetPackingTemplatesParams,
  PackingTemplatesStats,
  PackingGuideListItem,
  GetPackingGuidesParams,
  PackingGuidesStats,
} from '@/types/api';

export default function PackingTemplatesPage() {
  // 模板相关状态
  const [templates, setTemplates] = useState<PackingChecklistTemplateListItem[]>([]);
  const [templatesLoading, setTemplatesLoading] = useState(true);
  const [templatesParams, setTemplatesParams] = useState<GetPackingTemplatesParams>({
    page: 1,
    limit: 20,
  });
  const [templatesTotal, setTemplatesTotal] = useState(0);
  const [templatesTotalPages, setTemplatesTotalPages] = useState(0);
  const [templatesSearch, setTemplatesSearch] = useState('');
  const [templatesStats, setTemplatesStats] = useState<PackingTemplatesStats | null>(null);

  // 指南相关状态
  const [guides, setGuides] = useState<PackingGuideListItem[]>([]);
  const [guidesLoading, setGuidesLoading] = useState(true);
  const [guidesParams, setGuidesParams] = useState<GetPackingGuidesParams>({
    page: 1,
    limit: 20,
  });
  const [guidesTotal, setGuidesTotal] = useState(0);
  const [guidesTotalPages, setGuidesTotalPages] = useState(0);
  const [guidesSearch, setGuidesSearch] = useState('');
  const [guidesStats, setGuidesStats] = useState<PackingGuidesStats | null>(null);

  // 对话框状态
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'template' | 'guide'; id: string } | null>(null);
  const [activateDialogOpen, setActivateDialogOpen] = useState(false);
  const [activateTarget, setActivateTarget] = useState<{
    type: 'template' | 'guide';
    id: string;
    currentStatus: boolean;
  } | null>(null);
  const [batchImportDialogOpen, setBatchImportDialogOpen] = useState(false);
  const [batchImportType, setBatchImportType] = useState<'template' | 'guide'>('template');
  const [batchImportFile, setBatchImportFile] = useState<File | null>(null);

  useEffect(() => {
    loadTemplates();
    loadTemplatesStats();
  }, [templatesParams]);

  useEffect(() => {
    loadGuides();
    loadGuidesStats();
  }, [guidesParams]);

  // 模板相关函数
  async function loadTemplates() {
    setTemplatesLoading(true);
    try {
      const result = await getPackingTemplates(templatesParams);
      if (result) {
        setTemplates(result.templates);
        setTemplatesTotal(result.total);
        setTemplatesTotalPages(result.totalPages);
      }
    } catch (error) {
      console.error('加载模板列表失败:', error);
    } finally {
      setTemplatesLoading(false);
    }
  }

  async function loadTemplatesStats() {
    try {
      const stats = await getPackingTemplatesStats();
      setTemplatesStats(stats);
    } catch (error) {
      console.error('加载模板统计失败:', error);
    }
  }

  async function handleDeleteTemplate(id: string) {
    try {
      const result = await deletePackingTemplate(id);
      if (result?.deleted) {
        alert('删除成功');
        loadTemplates();
        loadTemplatesStats();
      } else {
        alert('删除失败，请重试');
      }
    } catch (error) {
      console.error('删除失败:', error);
      alert('删除失败，请重试');
    } finally {
      setDeleteDialogOpen(false);
      setDeleteTarget(null);
    }
  }

  async function handleActivateTemplate(id: string, isActive: boolean) {
    try {
      const result = await activatePackingTemplate(id, { isActive });
      if (result) {
        alert(isActive ? '激活成功' : '停用成功');
        loadTemplates();
        loadTemplatesStats();
      } else {
        alert('操作失败，请重试');
      }
    } catch (error) {
      console.error('操作失败:', error);
      alert('操作失败，请重试');
    } finally {
      setActivateDialogOpen(false);
      setActivateTarget(null);
    }
  }

  // 指南相关函数
  async function loadGuides() {
    setGuidesLoading(true);
    try {
      const result = await getPackingGuides(guidesParams);
      if (result) {
        setGuides(result.guides);
        setGuidesTotal(result.total);
        setGuidesTotalPages(result.totalPages);
      }
    } catch (error) {
      console.error('加载指南列表失败:', error);
    } finally {
      setGuidesLoading(false);
    }
  }

  async function loadGuidesStats() {
    try {
      const stats = await getPackingGuidesStats();
      setGuidesStats(stats);
    } catch (error) {
      console.error('加载指南统计失败:', error);
    }
  }

  async function handleDeleteGuide(id: string) {
    try {
      const result = await deletePackingGuide(id);
      if (result?.deleted) {
        alert('删除成功');
        loadGuides();
        loadGuidesStats();
      } else {
        alert('删除失败，请重试');
      }
    } catch (error) {
      console.error('删除失败:', error);
      alert('删除失败，请重试');
    } finally {
      setDeleteDialogOpen(false);
      setDeleteTarget(null);
    }
  }

  async function handleActivateGuide(id: string, isActive: boolean) {
    try {
      const result = await activatePackingGuide(id, { isActive });
      if (result) {
        alert(isActive ? '激活成功' : '停用成功');
        loadGuides();
        loadGuidesStats();
      } else {
        alert('操作失败，请重试');
      }
    } catch (error) {
      console.error('操作失败:', error);
      alert('操作失败，请重试');
    } finally {
      setActivateDialogOpen(false);
      setActivateTarget(null);
    }
  }

  async function handleBatchImport() {
    if (!batchImportFile) {
      alert('请选择文件');
      return;
    }

    try {
      const text = await batchImportFile.text();
      const data = JSON.parse(text);
      
      if (batchImportType === 'template') {
        const result = await batchImportPackingTemplates({
          templates: Array.isArray(data) ? data : [data],
          overwrite: false,
        });
        if (result) {
          alert(`成功导入 ${result.successCount} / ${result.totalCount} 个模板`);
          loadTemplates();
          loadTemplatesStats();
        }
      } else {
        const result = await batchImportPackingGuides({
          guides: Array.isArray(data) ? data : [data],
          overwrite: false,
        });
        if (result) {
          alert(`成功导入 ${result.successCount} / ${result.totalCount} 个指南`);
          loadGuides();
          loadGuidesStats();
        }
      }
    } catch (error) {
      console.error('批量导入失败:', error);
      alert('批量导入失败，请检查文件格式');
    } finally {
      setBatchImportDialogOpen(false);
      setBatchImportFile(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">打包清单模板与指南管理</h1>
          <p className="text-muted-foreground mt-2">管理打包清单模板和打包指南</p>
        </div>
      </div>

      <Tabs defaultValue="templates" className="space-y-4">
        <TabsList>
          <TabsTrigger value="templates">
            <BarChart3 className="mr-2 h-4 w-4" />
            打包清单模板
          </TabsTrigger>
          <TabsTrigger value="guides">
            <BarChart3 className="mr-2 h-4 w-4" />
            打包指南
          </TabsTrigger>
        </TabsList>

        {/* 打包清单模板标签页 */}
        <TabsContent value="templates" className="space-y-4">
          {/* 统计信息 */}
          {templatesStats && (
            <div className="grid grid-cols-4 gap-4">
              <div className="rounded-lg border bg-card p-4">
                <div className="text-sm text-muted-foreground">总数</div>
                <div className="text-2xl font-bold">{templatesStats.total}</div>
              </div>
              <div className="rounded-lg border bg-card p-4">
                <div className="text-sm text-muted-foreground">激活</div>
                <div className="text-2xl font-bold text-green-600">{templatesStats.active}</div>
              </div>
              <div className="rounded-lg border bg-card p-4">
                <div className="text-sm text-muted-foreground">未激活</div>
                <div className="text-2xl font-bold text-gray-600">{templatesStats.inactive}</div>
              </div>
              <div className="rounded-lg border bg-card p-4">
                <div className="text-sm text-muted-foreground">最新版本</div>
                <div className="text-2xl font-bold">{templatesStats.latestVersion || '-'}</div>
                {templatesStats.latestUpdated && (
                  <div className="text-xs text-muted-foreground mt-1">
                    {new Date(templatesStats.latestUpdated).toLocaleDateString('zh-CN')}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 操作栏 */}
          <div className="flex items-center justify-between">
            <div className="flex gap-4 items-center flex-wrap">
              <div className="flex-1 flex gap-2 min-w-[300px]">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="搜索版本、元数据..."
                    className="w-full pl-10 pr-4 py-2 border rounded-md"
                    value={templatesSearch}
                    onChange={(e) => setTemplatesSearch(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        setTemplatesParams((prev) => ({
                          ...prev,
                          page: 1,
                          search: templatesSearch || undefined,
                        }));
                      }
                    }}
                  />
                </div>
                <Button
                  onClick={() => {
                    setTemplatesParams((prev) => ({
                      ...prev,
                      page: 1,
                      search: templatesSearch || undefined,
                    }));
                  }}
                >
                  搜索
                </Button>
              </div>
              <input
                type="text"
                placeholder="版本筛选"
                className="px-4 py-2 border rounded-md w-32"
                value={templatesParams.version || ''}
                onChange={(e) =>
                  setTemplatesParams((prev) => ({
                    ...prev,
                    page: 1,
                    version: e.target.value || undefined,
                  }))
                }
              />
              <select
                className="px-4 py-2 border rounded-md"
                value={templatesParams.isActive?.toString() || 'all'}
                onChange={(e) =>
                  setTemplatesParams((prev) => ({
                    ...prev,
                    page: 1,
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
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setBatchImportType('template');
                  setBatchImportDialogOpen(true);
                }}
              >
                <Upload className="mr-2 h-4 w-4" />
                批量导入
              </Button>
              <Link href="/admin/packing-templates/new">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  创建模板
                </Button>
              </Link>
            </div>
          </div>

          {/* 模板列表 */}
          <div className="rounded-lg border bg-card shadow-sm">
            {templatesLoading ? (
              <div className="p-8 text-center text-muted-foreground">
                <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                加载中...
              </div>
            ) : templates.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">暂无模板</div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b">
                      <tr>
                        <th className="px-6 py-3 text-left text-sm font-medium">ID</th>
                        <th className="px-6 py-3 text-left text-sm font-medium">版本</th>
                        <th className="px-6 py-3 text-left text-sm font-medium">最后更新</th>
                        <th className="px-6 py-3 text-left text-sm font-medium">状态</th>
                        <th className="px-6 py-3 text-left text-sm font-medium">创建时间</th>
                        <th className="px-6 py-3 text-right text-sm font-medium">操作</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {templates.map((template) => (
                        <tr key={template.id} className="hover:bg-muted/50">
                          <td className="px-6 py-4 text-sm font-mono text-xs">
                            {template.id.slice(0, 8)}...
                          </td>
                          <td className="px-6 py-4 text-sm font-medium">{template.version}</td>
                          <td className="px-6 py-4 text-sm text-muted-foreground">
                            {new Date(template.lastUpdated).toLocaleDateString('zh-CN')}
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
                          <td className="px-6 py-4 text-sm text-muted-foreground">
                            {new Date(template.createdAt).toLocaleDateString('zh-CN')}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex justify-end gap-2">
                              <Link href={`/admin/packing-templates/${template.id}`}>
                                <Button variant="ghost" size="icon">
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </Link>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  setActivateTarget({
                                    type: 'template',
                                    id: template.id,
                                    currentStatus: template.isActive,
                                  });
                                  setActivateDialogOpen(true);
                                }}
                              >
                                {template.isActive ? (
                                  <PowerOff className="h-4 w-4" />
                                ) : (
                                  <Power className="h-4 w-4" />
                                )}
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  setDeleteTarget({ type: 'template', id: template.id });
                                  setDeleteDialogOpen(true);
                                }}
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

                {/* 分页 */}
                {templatesTotalPages > 1 && (
                  <div className="flex items-center justify-between border-t px-6 py-4">
                    <div className="text-sm text-muted-foreground">
                      共 {templatesTotal} 条记录，第 {templatesParams.page} / {templatesTotalPages} 页
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setTemplatesParams((prev) => ({
                            ...prev,
                            page: (prev.page || 1) - 1,
                          }))
                        }
                        disabled={templatesParams.page === 1}
                      >
                        上一页
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setTemplatesParams((prev) => ({
                            ...prev,
                            page: (prev.page || 1) + 1,
                          }))
                        }
                        disabled={templatesParams.page === templatesTotalPages}
                      >
                        下一页
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </TabsContent>

        {/* 打包指南标签页 */}
        <TabsContent value="guides" className="space-y-4">
          {/* 统计信息 */}
          {guidesStats && (
            <div className="grid grid-cols-4 gap-4">
              <div className="rounded-lg border bg-card p-4">
                <div className="text-sm text-muted-foreground">总数</div>
                <div className="text-2xl font-bold">{guidesStats.total}</div>
              </div>
              <div className="rounded-lg border bg-card p-4">
                <div className="text-sm text-muted-foreground">激活</div>
                <div className="text-2xl font-bold text-green-600">{guidesStats.active}</div>
              </div>
              <div className="rounded-lg border bg-card p-4">
                <div className="text-sm text-muted-foreground">未激活</div>
                <div className="text-2xl font-bold text-gray-600">{guidesStats.inactive}</div>
              </div>
              <div className="rounded-lg border bg-card p-4">
                <div className="text-sm text-muted-foreground">最新版本</div>
                <div className="text-2xl font-bold">{guidesStats.latestVersion || '-'}</div>
                {guidesStats.latestUpdated && (
                  <div className="text-xs text-muted-foreground mt-1">
                    {new Date(guidesStats.latestUpdated).toLocaleDateString('zh-CN')}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 操作栏 */}
          <div className="flex items-center justify-between">
            <div className="flex gap-4 items-center flex-wrap">
              <div className="flex-1 flex gap-2 min-w-[300px]">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="搜索版本、关键词..."
                    className="w-full pl-10 pr-4 py-2 border rounded-md"
                    value={guidesSearch}
                    onChange={(e) => setGuidesSearch(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        setGuidesParams((prev) => ({
                          ...prev,
                          page: 1,
                          search: guidesSearch || undefined,
                        }));
                      }
                    }}
                  />
                </div>
                <Button
                  onClick={() => {
                    setGuidesParams((prev) => ({
                      ...prev,
                      page: 1,
                      search: guidesSearch || undefined,
                    }));
                  }}
                >
                  搜索
                </Button>
              </div>
              <input
                type="text"
                placeholder="版本筛选"
                className="px-4 py-2 border rounded-md w-32"
                value={guidesParams.version || ''}
                onChange={(e) =>
                  setGuidesParams((prev) => ({
                    ...prev,
                    page: 1,
                    version: e.target.value || undefined,
                  }))
                }
              />
              <select
                className="px-4 py-2 border rounded-md"
                value={guidesParams.isActive?.toString() || 'all'}
                onChange={(e) =>
                  setGuidesParams((prev) => ({
                    ...prev,
                    page: 1,
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
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setBatchImportType('guide');
                  setBatchImportDialogOpen(true);
                }}
              >
                <Upload className="mr-2 h-4 w-4" />
                批量导入
              </Button>
              <Link href="/admin/packing-guides/new">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  创建指南
                </Button>
              </Link>
            </div>
          </div>

          {/* 指南列表 */}
          <div className="rounded-lg border bg-card shadow-sm">
            {guidesLoading ? (
              <div className="p-8 text-center text-muted-foreground">
                <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                加载中...
              </div>
            ) : guides.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">暂无指南</div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b">
                      <tr>
                        <th className="px-6 py-3 text-left text-sm font-medium">ID</th>
                        <th className="px-6 py-3 text-left text-sm font-medium">版本</th>
                        <th className="px-6 py-3 text-left text-sm font-medium">最后更新</th>
                        <th className="px-6 py-3 text-left text-sm font-medium">状态</th>
                        <th className="px-6 py-3 text-left text-sm font-medium">创建时间</th>
                        <th className="px-6 py-3 text-right text-sm font-medium">操作</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {guides.map((guide) => (
                        <tr key={guide.id} className="hover:bg-muted/50">
                          <td className="px-6 py-4 text-sm font-mono text-xs">
                            {guide.id.slice(0, 8)}...
                          </td>
                          <td className="px-6 py-4 text-sm font-medium">{guide.version}</td>
                          <td className="px-6 py-4 text-sm text-muted-foreground">
                            {new Date(guide.lastUpdated).toLocaleDateString('zh-CN')}
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <Badge
                              variant={guide.isActive ? 'default' : 'secondary'}
                              className={
                                guide.isActive
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-gray-100 text-gray-800'
                              }
                            >
                              {guide.isActive ? '激活' : '未激活'}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 text-sm text-muted-foreground">
                            {new Date(guide.createdAt).toLocaleDateString('zh-CN')}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex justify-end gap-2">
                              <Link href={`/admin/packing-guides/${guide.id}`}>
                                <Button variant="ghost" size="icon">
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </Link>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  setActivateTarget({
                                    type: 'guide',
                                    id: guide.id,
                                    currentStatus: guide.isActive,
                                  });
                                  setActivateDialogOpen(true);
                                }}
                              >
                                {guide.isActive ? (
                                  <PowerOff className="h-4 w-4" />
                                ) : (
                                  <Power className="h-4 w-4" />
                                )}
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  setDeleteTarget({ type: 'guide', id: guide.id });
                                  setDeleteDialogOpen(true);
                                }}
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

                {/* 分页 */}
                {guidesTotalPages > 1 && (
                  <div className="flex items-center justify-between border-t px-6 py-4">
                    <div className="text-sm text-muted-foreground">
                      共 {guidesTotal} 条记录，第 {guidesParams.page} / {guidesTotalPages} 页
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setGuidesParams((prev) => ({
                            ...prev,
                            page: (prev.page || 1) - 1,
                          }))
                        }
                        disabled={guidesParams.page === 1}
                      >
                        上一页
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setGuidesParams((prev) => ({
                            ...prev,
                            page: (prev.page || 1) + 1,
                          }))
                        }
                        disabled={guidesParams.page === guidesTotalPages}
                      >
                        下一页
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* 删除确认对话框 */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>确认删除</DialogTitle>
            <DialogDescription>
              确定要删除这个{deleteTarget?.type === 'template' ? '模板' : '指南'}吗？此操作将软删除（设置为未激活状态）。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              取消
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (deleteTarget) {
                  if (deleteTarget.type === 'template') {
                    handleDeleteTemplate(deleteTarget.id);
                  } else {
                    handleDeleteGuide(deleteTarget.id);
                  }
                }
              }}
            >
              删除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 激活/停用确认对话框 */}
      <Dialog open={activateDialogOpen} onOpenChange={setActivateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {activateTarget?.currentStatus ? '停用' : '激活'}
            </DialogTitle>
            <DialogDescription>
              确定要{activateTarget?.currentStatus ? '停用' : '激活'}这个
              {activateTarget?.type === 'template' ? '模板' : '指南'}吗？
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setActivateDialogOpen(false)}>
              取消
            </Button>
            <Button
              onClick={() => {
                if (activateTarget) {
                  const newStatus = !activateTarget.currentStatus;
                  if (activateTarget.type === 'template') {
                    handleActivateTemplate(activateTarget.id, newStatus);
                  } else {
                    handleActivateGuide(activateTarget.id, newStatus);
                  }
                }
              }}
            >
              {activateTarget?.currentStatus ? '停用' : '激活'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 批量导入对话框 */}
      <Dialog open={batchImportDialogOpen} onOpenChange={setBatchImportDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>批量导入{batchImportType === 'template' ? '模板' : '指南'}</DialogTitle>
            <DialogDescription>
              请选择 JSON 文件进行批量导入
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <input
              type="file"
              accept=".json"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  setBatchImportFile(file);
                }
              }}
              className="w-full"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBatchImportDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleBatchImport} disabled={!batchImportFile}>
              导入
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
