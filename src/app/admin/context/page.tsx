'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  getContextMetrics,
  getContextPackages,
  getContextPackageDetail,
  getContextAnalytics,
} from '@/services/context';
import type {
  ContextMetrics,
  ContextPackageDetail,
  ContextPackageItem,
  ContextAnalytics,
} from '@/types/api';
import { Loader2, BarChart3, Package, Eye, Search, Calendar } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Phase 枚举值
const PHASE_OPTIONS = [
  { value: 'planning', label: 'Planning' },
  { value: 'execution', label: 'Execution' },
  { value: 'review', label: 'Review' },
];

// Agent 枚举值
const AGENT_OPTIONS = [
  { value: 'PLANNER', label: 'PLANNER' },
  { value: 'GATEKEEPER', label: 'GATEKEEPER' },
  { value: 'CORE_DECISION', label: 'CORE_DECISION' },
];

export default function ContextPage() {
  // 指标统计
  const [metrics, setMetrics] = useState<ContextMetrics | null>(null);
  const [metricsLoading, setMetricsLoading] = useState(false);
  const [metricsParams, setMetricsParams] = useState({
    tripId: '',
    phase: '',
    agent: '',
    startTime: '',
    endTime: '',
  });

  // Package 列表
  const [packages, setPackages] = useState<ContextPackageItem[]>([]);
  const [packagesLoading, setPackagesLoading] = useState(false);
  const [packagesParams, setPackagesParams] = useState({
    page: 1,
    limit: 20,
    tripId: '',
    phase: '',
    agent: '',
    search: '',
  });
  const [packagesTotal, setPackagesTotal] = useState(0);
  const [packagesTotalPages, setPackagesTotalPages] = useState(0);

  // 分析报告
  const [analytics, setAnalytics] = useState<ContextAnalytics | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [analyticsParams, setAnalyticsParams] = useState({
    startTime: '',
    endTime: '',
    granularity: 'day' as 'hour' | 'day' | 'week' | 'month',
  });

  // 获取指标统计
  async function handleGetMetrics() {
    setMetricsLoading(true);
    try {
      const params: any = {};
      if (metricsParams.tripId) params.tripId = metricsParams.tripId;
      if (metricsParams.phase) params.phase = metricsParams.phase;
      if (metricsParams.agent) params.agent = metricsParams.agent;
      if (metricsParams.startTime) params.startTime = metricsParams.startTime;
      if (metricsParams.endTime) params.endTime = metricsParams.endTime;

      const result = await getContextMetrics(params);
      if (result) {
        setMetrics(result);
      }
    } catch (error) {
      console.error('获取指标失败:', error);
      alert('获取指标失败: ' + (error instanceof Error ? error.message : '未知错误'));
    } finally {
      setMetricsLoading(false);
    }
  }

  // 获取 Package 列表
  async function loadPackages() {
    setPackagesLoading(true);
    try {
      const result = await getContextPackages({
        page: packagesParams.page,
        limit: packagesParams.limit,
        tripId: packagesParams.tripId || undefined,
        phase: packagesParams.phase || undefined,
        agent: packagesParams.agent || undefined,
      });
      if (result) {
        setPackages(result.items || []);
        setPackagesTotal(result.pagination?.total || 0);
        setPackagesTotalPages(result.pagination?.totalPages || 0);
      } else {
        // 如果 result 为 null，确保 packages 仍然是数组
        setPackages([]);
        setPackagesTotal(0);
        setPackagesTotalPages(0);
      }
    } catch (error) {
      console.error('加载 Package 列表失败:', error);
      // 发生错误时，确保 packages 仍然是数组
      setPackages([]);
      setPackagesTotal(0);
      setPackagesTotalPages(0);
    } finally {
      setPackagesLoading(false);
    }
  }

  // 获取分析报告
  async function handleGetAnalytics() {
    setAnalyticsLoading(true);
    try {
      const params: any = {};
      if (analyticsParams.startTime) params.startDate = analyticsParams.startTime;
      if (analyticsParams.endTime) params.endDate = analyticsParams.endTime;
      if (analyticsParams.granularity) params.groupBy = analyticsParams.granularity;

      const result = await getContextAnalytics(params);
      if (result) {
        setAnalytics(result);
      }
    } catch (error) {
      console.error('获取分析报告失败:', error);
      alert('获取分析报告失败: ' + (error instanceof Error ? error.message : '未知错误'));
    } finally {
      setAnalyticsLoading(false);
    }
    // setAnalyticsLoading(true);
    // try {
    //   const params: any = {};
    //   if (analyticsParams.startTime) params.startTime = analyticsParams.startTime;
    //   if (analyticsParams.endTime) params.endTime = analyticsParams.endTime;
    //   if (analyticsParams.granularity) params.granularity = analyticsParams.granularity;
    //   // TODO: 实现分析报告接口
    // } catch (error) {
    //   console.error('获取分析报告失败:', error);
    //   alert('获取分析报告失败: ' + (error instanceof Error ? error.message : '未知错误'));
    // } finally {
    //   setAnalyticsLoading(false);
    // }
  }

  useEffect(() => {
    loadPackages();
  }, [packagesParams.page, packagesParams.limit]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Context 管理</h1>
        <p className="text-muted-foreground mt-2">查看和管理 Context Package 的使用情况</p>
      </div>

      <Tabs defaultValue="packages" className="space-y-4">
        <TabsList>
          <TabsTrigger value="packages">
            <Package className="mr-2 h-4 w-4" />
            Package 列表
          </TabsTrigger>
          <TabsTrigger value="metrics">
            <BarChart3 className="mr-2 h-4 w-4" />
            指标统计
          </TabsTrigger>
          <TabsTrigger value="analytics">
            <BarChart3 className="mr-2 h-4 w-4" />
            分析报告
          </TabsTrigger>
        </TabsList>

        {/* Package 列表 */}
        <TabsContent value="packages" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Context Package 列表</CardTitle>
              <CardDescription>查看历史构建的 Context Package</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* 搜索和筛选 */}
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="search">搜索</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="search"
                      placeholder="搜索 userQuery、tripId..."
                      value={packagesParams.search}
                      onChange={(e) =>
                        setPackagesParams({ ...packagesParams, page: 1, search: e.target.value })
                      }
                      className="pl-10"
                      onKeyDown={(e) => e.key === 'Enter' && loadPackages()}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="filterPhase">Phase</Label>
                  <Select
                    value={packagesParams.phase || undefined}
                    onValueChange={(value) =>
                      setPackagesParams({ ...packagesParams, page: 1, phase: value || '' })
                    }
                  >
                    <SelectTrigger id="filterPhase">
                      <SelectValue placeholder="全部" />
                    </SelectTrigger>
                    <SelectContent>
                      {PHASE_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="filterAgent">Agent</Label>
                  <Select
                    value={packagesParams.agent || undefined}
                    onValueChange={(value) =>
                      setPackagesParams({ ...packagesParams, page: 1, agent: value || '' })
                    }
                  >
                    <SelectTrigger id="filterAgent">
                      <SelectValue placeholder="全部" />
                    </SelectTrigger>
                    <SelectContent>
                      {AGENT_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="filterTripId">Trip ID</Label>
                  <Input
                    id="filterTripId"
                    placeholder="trip-123"
                    value={packagesParams.tripId}
                    onChange={(e) =>
                      setPackagesParams({ ...packagesParams, page: 1, tripId: e.target.value })
                    }
                  />
                </div>
              </div>
              <Button onClick={loadPackages} disabled={packagesLoading}>
                {packagesLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    加载中...
                  </>
                ) : (
                  <>
                    <Search className="mr-2 h-4 w-4" />
                    搜索
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* 列表 */}
          {packagesLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : !packages || packages.length === 0 ? (
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
                          <th className="px-4 py-3 text-left text-sm font-medium">Phase</th>
                          <th className="px-4 py-3 text-left text-sm font-medium">Agent</th>
                          <th className="px-4 py-3 text-left text-sm font-medium">User Query</th>
                          <th className="px-4 py-3 text-left text-sm font-medium">Blocks</th>
                          <th className="px-4 py-3 text-left text-sm font-medium">Tokens</th>
                          <th className="px-4 py-3 text-left text-sm font-medium">创建时间</th>
                          <th className="px-4 py-3 text-left text-sm font-medium">操作</th>
                        </tr>
                      </thead>
                      <tbody>
                        {packages.map((pkg) => (
                          <tr key={pkg.id} className="border-b hover:bg-muted/50">
                            <td className="px-4 py-3 text-sm font-mono">{pkg.id}</td>
                            <td className="px-4 py-3 text-sm">{pkg.tripId || '-'}</td>
                            <td className="px-4 py-3 text-sm">
                              <Badge variant="outline">{pkg.phase}</Badge>
                            </td>
                            <td className="px-4 py-3 text-sm">
                              <Badge variant="outline">{pkg.agent}</Badge>
                            </td>
                            <td className="px-4 py-3 text-sm max-w-xs truncate" title={pkg.userQuery}>
                              {pkg.userQuery}
                            </td>
                            <td className="px-4 py-3 text-sm">{pkg.blocksCount}</td>
                            <td className="px-4 py-3 text-sm">
                              {pkg.totalTokens} / {pkg.tokenBudget}
                              {pkg.totalTokens > pkg.tokenBudget && (
                                <Badge variant="destructive" className="ml-2">超预算</Badge>
                              )}
                            </td>
                            <td className="px-4 py-3 text-sm">
                              {new Date(pkg.createdAt).toLocaleString('zh-CN')}
                            </td>
                            <td className="px-4 py-3 text-sm">
                              <Link href={`/admin/context/${pkg.id}`}>
                                <Button variant="ghost" size="sm">
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              {/* 分页 */}
              {packagesTotalPages > 1 && (
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    共 {packagesTotal} 条，第 {packagesParams.page} / {packagesTotalPages} 页
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setPackagesParams({ ...packagesParams, page: packagesParams.page - 1 })
                      }
                      disabled={packagesParams.page <= 1}
                    >
                      上一页
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setPackagesParams({ ...packagesParams, page: packagesParams.page + 1 })
                      }
                      disabled={packagesParams.page >= packagesTotalPages}
                    >
                      下一页
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </TabsContent>

        {/* 指标统计 */}
        <TabsContent value="metrics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Context 指标统计</CardTitle>
              <CardDescription>查看 Context 使用情况的统计指标</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="metricsTripId">Trip ID</Label>
                  <Input
                    id="metricsTripId"
                    value={metricsParams.tripId}
                    onChange={(e) => setMetricsParams({ ...metricsParams, tripId: e.target.value })}
                    placeholder="可选"
                  />
                </div>
                <div>
                  <Label htmlFor="metricsPhase">Phase</Label>
                  <Select
                    value={metricsParams.phase || undefined}
                    onValueChange={(value) =>
                      setMetricsParams({ ...metricsParams, phase: value || '' })
                    }
                  >
                    <SelectTrigger id="metricsPhase">
                      <SelectValue placeholder="全部" />
                    </SelectTrigger>
                    <SelectContent>
                      {PHASE_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="metricsAgent">Agent</Label>
                  <Select
                    value={metricsParams.agent || undefined}
                    onValueChange={(value) =>
                      setMetricsParams({ ...metricsParams, agent: value || '' })
                    }
                  >
                    <SelectTrigger id="metricsAgent">
                      <SelectValue placeholder="全部" />
                    </SelectTrigger>
                    <SelectContent>
                      {AGENT_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="metricsStartTime">开始时间</Label>
                  <Input
                    id="metricsStartTime"
                    type="datetime-local"
                    value={metricsParams.startTime}
                    onChange={(e) =>
                      setMetricsParams({
                        ...metricsParams,
                        startTime: e.target.value ? new Date(e.target.value).toISOString() : '',
                      })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="metricsEndTime">结束时间</Label>
                  <Input
                    id="metricsEndTime"
                    type="datetime-local"
                    value={metricsParams.endTime}
                    onChange={(e) =>
                      setMetricsParams({
                        ...metricsParams,
                        endTime: e.target.value ? new Date(e.target.value).toISOString() : '',
                      })
                    }
                  />
                </div>
              </div>
              <Button onClick={handleGetMetrics} disabled={metricsLoading}>
                {metricsLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    加载中...
                  </>
                ) : (
                  <>
                    <BarChart3 className="mr-2 h-4 w-4" />
                    获取指标
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {metrics && (
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>指标摘要</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="text-sm">
                    <div>总记录数: {metrics.summary.totalRecords}</div>
                    <div>平均 Tokens: {metrics.summary.avgTokens.toFixed(0)}</div>
                    <div>平均压缩率: {(metrics.summary.avgCompressionRate * 100).toFixed(1)}%</div>
                    {metrics.summary.avgHitRate !== undefined && (
                      <div>平均命中率: {(metrics.summary.avgHitRate * 100).toFixed(1)}%</div>
                    )}
                    <div>平均噪音率: {(metrics.summary.avgNoiseRate * 100).toFixed(1)}%</div>
                    <div>缓存命中率: {(metrics.summary.cacheHitRate * 100).toFixed(1)}%</div>
                    <div>平均构建时间: {metrics.summary.avgBuildTimeMs}ms</div>
                  </div>
                  <div className="mt-4">
                    <Label>质量分布</Label>
                    <div className="text-sm space-y-1 mt-2">
                      <div>EXCELLENT: {metrics.summary.qualityDistribution.EXCELLENT}</div>
                      <div>GOOD: {metrics.summary.qualityDistribution.GOOD}</div>
                      <div>FAIR: {metrics.summary.qualityDistribution.FAIR}</div>
                      <div>POOR: {metrics.summary.qualityDistribution.POOR}</div>
                    </div>
                  </div>
                  <div className="mt-4">
                    <Label>Top Block Types</Label>
                    <div className="text-sm space-y-1 mt-2">
                      {metrics.summary.topBlockTypes.slice(0, 5).map((item, idx) => (
                        <div key={idx}>
                          {item.type}: {item.count}
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {metrics.byAgent && Object.keys(metrics.byAgent).length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>按 Agent 统计</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {Object.entries(metrics.byAgent).map(([agent, stats]) => (
                        <div key={agent} className="p-3 border rounded-md">
                          <div className="font-medium mb-2">{agent}</div>
                          <div className="text-sm space-y-1">
                            <div>数量: {stats.count}</div>
                            <div>平均 Tokens: {stats.avgTokens.toFixed(0)}</div>
                            <div>平均构建时间: {stats.avgBuildTimeMs}ms</div>
                            <div>缓存命中率: {(stats.cacheHitRate * 100).toFixed(1)}%</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {metrics.byPhase && Object.keys(metrics.byPhase).length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>按 Phase 统计</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {Object.entries(metrics.byPhase).map(([phase, stats]) => (
                        <div key={phase} className="p-3 border rounded-md">
                          <div className="font-medium mb-2">{phase}</div>
                          <div className="text-sm space-y-1">
                            <div>数量: {stats.count}</div>
                            <div>平均 Tokens: {stats.avgTokens.toFixed(0)}</div>
                            <div>平均构建时间: {stats.avgBuildTimeMs}ms</div>
                            <div>缓存命中率: {(stats.cacheHitRate * 100).toFixed(1)}%</div>
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

        {/* 分析报告 */}
        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Context 分析报告</CardTitle>
              <CardDescription>生成 Context 使用分析报告</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="analyticsStartTime">开始时间</Label>
                  <Input
                    id="analyticsStartTime"
                    type="datetime-local"
                    value={analyticsParams.startTime}
                    onChange={(e) =>
                      setAnalyticsParams({
                        ...analyticsParams,
                        startTime: e.target.value ? new Date(e.target.value).toISOString() : '',
                      })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="analyticsEndTime">结束时间</Label>
                  <Input
                    id="analyticsEndTime"
                    type="datetime-local"
                    value={analyticsParams.endTime}
                    onChange={(e) =>
                      setAnalyticsParams({
                        ...analyticsParams,
                        endTime: e.target.value ? new Date(e.target.value).toISOString() : '',
                      })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="analyticsGranularity">时间粒度</Label>
                  <select
                    id="analyticsGranularity"
                    className="w-full px-3 py-2 border rounded-md"
                    value={analyticsParams.granularity}
                    onChange={(e) =>
                      setAnalyticsParams({
                        ...analyticsParams,
                        granularity: e.target.value as 'hour' | 'day' | 'week' | 'month',
                      })
                    }
                  >
                    <option value="hour">小时</option>
                    <option value="day">天</option>
                    <option value="week">周</option>
                    <option value="month">月</option>
                  </select>
                </div>
              </div>
              <Button onClick={handleGetAnalytics} disabled={analyticsLoading}>
                {analyticsLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    加载中...
                  </>
                ) : (
                  <>
                    <BarChart3 className="mr-2 h-4 w-4" />
                    生成报告
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {analytics && (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>压缩分析</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm">
                    <div>平均压缩率: {(analytics.compressionAnalysis.avgCompressionRate * 100).toFixed(1)}%</div>
                    <div className="mt-4">
                      <Label>压缩率分布</Label>
                      <div className="mt-2 space-y-1">
                        {analytics.compressionAnalysis.compressionRateDistribution.map((item, idx) => (
                          <div key={idx} className="flex justify-between">
                            <span>{item.range}</span>
                            <span>{item.count}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Top Block Types</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {analytics.topBlockTypes.map((item, idx) => (
                      <div key={idx} className="flex justify-between p-2 border rounded-md">
                        <div>
                          <Badge>{item.type}</Badge>
                          <span className="ml-2 text-sm">数量: {item.count}</span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          平均 Tokens: {item.avgTokens.toFixed(0)}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>性能瓶颈</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {analytics.performanceBottlenecks.map((item, idx) => (
                      <div key={idx} className="p-3 border rounded-md">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <Badge>{item.agent}</Badge>
                            <Badge variant="outline" className="ml-2">{item.phase}</Badge>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            数量: {item.count}
                          </div>
                        </div>
                        <div className="text-sm">
                          平均构建时间: {item.avgBuildTimeMs}ms
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
