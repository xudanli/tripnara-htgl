'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Calendar, MapPin, Users, DollarSign, TrendingUp, Download, Loader2, Trash2, Edit, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { getTripDetail, exportTripData, batchOperation } from '@/services/trips-admin';
import type { TripDetail } from '@/types/api';
import Link from 'next/link';

export default function TripDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [trip, setTrip] = useState<TripDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadTripDetail();
  }, [id]);

  async function loadTripDetail() {
    setLoading(true);
    try {
      const result = await getTripDetail(id);
      if (result) {
        setTrip(result);
      }
    } catch (error) {
      console.error('加载行程详情失败:', error);
    } finally {
      setLoading(false);
    }
  }

  // 导出行程数据
  async function handleExport(format: 'json' | 'csv' = 'json') {
    setExporting(true);
    try {
      if (format === 'json') {
        // JSON 格式：直接导出当前行程数据
        const dataStr = JSON.stringify(trip, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `trip-${id}-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      } else {
        // CSV 格式：尝试调用 API，如果失败则提示
        const blob = await exportTripData(id, format);
        if (blob) {
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `trip-${id}-${new Date().toISOString().split('T')[0]}.csv`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);
        } else {
          alert('CSV 导出功能暂未实现，请使用 JSON 格式');
        }
      }
    } catch (error) {
      console.error('导出失败:', error);
      alert('导出失败: ' + (error instanceof Error ? error.message : '未知错误'));
    } finally {
      setExporting(false);
    }
  }

  // 删除行程
  async function handleDelete() {
    if (!confirm('确定要删除这个行程吗？此操作不可恢复。')) {
      return;
    }
    setDeleting(true);
    try {
      const result = await batchOperation({
        action: 'DELETE',
        tripIds: [id],
      });
      if (result && result.success) {
        alert('删除成功');
        router.push('/admin/trips');
      } else {
        alert('删除失败');
      }
    } catch (error) {
      console.error('删除失败:', error);
      alert('删除失败: ' + (error instanceof Error ? error.message : '未知错误'));
    } finally {
      setDeleting(false);
    }
  }

  // 更新状态
  async function handleUpdateStatus(newStatus: string) {
    if (!confirm(`确定要将行程状态更新为 ${newStatus} 吗？`)) {
      return;
    }
    try {
      const result = await batchOperation({
        action: 'UPDATE_STATUS',
        tripIds: [id],
        status: newStatus as any,
      });
      if (result && result.success) {
        alert('更新成功');
        loadTripDetail();
      } else {
        alert('更新失败');
      }
    } catch (error) {
      console.error('更新状态失败:', error);
      alert('更新状态失败: ' + (error instanceof Error ? error.message : '未知错误'));
    }
  }

  function getStatusBadge(status: string) {
    const statusMap: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
      PLANNING: { label: '规划中', variant: 'secondary' },
      IN_PROGRESS: { label: '进行中', variant: 'default' },
      COMPLETED: { label: '已完成', variant: 'outline' },
      CANCELLED: { label: '已取消', variant: 'destructive' },
    };
    const statusInfo = statusMap[status] || { label: status, variant: 'outline' as const };
    return (
      <Badge variant={statusInfo.variant}>
        {statusInfo.label}
      </Badge>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="space-y-6">
        <div className="p-8 text-center text-muted-foreground">行程不存在</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 头部 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">行程详情</h1>
            <p className="text-muted-foreground mt-2">ID: {trip.id}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => handleExport('json')}
            disabled={exporting}
          >
            {exporting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                导出中...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                导出 JSON
              </>
            )}
          </Button>
          <Button
            variant="outline"
            onClick={() => handleExport('csv')}
            disabled={exporting}
          >
            {exporting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                导出中...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                导出 CSV
              </>
            )}
          </Button>
          <Button
            variant="outline"
            onClick={loadTripDetail}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            刷新
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                删除中...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4 mr-2" />
                删除
              </>
            )}
          </Button>
        </div>
      </div>

      {/* 基本信息 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">状态</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {getStatusBadge(trip.status)}
              {trip.status !== 'COMPLETED' && trip.status !== 'CANCELLED' && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    const newStatus = trip.status === 'PLANNING' ? 'IN_PROGRESS' : 'COMPLETED';
                    handleUpdateStatus(newStatus);
                  }}
                >
                  <Edit className="h-3 w-3" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">目的地</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{trip.destination}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">行程天数</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{trip.durationDays} 天</div>
            <p className="text-xs text-muted-foreground mt-1">
              {new Date(trip.startDate).toLocaleDateString('zh-CN')} - {new Date(trip.endDate).toLocaleDateString('zh-CN')}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">预算</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {trip.budgetConfig.currency} {trip.budgetConfig.totalBudget.toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 详细信息 */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">概览</TabsTrigger>
          <TabsTrigger value="days">行程安排</TabsTrigger>
          <TabsTrigger value="collaborators">协作者</TabsTrigger>
          <TabsTrigger value="social">社交数据</TabsTrigger>
          <TabsTrigger value="logs">决策日志</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>基本信息</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">创建时间</p>
                  <p className="text-sm font-medium">
                    {new Date(trip.createdAt).toLocaleString('zh-CN')}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">更新时间</p>
                  <p className="text-sm font-medium">
                    {new Date(trip.updatedAt).toLocaleString('zh-CN')}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">节奏配置</p>
                  <p className="text-sm font-medium">
                    {trip.pacingConfig.level} - 每日最多 {trip.pacingConfig.maxDailyActivities} 项活动
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">所有者</p>
                  <p className="text-sm font-medium">
                    {trip.owner?.displayName || trip.owner?.email || '-'}
                  </p>
                  {trip.owner?.email && (
                    <p className="text-xs text-muted-foreground">{trip.owner.email}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>统计数据</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">天数</p>
                  <p className="text-2xl font-bold">{trip.stats.daysCount}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">项目数</p>
                  <p className="text-2xl font-bold">{trip.stats.itemsCount}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">协作者</p>
                  <p className="text-2xl font-bold">{trip.stats.collaboratorsCount}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">点赞</p>
                  <p className="text-2xl font-bold">{trip.stats.likesCount}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">收藏</p>
                  <p className="text-2xl font-bold">{trip.stats.collectionsCount}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">分享</p>
                  <p className="text-2xl font-bold">{trip.stats.sharesCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="days" className="space-y-4">
          {trip.days && trip.days.length > 0 ? (
            trip.days.map((day, index) => (
              <Card key={day.id}>
                <CardHeader>
                  <CardTitle>
                    第 {index + 1} 天 - {new Date(day.date).toLocaleDateString('zh-CN')}
                  </CardTitle>
                  <CardDescription>{day.itemsCount} 个项目</CardDescription>
                </CardHeader>
                <CardContent>
                  {day.items && day.items.length > 0 ? (
                    <div className="space-y-2">
                      {day.items.map((item) => (
                        <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <p className="font-medium">
                              {item.place?.nameCN || item.place?.nameEN || '未命名地点'}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(item.startTime).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })} - {new Date(item.endTime).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
                            </p>
                            {item.place && (
                              <p className="text-xs text-muted-foreground mt-1">
                                类型: {item.type} | 分类: {item.place.category}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">暂无项目</p>
                  )}
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                暂无行程安排
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="collaborators" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>协作者列表</CardTitle>
              <CardDescription>共 {trip.stats.collaboratorsCount} 位协作者</CardDescription>
            </CardHeader>
            <CardContent>
              {trip.collaborators && trip.collaborators.length > 0 ? (
                <div className="space-y-2">
                  {trip.collaborators.map((collab) => (
                    <div key={collab.userId} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{collab.displayName || collab.email}</p>
                        <p className="text-sm text-muted-foreground">{collab.email}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          角色: {collab.role} | 加入时间: {new Date(collab.createdAt).toLocaleDateString('zh-CN')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">暂无协作者</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="social" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>点赞 ({trip.social?.likes?.length || 0})</CardTitle>
              </CardHeader>
              <CardContent>
                {trip.social?.likes && trip.social.likes.length > 0 ? (
                  <div className="space-y-2">
                    {trip.social.likes.map((like, index) => (
                      <div key={index} className="text-sm">
                        <p>{like.email}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(like.createdAt).toLocaleDateString('zh-CN')}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">暂无点赞</p>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>收藏 ({trip.social?.collections?.length || 0})</CardTitle>
              </CardHeader>
              <CardContent>
                {trip.social?.collections && trip.social.collections.length > 0 ? (
                  <div className="space-y-2">
                    {trip.social.collections.map((collection, index) => (
                      <div key={index} className="text-sm">
                        <p>{collection.email}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(collection.createdAt).toLocaleDateString('zh-CN')}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">暂无收藏</p>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>分享 ({trip.social?.shares?.length || 0})</CardTitle>
              </CardHeader>
              <CardContent>
                {trip.social?.shares && trip.social.shares.length > 0 ? (
                  <div className="space-y-2">
                    {trip.social.shares.map((share) => (
                      <div key={share.id} className="text-sm">
                        <p className="font-mono text-xs">{share.shareToken}</p>
                        <p className="text-xs text-muted-foreground">
                          权限: {share.permission} | 过期: {new Date(share.expiresAt).toLocaleDateString('zh-CN')}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">暂无分享</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>决策日志</CardTitle>
                  <CardDescription>共 {trip.decisionLogs?.total || 0} 条日志</CardDescription>
                </div>
                {trip.decisionLogs && trip.decisionLogs.total > 0 && (
                  <Link href={`/admin/decision?tripId=${trip.id}`}>
                    <Button variant="outline" size="sm">
                      查看全部
                    </Button>
                  </Link>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {trip.decisionLogs?.recent && trip.decisionLogs.recent.length > 0 ? (
                <div className="space-y-2">
                  {trip.decisionLogs.recent.map((log) => (
                    <Link key={log.id} href={`/admin/decision/${log.id}`}>
                      <div className="p-3 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{log.summary}</p>
                            <p className="text-sm text-muted-foreground mt-1">
                              来源: {log.source} | 类型: {log.decisionType}
                            </p>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {new Date(log.timestamp).toLocaleString('zh-CN')}
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">暂无决策日志</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
