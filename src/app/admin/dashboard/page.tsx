'use client';

import { useEffect, useState } from 'react';
import { Users, MessageSquare, Package, MapPin } from 'lucide-react';
import { getUsers } from '@/services/users';
import { getContactMessages } from '@/services/contact';
import { getReadinessPacks } from '@/services/readiness';
import { getPlaces } from '@/services/places';

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    pendingMessages: 0,
    activePacks: 0,
    totalPlaces: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const [usersRes, messagesRes, packsRes, placesRes] = await Promise.all([
          getUsers({ page: 1, limit: 1 }),
          getContactMessages({ page: 1, limit: 1, status: 'pending' }),
          getReadinessPacks({ page: 1, limit: 1, isActive: true }),
          getPlaces({ page: 1, limit: 1 }),
        ]);

        setStats({
          totalUsers: usersRes?.total || 0,
          pendingMessages: messagesRes?.total || 0,
          activePacks: packsRes?.total || 0,
          totalPlaces: placesRes?.total || 0,
        });
      } catch (error) {
        console.error('加载统计数据失败:', error);
      } finally {
        setLoading(false);
      }
    }

    loadStats();
  }, []);

  const statCards = [
    {
      title: '用户总数',
      value: stats.totalUsers,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: '待处理消息',
      value: stats.pendingMessages,
      icon: MessageSquare,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
    {
      title: '活跃Pack',
      value: stats.activePacks,
      icon: Package,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: '地点总数',
      value: stats.totalPlaces,
      icon: MapPin,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">加载中...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">仪表盘</h1>
        <p className="text-muted-foreground mt-2">欢迎回来，这里是系统概览</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.title}
              className="rounded-lg border bg-card p-6 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {card.title}
                  </p>
                  <p className="text-2xl font-bold mt-2">{card.value}</p>
                </div>
                <div className={`rounded-full p-3 ${card.bgColor}`}>
                  <Icon className={`h-6 w-6 ${card.color}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">最近消息</h2>
          <p className="text-sm text-muted-foreground">
            暂无最近消息
          </p>
        </div>
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">快速操作</h2>
          <div className="space-y-2">
            <a
              href="/admin/messages"
              className="block text-sm text-primary hover:underline"
            >
              查看待处理消息 →
            </a>
            <a
              href="/admin/readiness/new"
              className="block text-sm text-primary hover:underline"
            >
              创建新Pack →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
