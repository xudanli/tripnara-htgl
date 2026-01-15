'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Send, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  getContactMessageById,
  updateMessageStatus,
  replyMessage,
} from '@/services/contact';
import type { ContactMessage } from '@/types/api';

export default function MessageDetailPage() {
  const params = useParams();
  const router = useRouter();
  const messageId = params.id as string;

  const [message, setMessage] = useState<ContactMessage | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [replyText, setReplyText] = useState('');

  useEffect(() => {
    if (messageId) {
      loadMessage();
    }
  }, [messageId]);

  async function loadMessage() {
    setLoading(true);
    try {
      const messageData = await getContactMessageById(messageId);
      if (messageData) {
        setMessage(messageData);
      }
    } catch (error) {
      console.error('加载消息详情失败:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleStatusChange(status: ContactMessage['status']) {
    setSaving(true);
    try {
      const updated = await updateMessageStatus(messageId, { status });
      if (updated) {
        setMessage(updated);
        alert('状态更新成功');
      }
    } catch (error) {
      console.error('更新状态失败:', error);
      alert('更新失败，请重试');
    } finally {
      setSaving(false);
    }
  }

  async function handleReply() {
    if (!replyText.trim()) {
      alert('请输入回复内容');
      return;
    }

    setSaving(true);
    try {
      const result = await replyMessage(messageId, { reply: replyText });
      if (result) {
        setMessage(result);
        setReplyText('');
        alert('回复成功');
      }
    } catch (error) {
      console.error('回复失败:', error);
      alert('回复失败，请重试');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">加载中...</div>
      </div>
    );
  }

  if (!message) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">消息不存在</div>
      </div>
    );
  }

  const statusOptions: Array<{ value: ContactMessage['status']; label: string }> = [
    { value: 'pending', label: '待处理' },
    { value: 'read', label: '已读' },
    { value: 'replied', label: '已回复' },
    { value: 'resolved', label: '已解决' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/messages">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">消息详情</h1>
          <p className="text-muted-foreground mt-2">查看和回复用户消息</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* 消息详情 */}
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">消息信息</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                消息ID
              </label>
              <p className="text-sm font-mono">{message.id}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                用户ID
              </label>
              <p className="text-sm">{message.userId || '匿名用户'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                状态
              </label>
              <select
                className="w-full px-3 py-2 border rounded-md"
                value={message.status}
                onChange={(e) =>
                  handleStatusChange(e.target.value as ContactMessage['status'])
                }
                disabled={saving}
              >
                {statusOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                消息内容
              </label>
              <div className="p-3 bg-muted rounded-md text-sm whitespace-pre-wrap">
                {message.message || '无内容'}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                创建时间
              </label>
              <p className="text-sm">
                {new Date(message.createdAt).toLocaleString('zh-CN')}
              </p>
            </div>
          </div>

          {/* 图片展示 */}
          {message.images && message.images.length > 0 && (
            <div className="mt-6">
              <label className="block text-sm font-medium text-muted-foreground mb-2">
                附件图片 ({message.images.length})
              </label>
              <div className="grid grid-cols-2 gap-2">
                {message.images.map((img) => (
                  <a
                    key={img.id}
                    href={img.fileUrl || `#`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block"
                  >
                    <img
                      src={img.fileUrl || '#'}
                      alt={img.fileName}
                      className="w-full h-32 object-cover rounded border"
                    />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 回复区域 */}
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">回复消息</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">回复内容</label>
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="输入回复内容..."
                className="w-full px-3 py-2 border rounded-md min-h-[200px]"
                disabled={saving}
              />
            </div>
            <Button
              onClick={handleReply}
              disabled={saving || !replyText.trim()}
              className="w-full"
            >
              <Send className="mr-2 h-4 w-4" />
              {saving ? '发送中...' : '发送回复'}
            </Button>

            {/* 快速状态操作 */}
            <div className="pt-4 border-t">
              <p className="text-sm font-medium mb-2">快速操作</p>
              <div className="flex flex-wrap gap-2">
                {statusOptions.map((opt) => (
                  <Button
                    key={opt.value}
                    variant="outline"
                    size="sm"
                    onClick={() => handleStatusChange(opt.value)}
                    disabled={saving || message.status === opt.value}
                  >
                    {opt.label}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
