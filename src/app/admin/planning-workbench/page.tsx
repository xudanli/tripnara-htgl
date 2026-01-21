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
  getPlanningSessions,
  getPlanningSessionsStats,
  getPlanningPlans,
} from '@/services/planning-workbench';
import type {
  GetPlanningSessionsParams,
  PlanningSessionItem,
  PlanningSessionsStats,
  GetPlanningPlansParams,
  PlanningPlanItem,
} from '@/types/api';
import { Loader2, Eye, BarChart3, FileText, Calendar } from 'lucide-react';

// Status 选项
const STATUS_OPTIONS = [
  { value: 'ACTIVE', label: '活跃' },
  { value: 'COMPLETED', label: '已完成' },
  { value: 'CANCELLED', label: '已取消' },
];

export default function PlanningWorkbenchPage() {
  // 会话列表
  const [sessions, setSessions] = useState<PlanningSessionItem[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [sessionsParams, setSessionsParams] = useState<GetPlanningSessionsParams>({
    page: 1,
    limit: 20,
  });
  const [sessionsTotal, setSessionsTotal] = useState(0);
  const [sessionsTotalPages, setSessionsTotalPages] = useState(0);

  // 方案列表
  const [plans, setPlans] = useState<PlanningPlanItem[]>([]);
  const [plansLoading, setPlansLoading] = useState(false);
  const [plansParams, setPlansParams] = useState<GetPlanningPlansParams>({
    page: 1,
    limit: 20,
  });
  const [plansTotal, setPlansTotal] = useState(0);
  const [plansTotalPages, setPlansTotalPages] = useState(0);

  // 统计信息
  const [stats, setStats] = useState<PlanningSessionsStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);

  // 加载会话列表
  async function loadSessions() {
    setSessionsLoading(true);
    try {
      const result = await getPlanningSessions(sessionsParams);
      if (result) {
        setSessions(result.items);
        setSessionsTotal(result.pagination.total);
        setSessionsTotalPages(result.pagination.totalPages);
      }
    } catch (error) {
      console.error('加载会话列表失败:', error);
    } finally {
      setSessionsLoading(false);
    }
  }

  // 加载方案列表
  async function loadPlans() {
    setPlansLoading(true);
    try {
      const result = await getPlanningPlans(plansParams);
      if (result) {
        setPlans(result.items);
        setPlansTotal(result.pagination.total);
        setPlansTotalPages(result.pagination.totalPages);
      }
    } catch (error) {
      console.error('加载方案列表失败:', error);
    } finally {
      setPlansLoading(false);
    }
  }

  // 获取统计信息
  async function handleGetStats() {
    setStatsLoading(true);
    try {
      const result = await getPlanningSessionsStats();
      if (result) {
        setStats(result);
      }
    } catch (error) {
      console.error('获取统计失败:', error);
    } finally {
      setStatsLoading(false);
    }
  }

  useEffect(() => {
    loadSessions();
  }, [sessionsParams.page, sessionsParams.limit]);

  useEffect(() => {
    loadPlans();
  }, [plansParams.page, plansParams.limit]);

  useEffect(() => {
    handleGetStats();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">规划工作台管理</h1>
        <p className="text-muted-foreground mt-2">查看和管理规划会话和方案</p>
      </div>

      <Tabs defaultValue="sessions" className="space-y-4">
        <TabsList>
          <TabsTrigger value="sessions">
            <FileText className="mr-2 h-4 w-4" />
            会话列表
          </TabsTrigger>
          <TabsTrigger value="plans">
            <Calendar className="mr-2 h-4 w-4" />
            方案列表
          </TabsTrigger>
          <TabsTrigger value="stats">
            <BarChart3 className="mr-2 h-4 w-4" />
            统计信息
          </TabsTrigger>
        </TabsList>

        {/* 会话列表 */}
        <TabsContent value="sessions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>规划会话列表</CardTitle>
              <CardDescription>查看历史规划会话</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* 筛选 */}
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="filterTripId">Trip ID</Label>
                  <Input
                    id="filterTripId"
                    value={sessionsParams.tripId || ''}
                    onChange={(e) =>
                      setSessionsParams({ ...sessionsParams, page: 1, tripId: e.target.value || undefined })
                    }
                    placeholder="trip-uuid"
                  />
                </div>
                <div>
                  <Label htmlFor="filterUserId">User ID</Label>
                  <Input
                    id="filterUserId"
                    value={sessionsParams.userId || ''}
                    onChange={(e) =>
                      setSessionsParams({ ...sessionsParams, page: 1, userId: e.target.value || undefined })
                    }
                    placeholder="user-uuid"
                  />
                </div>
                <div>
                  <Label htmlFor="filterStatus">Status</Label>
                  <Select
                    value={sessionsParams.status || undefined}
                    onValueChange={(value) =>
                      setSessionsParams({ ...sessionsParams, page: 1, status: value as any })
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
              </div>
              <div className="flex gap-2">
                <Button onClick={loadSessions} disabled={sessionsLoading}>
                  {sessionsLoading ? (
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
          {sessionsLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : sessions.length === 0 ? (
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
                          <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
                          <th className="px-4 py-3 text-left text-sm font-medium">创建时间</th>
                          <th className="px-4 py-3 text-left text-sm font-medium">操作</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sessions.map((session) => (
                          <tr key={session.id} className="border-b hover:bg-muted/50">
                            <td className="px-4 py-3 text-sm font-mono">{session.id.slice(0, 8)}...</td>
                            <td className="px-4 py-3 text-sm">{session.tripId?.slice(0, 8) || '-'}...</td>
                            <td className="px-4 py-3 text-sm">{session.userId?.slice(0, 8) || '-'}...</td>
                            <td className="px-4 py-3 text-sm">
                              <Badge
                                variant={
                                  session.status === 'COMPLETED'
                                    ? 'default'
                                    : session.status === 'CANCELLED'
                                    ? 'destructive'
                                    : 'secondary'
                                }
                              >
                                {session.status === 'ACTIVE' ? '活跃' : session.status === 'COMPLETED' ? '已完成' : '已取消'}
                              </Badge>
                            </td>
                            <td className="px-4 py-3 text-sm">
                              {new Date(session.createdAt).toLocaleString('zh-CN')}
                            </td>
                            <td className="px-4 py-3 text-sm">
                              <Link href={`/admin/planning-workbench/sessions/${session.id}`}>
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
              {sessionsTotalPages > 1 && (
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    共 {sessionsTotal} 条，第 {sessionsParams.page || 1} / {sessionsTotalPages} 页
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setSessionsParams({ ...sessionsParams, page: (sessionsParams.page || 1) - 1 })
                      }
                      disabled={(sessionsParams.page || 1) <= 1}
                    >
                      上一页
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setSessionsParams({ ...sessionsParams, page: (sessionsParams.page || 1) + 1 })
                      }
                      disabled={(sessionsParams.page || 1) >= sessionsTotalPages}
                    >
                      下一页
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </TabsContent>

        {/* 方案列表 */}
        <TabsContent value="plans" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>规划方案列表</CardTitle>
              <CardDescription>查看历史规划方案</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* 筛选 */}
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="planFilterSessionId">Session ID</Label>
                  <Input
                    id="planFilterSessionId"
                    value={plansParams.sessionId || ''}
                    onChange={(e) =>
                      setPlansParams({ ...plansParams, page: 1, sessionId: e.target.value || undefined })
                    }
                    placeholder="session-uuid"
                  />
                </div>
                <div>
                  <Label htmlFor="planFilterTripId">Trip ID</Label>
                  <Input
                    id="planFilterTripId"
                    value={plansParams.tripId || ''}
                    onChange={(e) =>
                      setPlansParams({ ...plansParams, page: 1, tripId: e.target.value || undefined })
                    }
                    placeholder="trip-uuid"
                  />
                </div>
                <div>
                  <Label htmlFor="planFilterUserId">User ID</Label>
                  <Input
                    id="planFilterUserId"
                    value={plansParams.userId || ''}
                    onChange={(e) =>
                      setPlansParams({ ...plansParams, page: 1, userId: e.target.value || undefined })
                    }
                    placeholder="user-uuid"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={loadPlans} disabled={plansLoading}>
                  {plansLoading ? (
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
          {plansLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : plans.length === 0 ? (
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
                          <th className="px-4 py-3 text-left text-sm font-medium">Session ID</th>
                          <th className="px-4 py-3 text-left text-sm font-medium">Trip ID</th>
                          <th className="px-4 py-3 text-left text-sm font-medium">User ID</th>
                          <th className="px-4 py-3 text-left text-sm font-medium">Version</th>
                          <th className="px-4 py-3 text-left text-sm font-medium">创建时间</th>
                          <th className="px-4 py-3 text-left text-sm font-medium">操作</th>
                        </tr>
                      </thead>
                      <tbody>
                        {plans.map((plan) => (
                          <tr key={plan.id} className="border-b hover:bg-muted/50">
                            <td className="px-4 py-3 text-sm font-mono">{plan.id.slice(0, 8)}...</td>
                            <td className="px-4 py-3 text-sm">{plan.sessionId?.slice(0, 8) || '-'}...</td>
                            <td className="px-4 py-3 text-sm">{plan.tripId?.slice(0, 8) || '-'}...</td>
                            <td className="px-4 py-3 text-sm">{plan.userId?.slice(0, 8) || '-'}...</td>
                            <td className="px-4 py-3 text-sm">
                              <Badge variant="outline">v{plan.version}</Badge>
                            </td>
                            <td className="px-4 py-3 text-sm">
                              {new Date(plan.createdAt).toLocaleString('zh-CN')}
                            </td>
                            <td className="px-4 py-3 text-sm">
                              <Link href={`/admin/planning-workbench/plans/${plan.id}`}>
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
              {plansTotalPages > 1 && (
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    共 {plansTotal} 条，第 {plansParams.page || 1} / {plansTotalPages} 页
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setPlansParams({ ...plansParams, page: (plansParams.page || 1) - 1 })
                      }
                      disabled={(plansParams.page || 1) <= 1}
                    >
                      上一页
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setPlansParams({ ...plansParams, page: (plansParams.page || 1) + 1 })
                      }
                      disabled={(plansParams.page || 1) >= plansTotalPages}
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
              <CardTitle>会话统计</CardTitle>
              <CardDescription>查看规划会话统计信息</CardDescription>
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
                    <div>总会话数: {stats.summary.totalSessions}</div>
                    <div>已完成: {stats.summary.completedSessions}</div>
                    <div>活跃: {stats.summary.activeSessions}</div>
                    <div>已取消: {stats.summary.cancelledSessions}</div>
                    <div>成功率: {(stats.summary.successRate * 100).toFixed(1)}%</div>
                    <div>平均时长: {stats.summary.avgDuration}s</div>
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
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
