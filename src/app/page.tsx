import { redirect } from 'next/navigation';

export default function Home() {
  // 重定向到管理后台首页
  redirect('/admin/dashboard');
}
