'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  getAgentRuns,
  getAgentRunsStats,
  getAgentPerformance,
  cancelAgentRun,
} from '@/services/agent-runs';
import type {
  GetAgentRunsParams,
  TripRunItem,
  AgentRunsStats,
  AgentPerformance,
} from '@/types/api';
import { Loader2, Eye, XCircle, BarChart3, Gauge, FileText } from 'lucide-react';

// Status 选项
const STATUS_OPTIONS = [
  { value: 'IN_PROGRESS', label: '进行中' },
  { value: 'COMPLETED', label: '已完成' },
  { value: 'FAILED', label: '失败' },
];

export default function AgentRunsPage() {
  // 运行列表
  const [runs, setRuns] = useState<TripRunItem[]>([]);
  const [runsLoading, setRunsLoading] = useState(false);
  const [runsParams, setRunsParams] = useState<GetAgentRunsParams>({
    page: 1,
    limit: 20,
  });
  const [runsTotal, setRunsTotal] = useState(0);
  const [runsTotalPages, setRunsTotalPages] = useState(0);

  // 统计信息
  const [stats, setStats] = useState<AgentRunsStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);

  // 性能分析
  const [performance, setPerformance] = useState<AgentPerformance | null>(null);
  const [performanceLoading, setPerformanceLoading] = useState(false);

  // 加载运行列表
  async function loadRuns() {
    setRunsLoading(true);
    try {
      const result = await getAgentRuns(runsParams);
      if (result) {
        setRuns(result.items);
        setRunsTotal(result.pagination.total);
        setRunsTotalPages(result.pagination.totalPages);
      }
    } catch (error) {
      console.error('加载运行列表失败:', error);
    } finally {
      setRunsLoading(false);
    }
  }

  // 获取统计信息
  async function handleGetStats() {
    setStatsLoading(true);
    try {
      const result = await getAgentRunsStats();
      if (result) {
        setStats(result);
      }
    } catch (error) {
      console.error('获取统计失败:', error);
    } finally {
      setStatsLoading(false);
    }
  }

  // 获取性能分析
  async function handleGetPerformance() {
    setPerformanceLoading(true);
    try {
      const result = await getAgentPerformance();
      if (result) {
        setPerformance(result);
      }
    } catch (error) {
      console.error('获取性能分析失败:', error);
    } finally {
      setPerformanceLoading(false);
    }
  }

  // 取消运行
  async function handleCancel(id: string) {
    if (!confirm('确定要取消这个运行吗？')) {
      return;
    }
    try {
      const success = await cancelAgentRun(id);
      if (success) {
        alert('取消成功');
        loadRuns();
      } else {
        alert('取消失败');
      }
    } catch (error) {
      console.error('取消运行失败:', error);
      alert('取消失败: ' + (error instanceof Error ? error.message : '未知错误'));
    }
  }

  useEffect(() => {
    loadRuns();
  }, [runsParams.page, runsParams.limit]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Agent 运行管理</h1>
        <p className="text-muted-foreground mt-2">查看和管理 Agent 运行记录</p>
      </div>

      <Tabs defaultValue="runs" className="space-y-4">
        <TabsList>
          <TabsTrigger value="runs">
            <FileText className="mr-2 h-4 w-4" />
            运行列表
          </TabsTrigger>
          <TabsTrigger value="stats">
            <BarChart3 className="mr-2 h-4 w-4" />
            统计信息
          </TabsTrigger>
          <TabsTrigger value="performance">
            <Gauge className="mr-2 h-4 w-4" />
            性能分析
          </TabsTrigger>
        </TabsList>

        {/* 运行列表 */}
        <TabsContent value="runs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Agent 运行列表</CardTitle>
              <CardDescription>查看历史运行记录</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* 筛选 */}
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="filterTripId">Trip ID</Label>
                  <Input
                    id="filterTripId"
                    value={runsParams.tripId || ''}
                    onChange={(e) =>
                      setRunsParams({ ...runsParams, page: 1, tripId: e.target.value || undefined })
                    }
                    placeholder="trip-uuid"
                  />
                </div>
                <div>
                  <Label htmlFor="filterUserId">User ID</Label>
                  <Input
                    id="filterUserId"
                    value={runsParams.userId || ''}
                    onChange={(e) =>
                      setRunsParams({ ...runsParams, page: 1, userId: e.target.value || undefined })
                    }
                    placeholder="user-uuid"
                  />
                </div>
                <div>
                  <Label htmlFor="filterStatus">Status</Label>
                  <Select
                    value={runsParams.status || undefined}
                    onValueChange={(value) =>
                      setRunsParams({ ...runsParams, page: 1, status: value as any })
                    }
                  >
                    <SelectTrigger id="filterStatus">
                      <SelectValue placeholder="全部" />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUS_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="filterPhase">Planning Phase</Label>
                  <Input
                    id="filterPhase"
                    value={runsParams.planningPhase || ''}
                    onChange={(e) =>
                      setRunsParams({ ...runsParams, page: 1, planningPhase: e.target.value || undefined })
                    }
                    placeholder="planning"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={loadRuns} disabled={runsLoading}>
                  {runsLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      加载中...
                    </>
                  ) : (
                    '搜索'
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* 列表 */}
          {runsLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : runs.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                暂无数据
              </CardContent>
            </Card>
          ) : (
            <>
              <Card>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="border-b">
                        <tr>
                          <th className="px-4 py-3 text-left text-sm font-medium">ID</th>
                          <th className="px-4 py-3 text-left text-sm font-medium">Trip ID</th>
                          <th className="px-4 py-3 text-left text-sm font-medium">User ID</th>
                          <th className="px-4 py-3 text-left text-sm font-medium">User Query</th>
                          <th className="px-4 py-3 text-left text-sm font-medium">Phase</th>
                          <th className="px-4 py-3 text-left text-sm font-medium">Agent</th>
                          <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
                          <th className="px-4 py-3 text-left text-sm font-medium">Duration</th>
                          <th className="px-4 py-3 text-left text-sm font-medium">创建时间</th>
                          <th className="px-4 py-3 text-left text-sm font-medium">操作</th>
                        </tr>
                      </thead>
                      <tbody>
                        {runs.map((run) => (
                          <tr key={run.id} className="border-b hover:bg-muted/50">
                            <td className="px-4 py-3 text-sm font-mono">{run.id.slice(0, 8)}...</td>
                            <td className="px-4 py-3 text-sm">{run.tripId?.slice(0, 8) || '-'}...</td>
                            <td className="px-4 py-3 text-sm">{run.userId?.slice(0, 8) || '-'}...</td>
                            <td className="px-4 py-3 text-sm max-w-xs truncate" title={run.userQuery}>
                              {run.userQuery}
                            </td>
                            <td className="px-4 py-3 text-sm">
                              <Badge variant="outline">{run.planningPhase}</Badge>
                            </td>
                            <td className="px-4 py-3 text-sm">
                              <Badge variant="outline">{run.currentAgent}</Badge>
                            </td>
                            <td className="px-4 py-3 text-sm">
                              <Badge
                                variant={
                                  run.status === 'COMPLETED'
                                    ? 'default'
                                    : run.status === 'FAILED'
                                    ? 'destructive'
                                    : 'secondary'
                                }
                              >
                                {run.status === 'IN_PROGRESS' ? '进行中' : run.status === 'COMPLETED' ? '已完成' : '失败'}
                              </Badge>
                            </td>
                            <td className="px-4 py-3 text-sm">
                              {run.duration ? `${run.duration}s` : '-'}
                            </td>
                            <td className="px-4 py-3 text-sm">
                              {new Date(run.createdAt).toLocaleString('zh-CN')}
                            </td>
                            <td className="px-4 py-3 text-sm">
                              <div className="flex gap-2">
                                <Link href={`/admin/agent-runs/${run.id}`}>
                                  <Button variant="ghost" size="sm">
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                </Link>
                                {run.status === 'IN_PROGRESS' && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleCancel(run.id)}
                                  >
                                    <XCircle className="h-4 w-4 text-destructive" />
                                  </Button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              {/* 分页 */}
              {runsTotalPages > 1 && (
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    共 {runsTotal} 条，第 {runsParams.page || 1} / {runsTotalPages} 页
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setRunsParams({ ...runsParams, page: (runsParams.page || 1) - 1 })
                      }
                      disabled={(runsParams.page || 1) <= 1}
                    >
                      上一页
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setRunsParams({ ...runsParams, page: (runsParams.page || 1) + 1 })
                      }
                      disabled={(runsParams.page || 1) >= runsTotalPages}
                    >
                      下一页
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </TabsContent>

        {/* 统计信息 */}
        <TabsContent value="stats" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>运行统计</CardTitle>
              <CardDescription>查看 Agent 运行统计信息</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button onClick={handleGetStats} disabled={statsLoading}>
                {statsLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    加载中...
                  </>
                ) : (
                  <>
                    <BarChart3 className="mr-2 h-4 w-4" />
                    刷新统计
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {stats && (
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>总体统计</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="text-sm">
                    <div>总运行数: {stats.summary.totalRuns}</div>
                    <div>已完成: {stats.summary.completedRuns}</div>
                    <div>失败: {stats.summary.failedRuns}</div>
                    <div>进行中: {stats.summary.inProgressRuns}</div>
                    <div>成功率: {(stats.summary.successRate * 100).toFixed(1)}%</div>
                    <div>平均耗时: {stats.summary.avgDuration}s</div>
                  </div>
                </CardContent>
              </Card>

              {stats.byStatus && stats.byStatus.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>按状态分布</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {stats.byStatus.map((item, idx) => (
                        <div key={idx} className="p-3 border rounded-md">
                          <div className="flex justify-between items-center">
                            <Badge>{item.status}</Badge>
                            <div className="text-sm">
                              {item.count} ({item.percentage.toFixed(1)}%)
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {stats.byPhase && stats.byPhase.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>按阶段分布</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {stats.byPhase.map((item, idx) => (
                        <div key={idx} className="p-3 border rounded-md">
                          <div className="flex justify-between items-center">
                            <Badge variant="outline">{item.phase}</Badge>
                            <div className="text-sm">
                              {item.count} ({item.percentage.toFixed(1)}%)
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </TabsContent>

        {/* 性能分析 */}
        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>性能分析</CardTitle>
              <CardDescription>查看 Agent 运行性能指标</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button onClick={handleGetPerformance} disabled={performanceLoading}>
                {performanceLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    加载中...
                  </>
                ) : (
                  <>
                    <Gauge className="mr-2 h-4 w-4" />
                    刷新性能数据
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {performance && (
            <Card>
              <CardHeader>
                <CardTitle>性能指标</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="text-sm">
                      <div>平均耗时: {performance.avgDuration}s</div>
                      <div>P50: {performance.p50Duration}s</div>
                      <div>P95: {performance.p95Duration}s</div>
                      <div>P99: {performance.p99Duration}s</div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm">
                      <div>最小耗时: {performance.minDuration}s</div>
                      <div>最大耗时: {performance.maxDuration}s</div>
                      <div>总运行数: {performance.totalRuns}</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
