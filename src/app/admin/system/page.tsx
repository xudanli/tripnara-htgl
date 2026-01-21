'use client';

import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  getSystemMetrics,
  getPerformanceMetrics,
  getErrorLogsStats,
  getRequestStats,
  getDatabaseStatus,
  getCacheStatus,
} from '@/services/system-admin';
import type {
  PerformanceMetrics,
  ErrorLogsStats,
  RequestStatsResponse,
  DatabaseStatusResponse,
  CacheStatusResponse,
} from '@/types/api';
import { Loader2, Monitor, Database, Zap, AlertTriangle, Activity } from 'lucide-react';

export default function SystemMonitorPage() {
  // 系统指标
  const [systemMetrics, setSystemMetrics] = useState<any | null>(null);
  const [systemMetricsLoading, setSystemMetricsLoading] = useState(false);

  // 性能指标
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics | null>(null);
  const [performanceLoading, setPerformanceLoading] = useState(false);
  const [performanceParams, setPerformanceParams] = useState({
    startTime: '',
    endTime: '',
    granularity: 'hour' as 'hour' | 'day',
  });

  // 错误日志
  const [errorLogs, setErrorLogs] = useState<ErrorLogsStats | null>(null);
  const [errorLogsLoading, setErrorLogsLoading] = useState(false);
  const [errorLogsParams, setErrorLogsParams] = useState({
    startTime: '',
    endTime: '',
    level: 'error' as 'error' | 'warn',
  });

  // 请求统计
  const [requestStats, setRequestStats] = useState<RequestStatsResponse | null>(null);
  const [requestStatsLoading, setRequestStatsLoading] = useState(false);
  const [requestStatsParams, setRequestStatsParams] = useState({
    startTime: '',
    endTime: '',
    granularity: 'hour' as 'hour' | 'day',
  });

  // 数据库状态
  const [databaseStatus, setDatabaseStatus] = useState<DatabaseStatusResponse | null>(null);
  const [databaseLoading, setDatabaseLoading] = useState(false);

  // 缓存状态
  const [cacheStatus, setCacheStatus] = useState<CacheStatusResponse | null>(null);
  const [cacheLoading, setCacheLoading] = useState(false);

  // 获取系统指标
  async function loadSystemMetrics() {
    setSystemMetricsLoading(true);
    try {
      const result = await getSystemMetrics();
      if (result) {
        setSystemMetrics(result);
      }
    } catch (error) {
      console.error('获取系统指标失败:', error);
    } finally {
      setSystemMetricsLoading(false);
    }
  }

  // 获取性能指标
  async function handleGetPerformance() {
    setPerformanceLoading(true);
    try {
      const params: any = {};
      if (performanceParams.startTime) params.startTime = performanceParams.startTime;
      if (performanceParams.endTime) params.endTime = performanceParams.endTime;
      if (performanceParams.granularity) params.granularity = performanceParams.granularity;

      const result = await getPerformanceMetrics(params);
      if (result) {
        setPerformanceMetrics(result);
      }
    } catch (error) {
      console.error('获取性能指标失败:', error);
    } finally {
      setPerformanceLoading(false);
    }
  }

  // 获取错误日志
  async function handleGetErrorLogs() {
    setErrorLogsLoading(true);
    try {
      const params: any = {};
      if (errorLogsParams.startTime) params.startTime = errorLogsParams.startTime;
      if (errorLogsParams.endTime) params.endTime = errorLogsParams.endTime;
      if (errorLogsParams.level) params.level = errorLogsParams.level;

      const result = await getErrorLogsStats(params);
      if (result) {
        setErrorLogs(result);
      }
    } catch (error) {
      console.error('获取错误日志失败:', error);
    } finally {
      setErrorLogsLoading(false);
    }
  }

  // 获取请求统计
  async function handleGetRequestStats() {
    setRequestStatsLoading(true);
    try {
      const params: any = {};
      if (requestStatsParams.startTime) params.startTime = requestStatsParams.startTime;
      if (requestStatsParams.endTime) params.endTime = requestStatsParams.endTime;
      if (requestStatsParams.granularity) params.granularity = requestStatsParams.granularity;

      const result = await getRequestStats(params);
      if (result) {
        setRequestStats(result);
      }
    } catch (error) {
      console.error('获取请求统计失败:', error);
    } finally {
      setRequestStatsLoading(false);
    }
  }

  // 获取数据库状态
  async function loadDatabaseStatus() {
    setDatabaseLoading(true);
    try {
      const result = await getDatabaseStatus();
      if (result) {
        setDatabaseStatus(result);
      }
    } catch (error) {
      console.error('获取数据库状态失败:', error);
    } finally {
      setDatabaseLoading(false);
    }
  }

  // 获取缓存状态
  async function loadCacheStatus() {
    setCacheLoading(true);
    try {
      const result = await getCacheStatus();
      if (result) {
        setCacheStatus(result);
      }
    } catch (error) {
      console.error('获取缓存状态失败:', error);
    } finally {
      setCacheLoading(false);
    }
  }

  useEffect(() => {
    loadSystemMetrics();
    loadDatabaseStatus();
    loadCacheStatus();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">系统监控</h1>
        <p className="text-muted-foreground mt-2">监控系统运行状态和性能指标</p>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">
            <Monitor className="mr-2 h-4 w-4" />
            系统概览
          </TabsTrigger>
          <TabsTrigger value="performance">
            <Activity className="mr-2 h-4 w-4" />
            性能指标
          </TabsTrigger>
          <TabsTrigger value="requests">
            <Zap className="mr-2 h-4 w-4" />
            请求统计
          </TabsTrigger>
          <TabsTrigger value="errors">
            <AlertTriangle className="mr-2 h-4 w-4" />
            错误日志
          </TabsTrigger>
          <TabsTrigger value="database">
            <Database className="mr-2 h-4 w-4" />
            数据库
          </TabsTrigger>
          <TabsTrigger value="cache">
            <Zap className="mr-2 h-4 w-4" />
            缓存
          </TabsTrigger>
        </TabsList>

        {/* 系统概览 */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {systemMetrics && (
              <>
                {systemMetrics.system && (
                  <Card>
                    <CardHeader>
                      <CardTitle>系统资源</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="text-sm">
                        <div>CPU 使用率: {systemMetrics.system.cpuUsage?.toFixed(1)}%</div>
                        <div>内存使用率: {systemMetrics.system.memoryUsage?.toFixed(1)}%</div>
                        <div>磁盘使用率: {systemMetrics.system.diskUsage?.toFixed(1)}%</div>
                        <div>运行时间: {Math.floor((systemMetrics.system.uptime || 0) / 3600)} 小时</div>
                      </div>
                    </CardContent>
                  </Card>
                )}
                {systemMetrics.api && (
                  <Card>
                    <CardHeader>
                      <CardTitle>API 统计</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="text-sm">
                        <div>总请求数: {systemMetrics.api.totalRequests?.toLocaleString()}</div>
                        <div>每秒请求数: {systemMetrics.api.requestsPerSecond?.toFixed(1)}</div>
                        <div>平均响应时间: {systemMetrics.api.avgResponseTime?.toFixed(0)}ms</div>
                        <div>错误率: {(systemMetrics.api.errorRate * 100)?.toFixed(2)}%</div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            )}
            {databaseStatus && (
              <Card>
                <CardHeader>
                  <CardTitle>数据库连接池</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="text-sm">
                    <div>连接池大小: {databaseStatus.connectionPool.size}</div>
                    <div>活跃连接: {databaseStatus.connectionPool.active}</div>
                    <div>空闲连接: {databaseStatus.connectionPool.idle}</div>
                    <div>等待连接: {databaseStatus.connectionPool.waiting}</div>
                  </div>
                </CardContent>
              </Card>
            )}
            {cacheStatus && (
              <Card>
                <CardHeader>
                  <CardTitle>缓存状态</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="text-sm">
                    <div>状态: <Badge>{cacheStatus.status}</Badge></div>
                    <div>命中率: {(cacheStatus.hitRate * 100).toFixed(1)}%</div>
                    <div>总键数: {cacheStatus.totalKeys.toLocaleString()}</div>
                    <div>内存使用: {cacheStatus.memoryUsage.percentage.toFixed(1)}%</div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* 性能指标 */}
        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>性能指标</CardTitle>
              <CardDescription>查看系统性能趋势</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="perfStartTime">开始时间</Label>
                  <Input
                    id="perfStartTime"
                    type="datetime-local"
                    value={performanceParams.startTime}
                    onChange={(e) =>
                      setPerformanceParams({
                        ...performanceParams,
                        startTime: e.target.value ? new Date(e.target.value).toISOString() : '',
                      })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="perfEndTime">结束时间</Label>
                  <Input
                    id="perfEndTime"
                    type="datetime-local"
                    value={performanceParams.endTime}
                    onChange={(e) =>
                      setPerformanceParams({
                        ...performanceParams,
                        endTime: e.target.value ? new Date(e.target.value).toISOString() : '',
                      })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="perfGranularity">时间粒度</Label>
                  <select
                    id="perfGranularity"
                    className="w-full px-3 py-2 border rounded-md"
                    value={performanceParams.granularity}
                    onChange={(e) =>
                      setPerformanceParams({
                        ...performanceParams,
                        granularity: e.target.value as 'hour' | 'day',
                      })
                    }
                  >
                    <option value="hour">小时</option>
                    <option value="day">天</option>
                  </select>
                </div>
              </div>
              <Button onClick={handleGetPerformance} disabled={performanceLoading}>
                {performanceLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    加载中...
                  </>
                ) : (
                  '获取性能指标'
                )}
              </Button>
            </CardContent>
          </Card>

          {performanceMetrics && (
            <Card>
              <CardHeader>
                <CardTitle>性能摘要</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm space-y-2">
                  <div>峰值每秒请求数: {performanceMetrics.summary.peakRequestsPerSecond}</div>
                  <div>峰值响应时间: {performanceMetrics.summary.peakResponseTime}ms</div>
                  <div>峰值错误率: {(performanceMetrics.summary.peakErrorRate * 100).toFixed(2)}%</div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* 请求统计 */}
        <TabsContent value="requests" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>请求统计</CardTitle>
              <CardDescription>查看 API 请求统计信息</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="reqStartTime">开始时间</Label>
                  <Input
                    id="reqStartTime"
                    type="datetime-local"
                    value={requestStatsParams.startTime}
                    onChange={(e) =>
                      setRequestStatsParams({
                        ...requestStatsParams,
                        startTime: e.target.value ? new Date(e.target.value).toISOString() : '',
                      })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="reqEndTime">结束时间</Label>
                  <Input
                    id="reqEndTime"
                    type="datetime-local"
                    value={requestStatsParams.endTime}
                    onChange={(e) =>
                      setRequestStatsParams({
                        ...requestStatsParams,
                        endTime: e.target.value ? new Date(e.target.value).toISOString() : '',
                      })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="reqGranularity">时间粒度</Label>
                  <select
                    id="reqGranularity"
                    className="w-full px-3 py-2 border rounded-md"
                    value={requestStatsParams.granularity}
                    onChange={(e) =>
                      setRequestStatsParams({
                        ...requestStatsParams,
                        granularity: e.target.value as 'hour' | 'day',
                      })
                    }
                  >
                    <option value="hour">小时</option>
                    <option value="day">天</option>
                  </select>
                </div>
              </div>
              <Button onClick={handleGetRequestStats} disabled={requestStatsLoading}>
                {requestStatsLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    加载中...
                  </>
                ) : (
                  '获取请求统计'
                )}
              </Button>
            </CardContent>
          </Card>

          {requestStats && (
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>请求摘要</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="text-sm">
                    <div>总请求数: {requestStats.summary.totalRequests.toLocaleString()}</div>
                    <div>每秒请求数: {requestStats.summary.requestsPerSecond.toFixed(1)}</div>
                    <div>唯一用户: {requestStats.summary.uniqueUsers.toLocaleString()}</div>
                    <div>唯一 IP: {requestStats.summary.uniqueIPs.toLocaleString()}</div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>按方法统计</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm space-y-1">
                    {Object.entries(requestStats.byMethod).map(([method, count]) => (
                      <div key={method}>
                        {method}: {count.toLocaleString()}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        {/* 错误日志 */}
        <TabsContent value="errors" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>错误日志统计</CardTitle>
              <CardDescription>查看错误日志统计信息</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="errorStartTime">开始时间</Label>
                  <Input
                    id="errorStartTime"
                    type="datetime-local"
                    value={errorLogsParams.startTime}
                    onChange={(e) =>
                      setErrorLogsParams({
                        ...errorLogsParams,
                        startTime: e.target.value ? new Date(e.target.value).toISOString() : '',
                      })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="errorEndTime">结束时间</Label>
                  <Input
                    id="errorEndTime"
                    type="datetime-local"
                    value={errorLogsParams.endTime}
                    onChange={(e) =>
                      setErrorLogsParams({
                        ...errorLogsParams,
                        endTime: e.target.value ? new Date(e.target.value).toISOString() : '',
                      })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="errorLevel">日志级别</Label>
                  <select
                    id="errorLevel"
                    className="w-full px-3 py-2 border rounded-md"
                    value={errorLogsParams.level}
                    onChange={(e) =>
                      setErrorLogsParams({
                        ...errorLogsParams,
                        level: e.target.value as 'error' | 'warn',
                      })
                    }
                  >
                    <option value="error">Error</option>
                    <option value="warn">Warning</option>
                  </select>
                </div>
              </div>
              <Button onClick={handleGetErrorLogs} disabled={errorLogsLoading}>
                {errorLogsLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    加载中...
                  </>
                ) : (
                  '获取错误日志'
                )}
              </Button>
            </CardContent>
          </Card>

          {errorLogs && (
            <Card>
              <CardHeader>
                <CardTitle>错误摘要</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm">
                  <div>总错误数: {errorLogs.summary.totalErrors}</div>
                  <div>错误率: {(errorLogs.summary.errorRate * 100).toFixed(2)}%</div>
                  <div>唯一错误: {errorLogs.summary.uniqueErrors}</div>
                </div>
                {errorLogs.topErrors && errorLogs.topErrors.length > 0 && (
                  <div className="mt-4">
                    <Label>Top 错误</Label>
                    <div className="mt-2 space-y-2">
                      {errorLogs.topErrors.map((error, idx) => (
                        <div key={idx} className="p-2 border rounded-md text-sm">
                          <div className="font-medium">{error.message}</div>
                          <div className="text-muted-foreground">
                            次数: {error.count} | 最后发生: {new Date(error.lastOccurred).toLocaleString('zh-CN')}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* 数据库 */}
        <TabsContent value="database" className="space-y-4">
          {databaseLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : databaseStatus ? (
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>连接池状态</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="text-sm">
                    <div>连接池大小: {databaseStatus.connectionPool.size}</div>
                    <div>活跃连接: {databaseStatus.connectionPool.active}</div>
                    <div>空闲连接: {databaseStatus.connectionPool.idle}</div>
                    <div>等待连接: {databaseStatus.connectionPool.waiting}</div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>查询统计</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="text-sm">
                    <div>总查询数: {databaseStatus.queries.total.toLocaleString()}</div>
                    <div>平均查询时间: {databaseStatus.queries.avgTime}ms</div>
                    <div>慢查询数: {databaseStatus.queries.slowQueries}</div>
                    <div>慢查询阈值: {databaseStatus.queries.slowQueryThreshold}ms</div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>健康状态</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm">
                    <div>
                      状态: <Badge>{databaseStatus.health.status}</Badge>
                    </div>
                    <div>最后检查: {new Date(databaseStatus.health.lastCheck).toLocaleString('zh-CN')}</div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : null}
        </TabsContent>

        {/* 缓存 */}
        <TabsContent value="cache" className="space-y-4">
          {cacheLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : cacheStatus ? (
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>缓存状态</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="text-sm">
                    <div>
                      状态: <Badge>{cacheStatus.status}</Badge>
                    </div>
                    <div>命中率: {(cacheStatus.hitRate * 100).toFixed(1)}%</div>
                    <div>未命中率: {(cacheStatus.missRate * 100).toFixed(1)}%</div>
                    <div>总键数: {cacheStatus.totalKeys.toLocaleString()}</div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>内存使用</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="text-sm">
                    <div>已使用: {cacheStatus.memoryUsage.used} MB</div>
                    <div>最大: {cacheStatus.memoryUsage.max} MB</div>
                    <div>使用率: {cacheStatus.memoryUsage.percentage.toFixed(1)}%</div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>操作统计</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="text-sm">
                    <div>命中: {cacheStatus.operations.hits.toLocaleString()}</div>
                    <div>未命中: {cacheStatus.operations.misses.toLocaleString()}</div>
                    <div>设置: {cacheStatus.operations.sets.toLocaleString()}</div>
                    <div>删除: {cacheStatus.operations.deletes.toLocaleString()}</div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>其他</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm">
                    <div>驱逐次数: {cacheStatus.evictions}</div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : null}
        </TabsContent>
      </Tabs>
    </div>
  );
}
