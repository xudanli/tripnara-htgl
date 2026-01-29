'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Search, Eye, Edit, Trash2, MapPin, Copy, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getPlaces, deletePlace, createPlace } from '@/services/places';
import type { PlaceListItem, GetPlacesParams, PlaceCategory, CreatePlaceDto } from '@/types/api';
import DeepSeekAssistant from '@/components/places/DeepSeekAssistant';
import { useRouter } from 'next/navigation';

const categoryLabels: Record<PlaceCategory, string> = {
  ATTRACTION: '景点',
  RESTAURANT: '餐厅',
  SHOPPING: '购物',
  HOTEL: '酒店',
  TRANSIT_HUB: '交通枢纽',
};

const categoryColors: Record<PlaceCategory, string> = {
  ATTRACTION: 'bg-blue-100 text-blue-800',
  RESTAURANT: 'bg-orange-100 text-orange-800',
  SHOPPING: 'bg-purple-100 text-purple-800',
  HOTEL: 'bg-green-100 text-green-800',
  TRANSIT_HUB: 'bg-gray-100 text-gray-800',
};

export default function PlacesPage() {
  const router = useRouter();
  const [places, setPlaces] = useState<PlaceListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [params, setParams] = useState<GetPlacesParams>({
    page: 1,
    limit: 20,
  });
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [search, setSearch] = useState('');
  const [jumpPage, setJumpPage] = useState('');

  useEffect(() => {
    loadPlaces();
  }, [params]);

  async function loadPlaces() {
    setLoading(true);
    try {
      const result = await getPlaces(params);
      if (result) {
        setPlaces(result.places);
        setTotal(result.total);
        setTotalPages(result.totalPages);
      }
    } catch (error) {
      console.error('加载地点列表失败:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(placeId: number) {
    if (!confirm('确定要删除这个地点吗？')) {
      return;
    }

    try {
      const result = await deletePlace(placeId);
      if (result) {
        alert('删除成功');
        loadPlaces();
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
    if (page >= 1 && page <= totalPages) {
      setParams((prev) => ({ ...prev, page }));
    }
  }

  function handleJumpToPage() {
    const page = Number(jumpPage);
    if (page >= 1 && page <= totalPages) {
      handlePageChange(page);
      setJumpPage('');
    } else {
      alert(`请输入有效的页码（1-${totalPages}）`);
    }
  }

  // 生成页码数组
  function getPageNumbers(): (number | string)[] {
    const current = params.page || 1;
    const total = totalPages;
    const pages: (number | string)[] = [];

    if (total <= 7) {
      // 如果总页数少于等于7，显示所有页码
      for (let i = 1; i <= total; i++) {
        pages.push(i);
      }
    } else {
      // 总页数大于7，使用省略号
      if (current <= 3) {
        // 当前页在前3页
        for (let i = 1; i <= 5; i++) {
          pages.push(i);
        }
        pages.push('ellipsis');
        pages.push(total);
      } else if (current >= total - 2) {
        // 当前页在后3页
        pages.push(1);
        pages.push('ellipsis');
        for (let i = total - 4; i <= total; i++) {
          pages.push(i);
        }
      } else {
        // 当前页在中间
        pages.push(1);
        pages.push('ellipsis');
        for (let i = current - 1; i <= current + 1; i++) {
          pages.push(i);
        }
        pages.push('ellipsis');
        pages.push(total);
      }
    }

    return pages;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">地点/POI管理</h1>
          <p className="text-muted-foreground mt-2">管理系统中的所有地点</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => router.push('/admin/places/new')}>
            <Plus className="mr-2 h-4 w-4" />
            新增地点
          </Button>
          <Link href="/admin/places/duplicates">
            <Button variant="outline">
              <Copy className="mr-2 h-4 w-4" />
              检测重复地点
            </Button>
          </Link>
        </div>
      </div>

      {/* 搜索和筛选 */}
      <div className="flex gap-4 items-center flex-wrap">
        <div className="flex-1 flex gap-2 min-w-[300px]">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="搜索地点名称或地址..."
              className="w-full pl-10 pr-4 py-2 border rounded-md"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <Button onClick={handleSearch}>搜索</Button>
        </div>
        <select
          className="px-4 py-2 border rounded-md"
          value={params.category || 'all'}
          onChange={(e) =>
            setParams((prev) => ({
              ...prev,
              page: 1,
              category: e.target.value === 'all' ? undefined : (e.target.value as PlaceCategory),
            }))
          }
        >
          <option value="all">全部类别</option>
          <option value="ATTRACTION">景点</option>
          <option value="RESTAURANT">餐厅</option>
          <option value="SHOPPING">购物</option>
          <option value="HOTEL">酒店</option>
          <option value="TRANSIT_HUB">交通枢纽</option>
        </select>
        <input
          type="text"
          placeholder="国家代码 (如: JP, CN)"
          className="px-4 py-2 border rounded-md w-32"
          value={params.countryCode || ''}
          onChange={(e) =>
            setParams((prev) => ({
              ...prev,
              page: 1,
              countryCode: e.target.value || undefined,
            }))
          }
        />
        <input
          type="number"
          placeholder="城市ID"
          className="px-4 py-2 border rounded-md w-32"
          value={params.cityId || ''}
          onChange={(e) =>
            setParams((prev) => ({
              ...prev,
              page: 1,
              cityId: e.target.value ? Number(e.target.value) : undefined,
            }))
          }
        />
      </div>

      {/* 地点列表 */}
      <div className="rounded-lg border bg-card shadow-sm">
        {loading ? (
          <div className="p-8 text-center text-muted-foreground">加载中...</div>
        ) : places.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">暂无地点</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-medium">ID</th>
                    <th className="px-6 py-3 text-left text-sm font-medium">名称</th>
                    <th className="px-6 py-3 text-left text-sm font-medium">类别</th>
                    <th className="px-6 py-3 text-left text-sm font-medium">城市</th>
                    <th className="px-6 py-3 text-left text-sm font-medium">评分</th>
                    <th className="px-6 py-3 text-left text-sm font-medium">地址</th>
                    <th className="px-6 py-3 text-right text-sm font-medium">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {places.map((place) => (
                    <tr key={place.id} className="hover:bg-muted/50">
                      <td className="px-6 py-4 text-sm font-mono">{place.id}</td>
                      <td className="px-6 py-4 text-sm">
                        <div>
                          <div className="font-medium">{place.nameCN}</div>
                          {place.nameEN && (
                            <div className="text-xs text-muted-foreground">{place.nameEN}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <Badge
                          className={categoryColors[place.category] || 'bg-gray-100 text-gray-800'}
                        >
                          {categoryLabels[place.category] || place.category}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {place.city ? (
                          <div>
                            <div>{place.city.nameCN || place.city.name}</div>
                            <div className="text-xs text-muted-foreground">
                              {place.countryCode || place.city.countryCode}
                            </div>
                          </div>
                        ) : place.countryCode ? (
                          <div className="text-xs text-muted-foreground">{place.countryCode}</div>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {place.rating !== undefined && place.rating !== null ? (
                          <div className="flex items-center gap-1">
                            <span>{place.rating.toFixed(1)}</span>
                            <span className="text-yellow-500">★</span>
                          </div>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="max-w-xs truncate">{place.address || '-'}</div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <Link href={`/admin/places/${place.id}`}>
                            <Button variant="ghost" size="icon">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Link href={`/admin/places/${place.id}`}>
                            <Button variant="ghost" size="icon">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(place.id)}
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
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(1)}
                    disabled={params.page === 1}
                  >
                    首页
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(params.page! - 1)}
                    disabled={params.page === 1}
                  >
                    上一页
                  </Button>
                  
                  {/* 页码按钮 */}
                  <div className="flex items-center gap-1">
                    {getPageNumbers().map((page, index) => {
                      if (page === 'ellipsis') {
                        return (
                          <span key={`ellipsis-${index}`} className="px-2 text-muted-foreground">
                            ...
                          </span>
                        );
                      }
                      const pageNum = page as number;
                      return (
                        <Button
                          key={pageNum}
                          variant={params.page === pageNum ? 'default' : 'outline'}
                          size="sm"
                          className="min-w-[36px]"
                          onClick={() => handlePageChange(pageNum)}
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(params.page! + 1)}
                    disabled={params.page === totalPages}
                  >
                    下一页
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(totalPages)}
                    disabled={params.page === totalPages}
                  >
                    末页
                  </Button>

                  {/* 跳转输入 */}
                  <div className="flex items-center gap-2 ml-4">
                    <span className="text-sm text-muted-foreground">跳转到</span>
                    <input
                      type="number"
                      min="1"
                      max={totalPages}
                      value={jumpPage}
                      onChange={(e) => setJumpPage(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleJumpToPage();
                        }
                      }}
                      className="w-16 px-2 py-1 text-sm border rounded-md text-center"
                      placeholder="页码"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleJumpToPage}
                    >
                      跳转
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* DeepSeek 对话助手 */}
      <DeepSeekAssistant
        places={places}
        onRefresh={loadPlaces}
      />
    </div>
  );
}
