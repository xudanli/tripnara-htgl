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
  getDecisionLogs,
  getDecisionStats,
  getDecisionAnalytics,
  exportDecisionLogs,
} from '@/services/decision-admin';
import type {
  GetDecisionLogsParams,
  DecisionLogItem,
  DecisionStats,
  DecisionAnalytics,
} from '@/types/api';
import { Loader2, Eye, Download, BarChart3, FileText } from 'lucide-react';

// Persona 枚举值
const PERSONA_OPTIONS = [
  { value: 'ABU', label: 'ABU' },
  { value: 'DR_DRE', label: 'DR_DRE' },
  { value: 'NEPTUNE', label: 'NEPTUNE' },
];

// Decision Source 枚举值
const DECISION_SOURCE_OPTIONS = [
  { value: 'PHYSICAL', label: 'PHYSICAL' },
  { value: 'HUMAN', label: 'HUMAN' },
  { value: 'PHILOSOPHY', label: 'PHILOSOPHY' },
  { value: 'HEURISTIC', label: 'HEURISTIC' },
];

// Decision Action 枚举值
const DECISION_ACTION_OPTIONS = [
  { value: 'ALLOW', label: 'ALLOW' },
  { value: 'REJECT', label: 'REJECT' },
  { value: 'ADJUST', label: 'ADJUST' },
  { value: 'REPLACE', label: 'REPLACE' },
];

