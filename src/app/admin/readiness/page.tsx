'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Search, Eye, Edit, Trash2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getReadinessPacks, deleteReadinessPack } from '@/services/readiness';
import type { ReadinessPackListItem, GetReadinessPacksParams } from '@/types/api';

export default function ReadinessPacksPage() {
  const [packs, setPacks] = useState<ReadinessPackListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [params, setParams] = useState<GetReadinessPacksParams>({
    page: 1,
    limit: 20,
  });
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadPacks();
  }, [params]);

  async function loadPacks() {
    setLoading(true);
    try {
      const result = await getReadinessPacks(params);
      if (result) {
        setPacks(result.packs);
        setTotal(result.total);
        setTotalPages(result.totalPages);
      }
    } catch (error) {
      console.error('加载Pack列表失败:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(packId: string) {
    if (!confirm('确定要删除这个Pack吗？')) {
      return;
    }

    try {
      const result = await deleteReadinessPack(packId);
      if (result?.deleted) {
        alert('删除成功');
        loadPacks();
      } else {
        alert('删除失败，请重试');
      }
    } catch (error) {
      console.error('删除失败:', error);
      alert('删除失败，请重试');
    }
  }

  function handleSearch() {
    setParams((prev) => ({
      ...prev,
      page: 1,
      search: search || undefined,
    }));
  }

  function handlePageChange(page: number) {
    setParams((prev) => ({ ...prev, page }));
  }

  // 获取本地化显示名称（优先中文）
  function getLocalizedName(pack: ReadinessPackListItem): string {
    return pack.displayNameCN || pack.displayNameEN || pack.displayName || '-';
  }

  // 获取本地化区域/城市
  function getLocalizedLocation(pack: ReadinessPackListItem): string {
    const region = pack.regionCN || pack.regionEN || pack.region;
    const city = pack.cityCN || pack.cityEN || pack.city;
    if (region && city) {
      return `${region} / ${city}`;
    }
    return region || city || '-';
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">准备度Pack管理</h1>
          <p className="text-muted-foreground mt-2">管理旅行准备度Pack</p>
        </div>
        <Link href="/admin/readiness/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            创建Pack
          </Button>
        </Link>
      </div>

      {/* 搜索和筛选 */}
      <div className="flex gap-4 items-center flex-wrap">
        <div className="flex-1 flex gap-2 min-w-[300px]">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="搜索（支持中英文）..."
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
              page: 1,
              countryCode: e.target.value.toUpperCase() || undefined,
            }))
          }
        />
        <select
          className="px-4 py-2 border rounded-md"
          value={params.isActive?.toString() || 'all'}
          onChange={(e) =>
            setParams((prev) => ({
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

      {/* Pack列表 */}
      <div className="rounded-lg border bg-card shadow-sm">
        {loading ? (
          <div className="p-8 text-center text-muted-foreground">加载中...</div>
        ) : packs.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">暂无Pack</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-medium">Pack ID</th>
                    <th className="px-6 py-3 text-left text-sm font-medium">显示名称</th>
                    <th className="px-6 py-3 text-left text-sm font-medium">区域/城市</th>
                    <th className="px-6 py-3 text-left text-sm font-medium">国家</th>
                    <th className="px-6 py-3 text-left text-sm font-medium">版本</th>
                    <th className="px-6 py-3 text-left text-sm font-medium">状态</th>
                    <th className="px-6 py-3 text-right text-sm font-medium">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {packs.map((pack) => (
                    <tr key={pack.id} className="hover:bg-muted/50">
                      <td className="px-6 py-4 text-sm font-mono text-xs">{pack.packId}</td>
                      <td className="px-6 py-4 text-sm">
                        <div>{getLocalizedName(pack)}</div>
                        {pack.displayNameEN && pack.displayNameCN && (
                          <div className="text-xs text-muted-foreground mt-0.5">
                            {pack.displayNameEN}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm">{getLocalizedLocation(pack)}</td>
                      <td className="px-6 py-4 text-sm">{pack.countryCode}</td>
                      <td className="px-6 py-4 text-sm">{pack.version}</td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                            pack.isActive
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {pack.isActive ? '激活' : '未激活'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <Link href={`/admin/readiness/${pack.packId}`}>
                            <Button variant="ghost" size="icon">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Link href={`/admin/readiness/${pack.packId}`}>
                            <Button variant="ghost" size="icon">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(pack.packId)}
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
            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t px-6 py-4">
                <div className="text-sm text-muted-foreground">
                  共 {total} 条记录，第 {params.page} / {totalPages} 页
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(params.page! - 1)}
                    disabled={params.page === 1}
                  >
                    上一页
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(params.page! + 1)}
                    disabled={params.page === totalPages}
                  >
                    下一页
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
