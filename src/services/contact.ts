/**
 * 联系消息管理 API 服务
 */

import { apiGet, apiPut, apiPost } from '@/lib/api-client';
import type {
  ContactMessage,
  GetContactMessagesParams,
  GetContactMessagesResponse,
  UpdateMessageStatusRequest,
  ReplyMessageRequest,
  ReplyMessageResponse,
} from '@/types/api';

/**
 * 获取消息列表
 */
export async function getContactMessages(
  params?: GetContactMessagesParams
): Promise<GetContactMessagesResponse | null> {
  const response = await apiGet<GetContactMessagesResponse>(
    '/contact/admin/messages',
    params
  );
  
  if (response.success) {
    return response.data;
  }
  
  console.error('获取消息列表失败:', response.error);
  return null;
}

/**
 * 获取消息详情
 */
export async function getContactMessageById(
  id: string
): Promise<ContactMessage | null> {
  const response = await apiGet<ContactMessage>(
    `/contact/admin/messages/${id}`
  );
  
  if (response.success) {
    return response.data;
  }
  
  console.error('获取消息详情失败:', response.error);
  return null;
}

/**
 * 更新消息状态
 */
export async function updateMessageStatus(
  id: string,
  data: UpdateMessageStatusRequest
): Promise<ContactMessage | null> {
  const response = await apiPut<ContactMessage>(
    `/contact/admin/messages/${id}/status`,
    data
  );
  
  if (response.success) {
    return response.data;
  }
  
  console.error('更新消息状态失败:', response.error);
  return null;
}

/**
 * 回复消息
 */
export async function replyMessage(
  id: string,
  data: ReplyMessageRequest
): Promise<ReplyMessageResponse | null> {
  const response = await apiPost<ReplyMessageResponse>(
    `/contact/admin/messages/${id}/reply`,
    data
  );
  
  if (response.success) {
    return response.data;
  }
  
  console.error('回复消息失败:', response.error);
  return null;
}