export default function DecisionLogsPage() {
  // 日志列表
  const [logs, setLogs] = useState<DecisionLogItem[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [logsParams, setLogsParams] = useState<GetDecisionLogsParams>({
    page: 1,
    limit: 20,
  });
  const [logsTotal, setLogsTotal] = useState(0);
  const [logsTotalPages, setLogsTotalPages] = useState(0);

  // 统计信息
  const [stats, setStats] = useState<DecisionStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [statsParams, setStatsParams] = useState({
    startDate: '',
    endDate: '',
    countryCode: '',
  });

  // 分析报告
  const [analytics, setAnalytics] = useState<DecisionAnalytics | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [analyticsParams, setAnalyticsParams] = useState({
    startDate: '',
    endDate: '',
    countryCode: '',
  });

  // 加载日志列表
  async function loadLogs() {
    setLogsLoading(true);
    try {
      const result = await getDecisionLogs(logsParams);
      if (result) {
        setLogs(result.items);
        setLogsTotal(result.pagination.total);
        setLogsTotalPages(result.pagination.totalPages);
      }
    } catch (error) {
      console.error('加载日志列表失败:', error);
    } finally {
      setLogsLoading(false);
    }
  }

  // 获取统计信息
  async function handleGetStats() {
    setStatsLoading(true);
    try {
      const params: any = {};
      if (statsParams.startDate) params.startDate = statsParams.startDate;
      if (statsParams.endDate) params.endDate = statsParams.endDate;
      if (statsParams.countryCode) params.countryCode = statsParams.countryCode;

      const result = await getDecisionStats(params);
      if (result) {
        setStats(result);
      }
    } catch (error) {
      console.error('获取统计失败:', error);
    } finally {
      setStatsLoading(false);
    }
  }

  // 获取分析报告
  async function handleGetAnalytics() {
    setAnalyticsLoading(true);
    try {
      const params: any = {};
      if (analyticsParams.startDate) params.startDate = analyticsParams.startDate;
      if (analyticsParams.endDate) params.endDate = analyticsParams.endDate;
      if (analyticsParams.countryCode) params.countryCode = analyticsParams.countryCode;

      const result = await getDecisionAnalytics(params);
      if (result) {
        setAnalytics(result);
      }
    } catch (error) {
      console.error('获取分析报告失败:', error);
    } finally {
      setAnalyticsLoading(false);
    }
  }

  // 导出日志
  async function handleExport(format: 'json' | 'csv') {
    try {
      const result = await exportDecisionLogs({
        format,
        filters: {
          tripId: logsParams.tripId,
          persona: logsParams.persona,
          startDate: logsParams.startDate,
          endDate: logsParams.endDate,
        },
      });
      if (result) {
        if (format === 'csv' && 'content' in result) {
          // 下载 CSV
          const blob = new Blob([result.content], { type: 'text/csv' });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = result.filename;
          a.click();
        } else if (format === 'json' && 'data' in result) {
          // 下载 JSON
          const blob = new Blob([JSON.stringify(result.data, null, 2)], { type: 'application/json' });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `decision-logs-${new Date().toISOString().split('T')[0]}.json`;
          a.click();
        }
      }
    } catch (error) {
      console.error('导出失败:', error);
      alert('导出失败: ' + (error instanceof Error ? error.message : '未知错误'));
    }
  }

  useEffect(() => {
    loadLogs();
  }, [logsParams.page, logsParams.limit]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">决策日志管理</h1>
        <p className="text-muted-foreground mt-2">查看和管理决策日志</p>
      </div>

      <Tabs defaultValue="logs" className="space-y-4">
        <TabsList>
          <TabsTrigger value="logs">
            <FileText className="mr-2 h-4 w-4" />
            日志列表
          </TabsTrigger>
          <TabsTrigger value="stats">
            <BarChart3 className="mr-2 h-4 w-4" />
            统计信息
          </TabsTrigger>
          <TabsTrigger value="analytics">
            <BarChart3 className="mr-2 h-4 w-4" />
            分析报告
          </TabsTrigger>
        </TabsList>

        {/* 日志列表 */}
        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>决策日志列表</CardTitle>
              <CardDescription>查看历史决策日志</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* 筛选 */}
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="filterTripId">Trip ID</Label>
                  <Input
                    id="filterTripId"
                    value={logsParams.tripId || ''}
                    onChange={(e) =>
                      setLogsParams({ ...logsParams, page: 1, tripId: e.target.value || undefined })
                    }
                    placeholder="trip-uuid"
                  />
                </div>
                <div>
                  <Label htmlFor="filterPersona">Persona</Label>
                  <Select
                    value={logsParams.persona || undefined}
                    onValueChange={(value) =>
                      setLogsParams({ ...logsParams, page: 1, persona: value as any })
                    }
                  >
                    <SelectTrigger id="filterPersona">
                      <SelectValue placeholder="全部" />
                    </SelectTrigger>
                    <SelectContent>
                      {PERSONA_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="filterSource">Decision Source</Label>
                  <Select
                    value={logsParams.decisionSource || undefined}
                    onValueChange={(value) =>
                      setLogsParams({ ...logsParams, page: 1, decisionSource: value as any })
                    }
                  >
                    <SelectTrigger id="filterSource">
                      <SelectValue placeholder="全部" />
                    </SelectTrigger>
                    <SelectContent>
                      {DECISION_SOURCE_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="filterAction">Action</Label>
                  <Select
                    value={logsParams.action || undefined}
                    onValueChange={(value) =>
                      setLogsParams({ ...logsParams, page: 1, action: value as any })
                    }
                  >
                    <SelectTrigger id="filterAction">
                      <SelectValue placeholder="全部" />
                    </SelectTrigger>
                    <SelectContent>
                      {DECISION_ACTION_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={loadLogs} disabled={logsLoading}>
                  {logsLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      加载中...
                    </>
                  ) : (
                    '搜索'
                  )}
                </Button>
                <Button variant="outline" onClick={() => handleExport('json')}>
                  <Download className="mr-2 h-4 w-4" />
                  导出 JSON
                </Button>
                <Button variant="outline" onClick={() => handleExport('csv')}>
                  <Download className="mr-2 h-4 w-4" />
                  导出 CSV
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* 列表 */}
          {logsLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : logs.length === 0 ? (
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
                          <th className="px-4 py-3 text-left text-sm font-medium">Persona</th>
                          <th className="px-4 py-3 text-left text-sm font-medium">Action</th>
                          <th className="px-4 py-3 text-left text-sm font-medium">Source</th>
                          <th className="px-4 py-3 text-left text-sm font-medium">Explanation</th>
                          <th className="px-4 py-3 text-left text-sm font-medium">时间</th>
                          <th className="px-4 py-3 text-left text-sm font-medium">操作</th>
                        </tr>
                      </thead>
                      <tbody>
                        {logs.map((log) => (
                          <tr key={log.id} className="border-b hover:bg-muted/50">
                            <td className="px-4 py-3 text-sm font-mono">{log.id.slice(0, 8)}...</td>
                            <td className="px-4 py-3 text-sm">{log.tripId?.slice(0, 8) || '-'}...</td>
                            <td className="px-4 py-3 text-sm">
                              <Badge variant="outline">{log.persona}</Badge>
                            </td>
                            <td className="px-4 py-3 text-sm">
                              <Badge
                                variant={
                                  log.action === 'ALLOW'
                                    ? 'default'
                                    : log.action === 'REJECT'
                                    ? 'destructive'
                                    : 'secondary'
                                }
                              >
                                {log.action}
                              </Badge>
                            </td>
                            <td className="px-4 py-3 text-sm">
                              <Badge variant="outline">{log.decisionSource}</Badge>
                            </td>
                            <td className="px-4 py-3 text-sm max-w-xs truncate" title={log.explanation}>
                              {log.explanation}
                            </td>
                            <td className="px-4 py-3 text-sm">
                              {new Date(log.timestamp).toLocaleString('zh-CN')}
                            </td>
                            <td className="px-4 py-3 text-sm">
                              <Link href={`/admin/decision/${log.id}`}>
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
              {logsTotalPages > 1 && (
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    共 {logsTotal} 条，第 {logsParams.page} / {logsTotalPages} 页
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setLogsParams({ ...logsParams, page: (logsParams.page || 1) - 1 })
                      }
                      disabled={(logsParams.page || 1) <= 1}
                    >
                      上一页
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setLogsParams({ ...logsParams, page: (logsParams.page || 1) + 1 })
                      }
                      disabled={(logsParams.page || 1) >= logsTotalPages}
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
              <CardTitle>决策统计</CardTitle>
              <CardDescription>查看决策统计信息</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="statsStartDate">开始日期</Label>
                  <Input
                    id="statsStartDate"
                    type="date"
                    value={statsParams.startDate}
                    onChange={(e) => setStatsParams({ ...statsParams, startDate: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="statsEndDate">结束日期</Label>
                  <Input
                    id="statsEndDate"
                    type="date"
                    value={statsParams.endDate}
                    onChange={(e) => setStatsParams({ ...statsParams, endDate: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="statsCountryCode">国家代码</Label>
                  <Input
                    id="statsCountryCode"
                    value={statsParams.countryCode}
                    onChange={(e) => setStatsParams({ ...statsParams, countryCode: e.target.value })}
                    placeholder="JP"
                  />
                </div>
              </div>
              <Button onClick={handleGetStats} disabled={statsLoading}>
                {statsLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    加载中...
                  </>
                ) : (
                  <>
                    <BarChart3 className="mr-2 h-4 w-4" />
                    获取统计
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {stats && (
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>分布统计</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="text-sm">
                    <div>总决策数: {stats.distribution.totalDecisions}</div>
                    <div>现实驱动比例: {(stats.distribution.realityDrivenRatio * 100).toFixed(1)}%</div>
                  </div>
                  <div className="mt-4">
                    <Label>按来源分布</Label>
                    <div className="text-sm space-y-1 mt-2">
                      {Object.entries(stats.distribution.bySourcePercentage).map(([source, percentage]) => (
                        <div key={source}>
                          {source}: {(percentage * 100).toFixed(1)}%
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {stats.personaStats && stats.personaStats.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Persona 统计</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {stats.personaStats.map((personaStat, idx) => (
                        <div key={idx} className="p-3 border rounded-md">
                          <div className="font-medium mb-2">{personaStat.persona}</div>
                          <div className="text-sm space-y-1">
                            <div>触发次数: {personaStat.triggerCount}</div>
                            <div>主要来源: {personaStat.primarySource}</div>
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
              <CardTitle>决策分析报告</CardTitle>
              <CardDescription>查看决策质量分析</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="analyticsStartDate">开始日期</Label>
                  <Input
                    id="analyticsStartDate"
                    type="date"
                    value={analyticsParams.startDate}
                    onChange={(e) =>
                      setAnalyticsParams({ ...analyticsParams, startDate: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="analyticsEndDate">结束日期</Label>
                  <Input
                    id="analyticsEndDate"
                    type="date"
                    value={analyticsParams.endDate}
                    onChange={(e) =>
                      setAnalyticsParams({ ...analyticsParams, endDate: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="analyticsCountryCode">国家代码</Label>
                  <Input
                    id="analyticsCountryCode"
                    value={analyticsParams.countryCode}
                    onChange={(e) =>
                      setAnalyticsParams({ ...analyticsParams, countryCode: e.target.value })
                    }
                    placeholder="JP"
                  />
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
                  <CardTitle>质量报告</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm space-y-2">
                    <div>总体评分: {analytics.qualityReport.overallScore.toFixed(2)}</div>
                    <div>现实驱动比例: {(analytics.qualityReport.realityDrivenRatio * 100).toFixed(1)}%</div>
                    <div>解释质量: {analytics.qualityReport.explanationQuality.toFixed(2)}</div>
                    <div>决策一致性: {analytics.qualityReport.decisionConsistency.toFixed(2)}</div>
                  </div>
                </CardContent>
              </Card>

              {analytics.heuristicHotspots && analytics.heuristicHotspots.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Heuristic 热点</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {analytics.heuristicHotspots.map((hotspot, idx) => (
                        <div key={idx} className="p-3 border rounded-md">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <Badge>{hotspot.countryCode}</Badge>
                              <span className="ml-2 text-sm">{hotspot.routeDirectionId}</span>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Heuristic 比例: {(hotspot.heuristicRatio * 100).toFixed(1)}%
                            </div>
                          </div>
                          <div className="text-sm">{hotspot.recommendation}</div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
