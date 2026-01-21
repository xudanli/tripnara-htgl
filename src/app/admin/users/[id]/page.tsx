'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Save, Trash2, User as UserIcon, Heart, Bookmark, MapPin } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { getUserDetail, updateUser, deleteUser } from '@/services/users';
import type { UserDetail, UpdateUserRequest } from '@/types/api';

export default function UserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;

  const [user, setUser] = useState<UserDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
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
      const userData = await getUserDetail(userId);
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
        setUser((prev) => prev ? { ...prev, ...updated } : null);
        alert('保存成功');
      }
    } catch (error) {
      console.error('保存失败:', error);
      alert('保存失败，请重试');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm('确定要删除此用户吗？此操作不可撤销，将同时删除用户的所有关联数据（偏好设置、行程协作、收藏、点赞等）。')) {
      return;
    }

    setDeleting(true);
    try {
      const result = await deleteUser(userId);
      if (result?.deleted) {
        alert('用户已删除');
        router.push('/admin/users');
      } else {
        alert('删除失败，请重试');
      }
    } catch (error) {
      console.error('删除失败:', error);
      alert('删除失败，请重试');
    } finally {
      setDeleting(false);
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
      <div className="flex items-center justify-between">
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
        <Button
          variant="destructive"
          onClick={handleDelete}
          disabled={deleting}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          {deleting ? '删除中...' : '删除用户'}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 用户统计卡片 */}
        <div className="lg:col-span-1 space-y-4">
          {/* 头像和基本信息 */}
          <div className="rounded-lg border bg-card p-6 shadow-sm">
            <div className="flex flex-col items-center text-center">
              {user.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.displayName || '用户头像'}
                  className="w-24 h-24 rounded-full object-cover mb-4"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mb-4">
                  <UserIcon className="w-12 h-12 text-muted-foreground" />
                </div>
              )}
              <h2 className="text-xl font-semibold">{user.displayName || '未设置名称'}</h2>
              <p className="text-sm text-muted-foreground">{user.email || '未设置邮箱'}</p>
              <div className="mt-2">
                <span
                  className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                    user.emailVerified
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {user.emailVerified ? '已验证' : '未验证'}
                </span>
                {user.googleSub && (
                  <span className="ml-2 inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800">
                    Google 账户
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* 用户活动统计 */}
          <div className="rounded-lg border bg-card p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-4">用户活动</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>行程数量</span>
                </div>
                <span className="font-semibold">{user.tripCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Bookmark className="h-4 w-4" />
                  <span>收藏数量</span>
                </div>
                <span className="font-semibold">{user.collectionCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Heart className="h-4 w-4" />
                  <span>点赞数量</span>
                </div>
                <span className="font-semibold">{user.likeCount}</span>
              </div>
            </div>
          </div>

          {/* 用户偏好设置 */}
          {user.profile && (
            <div className="rounded-lg border bg-card p-6 shadow-sm">
              <h3 className="text-lg font-semibold mb-4">偏好设置</h3>
              {user.profile.preferences ? (
                <div className="space-y-3 text-sm">
                  {user.profile.preferences.preferredAttractionTypes?.length ? (
                    <div>
                      <span className="text-muted-foreground">喜好类型：</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {user.profile.preferences.preferredAttractionTypes.map((type) => (
                          <span
                            key={type}
                            className="inline-flex items-center rounded-full px-2 py-0.5 text-xs bg-primary/10 text-primary"
                          >
                            {type}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : null}
                  {user.profile.preferences.dietaryRestrictions?.length ? (
                    <div>
                      <span className="text-muted-foreground">饮食限制：</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {user.profile.preferences.dietaryRestrictions.map((diet) => (
                          <span
                            key={diet}
                            className="inline-flex items-center rounded-full px-2 py-0.5 text-xs bg-orange-100 text-orange-800"
                          >
                            {diet}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : null}
                  {user.profile.preferences.travelPreferences && (
                    <div>
                      <span className="text-muted-foreground">旅行偏好：</span>
                      <div className="mt-1 space-y-1">
                        {user.profile.preferences.travelPreferences.pace && (
                          <div>节奏: {user.profile.preferences.travelPreferences.pace}</div>
                        )}
                        {user.profile.preferences.travelPreferences.budget && (
                          <div>预算: {user.profile.preferences.travelPreferences.budget}</div>
                        )}
                        {user.profile.preferences.travelPreferences.accommodation && (
                          <div>住宿: {user.profile.preferences.travelPreferences.accommodation}</div>
                        )}
                      </div>
                    </div>
                  )}
                  {user.profile.preferences.nationality && (
                    <div>
                      <span className="text-muted-foreground">国籍：</span>
                      {user.profile.preferences.nationality}
                    </div>
                  )}
                  {user.profile.preferences.tags?.length ? (
                    <div>
                      <span className="text-muted-foreground">标签：</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {user.profile.preferences.tags.map((tag) => (
                          <span
                            key={tag}
                            className="inline-flex items-center rounded-full px-2 py-0.5 text-xs bg-gray-100 text-gray-800"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">暂无偏好设置</p>
              )}
            </div>
          )}
        </div>

        {/* 编辑表单 */}
        <div className="lg:col-span-2">
          <div className="rounded-lg border bg-card p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-6">编辑信息</h3>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">用户ID</label>
                <input
                  type="text"
                  value={user.id}
                  disabled
                  className="w-full px-3 py-2 border rounded-md bg-muted font-mono text-sm"
                />
              </div>

              {user.googleSub && (
                <div>
                  <label className="block text-sm font-medium mb-2">Google Sub</label>
                  <input
                    type="text"
                    value={user.googleSub}
                    disabled
                    className="w-full px-3 py-2 border rounded-md bg-muted font-mono text-sm"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-2">显示名称</label>
                <input
                  type="text"
                  value={formData.displayName}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, displayName: e.target.value }))
                  }
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="请输入显示名称"
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
                  placeholder="请输入邮箱"
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
                  placeholder="请输入头像URL"
                />
                {formData.avatarUrl && (
                  <div className="mt-2">
                    <img
                      src={formData.avatarUrl}
                      alt="头像预览"
                      className="w-16 h-16 rounded-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                <div>
                  <span>创建时间：</span>
                  {new Date(user.createdAt).toLocaleString('zh-CN')}
                </div>
                <div>
                  <span>更新时间：</span>
                  {new Date(user.updatedAt).toLocaleString('zh-CN')}
                </div>
              </div>

              <div className="flex gap-4 pt-4 border-t">
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
      </div>
    </div>
  );
}
