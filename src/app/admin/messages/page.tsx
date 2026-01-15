'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Search, Eye, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getContactMessages } from '@/services/contact';
import type { ContactMessage, GetContactMessagesParams } from '@/types/api';

export default function MessagesPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [params, setParams] = useState<GetContactMessagesParams>({
    page: 1,
    limit: 20,
  });
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadMessages();
  }, [params]);

  async function loadMessages() {
    setLoading(true);
    try {
      const result = await getContactMessages(params);
      if (result) {
        setMessages(result.messages);
        setTotal(result.total);
        setTotalPages(result.totalPages);
      }
    } catch (error) {
      console.error('加载消息列表失败:', error);
    } finally {
      setLoading(false);
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

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    read: 'bg-blue-100 text-blue-800',
    replied: 'bg-green-100 text-green-800',
    resolved: 'bg-gray-100 text-gray-800',
  };

  const statusLabels = {
    pending: '待处理',
    read: '已读',
    replied: '已回复',
    resolved: '已解决',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">联系消息管理</h1>
          <p className="text-muted-foreground mt-2">管理用户反馈和联系消息</p>
        </div>
      </div>

      {/* 搜索和筛选 */}
      <div className="flex gap-4 items-center">
        <div className="flex-1 flex gap-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="搜索消息内容..."
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
          value={params.status || 'all'}
          onChange={(e) =>
            setParams((prev) => ({
              ...prev,
              page: 1,
              status: e.target.value === 'all' ? undefined : e.target.value as any,
            }))
          }
        >
          <option value="all">全部状态</option>
          <option value="pending">待处理</option>
          <option value="read">已读</option>
          <option value="replied">已回复</option>
          <option value="resolved">已解决</option>
        </select>
      </div>

      {/* 消息列表 */}
      <div className="rounded-lg border bg-card shadow-sm">
        {loading ? (
          <div className="p-8 text-center text-muted-foreground">加载中...</div>
        ) : messages.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">暂无消息</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-medium">ID</th>
                    <th className="px-6 py-3 text-left text-sm font-medium">消息内容</th>
                    <th className="px-6 py-3 text-left text-sm font-medium">状态</th>
                    <th className="px-6 py-3 text-left text-sm font-medium">图片数</th>
                    <th className="px-6 py-3 text-left text-sm font-medium">创建时间</th>
                    <th className="px-6 py-3 text-right text-sm font-medium">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {messages.map((message) => (
                    <tr key={message.id} className="hover:bg-muted/50">
                      <td className="px-6 py-4 text-sm font-mono">{message.id.slice(0, 8)}...</td>
                      <td className="px-6 py-4 text-sm">
                        <div className="max-w-md truncate">
                          {message.message || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                            statusColors[message.status]
                          }`}
                        >
                          {statusLabels[message.status]}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {message.images?.length || 0}
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        {message.createdAt
                          ? new Date(message.createdAt).toLocaleDateString('zh-CN')
                          : '-'}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link href={`/admin/messages/${message.id}`}>
                          <Button variant="ghost" size="icon">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
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
