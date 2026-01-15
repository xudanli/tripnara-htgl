'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Search, Edit, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getUsers } from '@/services/users';
import type { User, GetUsersParams } from '@/types/api';

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [params, setParams] = useState<GetUsersParams>({
    page: 1,
    limit: 20,
  });
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadUsers();
  }, [params]);

  async function loadUsers() {
    setLoading(true);
    try {
      const result = await getUsers(params);
      if (result) {
        setUsers(result.users);
        setTotal(result.total);
        setTotalPages(result.totalPages);
      }
    } catch (error) {
      console.error('加载用户列表失败:', error);
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">用户管理</h1>
          <p className="text-muted-foreground mt-2">管理系统中的所有用户</p>
        </div>
      </div>

      {/* 搜索和筛选 */}
      <div className="flex gap-4 items-center">
        <div className="flex-1 flex gap-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="搜索邮箱或显示名称..."
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
          value={params.emailVerified?.toString() || 'all'}
          onChange={(e) =>
            setParams((prev) => ({
              ...prev,
              page: 1,
              emailVerified:
                e.target.value === 'all'
                  ? undefined
                  : e.target.value === 'true',
            }))
          }
        >
          <option value="all">全部验证状态</option>
          <option value="true">已验证</option>
          <option value="false">未验证</option>
        </select>
      </div>

      {/* 用户列表 */}
      <div className="rounded-lg border bg-card shadow-sm">
        {loading ? (
          <div className="p-8 text-center text-muted-foreground">加载中...</div>
        ) : users.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">暂无用户</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-medium">ID</th>
                    <th className="px-6 py-3 text-left text-sm font-medium">邮箱</th>
                    <th className="px-6 py-3 text-left text-sm font-medium">显示名称</th>
                    <th className="px-6 py-3 text-left text-sm font-medium">验证状态</th>
                    <th className="px-6 py-3 text-left text-sm font-medium">创建时间</th>
                    <th className="px-6 py-3 text-right text-sm font-medium">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-muted/50">
                      <td className="px-6 py-4 text-sm font-mono">{user.id.slice(0, 8)}...</td>
                      <td className="px-6 py-4 text-sm">{user.email || '-'}</td>
                      <td className="px-6 py-4 text-sm">{user.displayName || '-'}</td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                            user.emailVerified
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {user.emailVerified ? '已验证' : '未验证'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        {user.createdAt
                          ? new Date(user.createdAt).toLocaleDateString('zh-CN')
                          : '-'}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <Link href={`/admin/users/${user.id}`}>
                            <Button variant="ghost" size="icon">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Link href={`/admin/users/${user.id}`}>
                            <Button variant="ghost" size="icon">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>
                        </div>
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
