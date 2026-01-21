'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Search, Eye, Download, Calendar, MapPin, Users, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { getTripsAdmin, getTripStats } from '@/services/trips-admin';
import type { TripListItem, GetTripsAdminParams, TripStats } from '@/types/api';

export default function TripsPage() {
  const [trips, setTrips] = useState<TripListItem[]>([]);
  const [stats, setStats] = useState<TripStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [params, setParams] = useState<GetTripsAdminParams>({
    page: 1,
    limit: 20,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadTrips();
    loadStats();
  }, [params]);

  async function loadTrips() {
    setLoading(true);
    try {
      const result = await getTripsAdmin(params);
      if (result) {
        setTrips(result.items);
        setTotal(result.pagination.total);
        setTotalPages(result.pagination.totalPages);
      }
    } catch (error) {
      console.error('加载行程列表失败:', error);
    } finally {
      setLoading(false);
    }
  }

  async function loadStats() {
    try {
      const statsData = await getTripStats();
      if (statsData) {
        setStats(statsData);
      }
    } catch (error) {
      console.error('加载统计信息失败:', error);
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

  function getStatusBadge(status: string) {
    const statusMap: Record<string, { label: string; className: string }> = {
      PLANNING: { label: '规划中', className: 'bg-blue-100 text-blue-800' },
      IN_PROGRESS: { label: '进行中', className: 'bg-green-100 text-green-800' },
      COMPLETED: { label: '已完成', className: 'bg-gray-100 text-gray-800' },
      CANCELLED: { label: '已取消', className: 'bg-red-100 text-red-800' },
    };
    const statusInfo = statusMap[status] || { label: status, className: 'bg-gray-100 text-gray-800' };
    return (
      <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${statusInfo.className}`}>
        {statusInfo.label}
      </span>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">行程管理</h1>
          <p className="text-muted-foreground mt-2">管理系统中的所有行程</p>
        </div>
      </div>

      {/* 统计卡片 */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">总行程数</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.summary.totalTrips}</div>
              <p className="text-xs text-muted-foreground">
                活跃: {stats.summary.activeTrips} | 已完成: {stats.summary.completedTrips}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">规划中</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.summary.planningTrips}</div>
              <p className="text-xs text-muted-foreground">
                占比: {((stats.summary.planningTrips / stats.summary.totalTrips) * 100).toFixed(1)}%
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">平均天数</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.engagement.avgDaysPerTrip.toFixed(1)}</div>
              <p className="text-xs text-muted-foreground">
                平均项目数: {stats.engagement.avgItemsPerTrip.toFixed(1)}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">平均预算</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">¥{stats.budget.avgBudget.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                中位数: ¥{stats.budget.medianBudget.toLocaleString()}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 搜索和筛选 */}
      <Card>
        <CardHeader>
          <CardTitle>筛选条件</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-center flex-wrap">
            <div className="flex-1 flex gap-2 min-w-[300px]">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="搜索目的地、用户邮箱或名称..."
                  className="w-full pl-10 pr-4 py-2 border rounded-md"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
              <Button onClick={handleSearch}>搜索</Button>
            </div>
            <Select
              value={params.status || 'all'}
              onValueChange={(value) =>
                setParams((prev) => ({
                  ...prev,
                  page: 1,
                  status: value === 'all' ? undefined : (value as any),
                }))
              }
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="状态筛选" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部状态</SelectItem>
                <SelectItem value="PLANNING">规划中</SelectItem>
                <SelectItem value="IN_PROGRESS">进行中</SelectItem>
                <SelectItem value="COMPLETED">已完成</SelectItem>
                <SelectItem value="CANCELLED">已取消</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={params.sortBy || 'createdAt'}
              onValueChange={(value) =>
                setParams((prev) => ({
                  ...prev,
                  sortBy: value as any,
                }))
              }
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="排序字段" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="createdAt">创建时间</SelectItem>
                <SelectItem value="updatedAt">更新时间</SelectItem>
                <SelectItem value="startDate">开始日期</SelectItem>
                <SelectItem value="endDate">结束日期</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={params.sortOrder || 'desc'}
              onValueChange={(value) =>
                setParams((prev) => ({
                  ...prev,
                  sortOrder: value as 'asc' | 'desc',
                }))
              }
            >
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="排序方向" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="desc">降序</SelectItem>
                <SelectItem value="asc">升序</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* 行程列表 */}
      <Card>
        <CardHeader>
          <CardTitle>行程列表</CardTitle>
          <CardDescription>共 {total} 条记录</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="p-8 text-center text-muted-foreground">加载中...</div>
          ) : trips.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">暂无行程</div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>目的地</TableHead>
                    <TableHead>开始日期</TableHead>
                    <TableHead>结束日期</TableHead>
                    <TableHead>状态</TableHead>
                    <TableHead>天数</TableHead>
                    <TableHead>用户</TableHead>
                    <TableHead>预算</TableHead>
                    <TableHead>统计</TableHead>
                    <TableHead className="text-right">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {trips.map((trip) => (
                    <TableRow key={trip.id}>
                      <TableCell className="font-mono text-xs">{trip.id.slice(0, 8)}...</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          {trip.destination}
                        </div>
                      </TableCell>
                      <TableCell>
                        {new Date(trip.startDate).toLocaleDateString('zh-CN')}
                      </TableCell>
                      <TableCell>
                        {new Date(trip.endDate).toLocaleDateString('zh-CN')}
                      </TableCell>
                      <TableCell>{getStatusBadge(trip.status)}</TableCell>
                      <TableCell>{trip.durationDays} 天</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="text-sm">{trip.owner?.displayName || trip.owner?.email || '-'}</span>
                          {trip.owner?.email && (
                            <span className="text-xs text-muted-foreground">{trip.owner.email}</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="text-sm">
                            {trip.budgetConfig.currency} {trip.budgetConfig.totalBudget.toLocaleString()}
                          </span>
                          {trip.budgetConfig.daily_budget && (
                            <span className="text-xs text-muted-foreground">
                              日均: {trip.budgetConfig.daily_budget.toLocaleString()}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col text-xs">
                          <span>项目: {trip.stats.itemsCount}</span>
                          <span>协作: {trip.stats.collaboratorsCount}</span>
                          <span>点赞: {trip.stats.likesCount}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Link href={`/admin/trips/${trip.id}`}>
                            <Button variant="ghost" size="icon">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* 分页 */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between border-t px-6 py-4 mt-4">
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
        </CardContent>
      </Card>
    </div>
  );
}
