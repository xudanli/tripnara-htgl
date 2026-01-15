'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { getUserById, updateUser } from '@/services/users';
import type { User, UpdateUserRequest } from '@/types/api';

export default function UserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<UpdateUserRequest>({
    displayName: '',
    email: '',
    emailVerified: false,
    avatarUrl: '',
  });

  useEffect(() => {
    if (userId) {
      loadUser();
    }
  }, [userId]);

  async function loadUser() {
    setLoading(true);
    try {
      const userData = await getUserById(userId);
      if (userData) {
        setUser(userData);
        setFormData({
          displayName: userData.displayName || '',
          email: userData.email || '',
          emailVerified: userData.emailVerified || false,
          avatarUrl: userData.avatarUrl || '',
        });
      }
    } catch (error) {
      console.error('加载用户详情失败:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    try {
      const updated = await updateUser(userId, formData);
      if (updated) {
        setUser(updated);
        alert('保存成功');
      }
    } catch (error) {
      console.error('保存失败:', error);
      alert('保存失败，请重试');
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

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">用户不存在</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/users">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">用户详情</h1>
          <p className="text-muted-foreground mt-2">编辑用户信息</p>
        </div>
      </div>

      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">用户ID</label>
            <input
              type="text"
              value={user.id}
              disabled
              className="w-full px-3 py-2 border rounded-md bg-muted"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">显示名称</label>
            <input
              type="text"
              value={formData.displayName}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, displayName: e.target.value }))
              }
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">邮箱</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, email: e.target.value }))
              }
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">邮箱验证状态</label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.emailVerified}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    emailVerified: e.target.checked,
                  }))
                }
                className="rounded"
              />
              <span className="text-sm">已验证</span>
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">头像URL</label>
            <input
              type="url"
              value={formData.avatarUrl}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, avatarUrl: e.target.value }))
              }
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>

          <div className="flex gap-4 pt-4">
            <Button onClick={handleSave} disabled={saving}>
              <Save className="mr-2 h-4 w-4" />
              {saving ? '保存中...' : '保存'}
            </Button>
            <Button
              variant="outline"
              onClick={() => router.back()}
            >
              取消
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
