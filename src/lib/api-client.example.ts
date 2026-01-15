/**
 * API 客户端使用示例
 * 
 * 这个文件展示了如何使用API服务
 */

import {
  getUsers,
  getUserById,
  updateUser,
} from '@/services/users';

import {
  getContactMessages,
  getContactMessageById,
  updateMessageStatus,
  replyMessage,
} from '@/services/contact';

import {
  getReadinessPacks,
  getReadinessPackById,
  createReadinessPack,
  updateReadinessPack,
  deleteReadinessPack,
} from '@/services/readiness';

import {
  updatePlace,
  deletePlace,
} from '@/services/places';

// ==================== 用户管理示例 ====================

// 获取用户列表
async function exampleGetUsers() {
  const result = await getUsers({
    page: 1,
    limit: 20,
    search: 'example@email.com',
    emailVerified: true,
  });

  if (result) {
    console.log('用户列表:', result.users);
    console.log('总数:', result.total);
  }
}

// 获取用户详情
async function exampleGetUser() {
  const userId = '550e8400-e29b-41d4-a716-446655440000';
  const user = await getUserById(userId);
  
  if (user) {
    console.log('用户信息:', user);
  }
}

// 更新用户信息
async function exampleUpdateUser() {
  const userId = '550e8400-e29b-41d4-a716-446655440000';
  const updatedUser = await updateUser(userId, {
    displayName: '新用户名',
    emailVerified: true,
  });
  
  if (updatedUser) {
    console.log('更新成功:', updatedUser);
  }
}

// ==================== 联系消息管理示例 ====================

// 获取消息列表
async function exampleGetMessages() {
  const result = await getContactMessages({
    page: 1,
    limit: 20,
    status: 'pending',
  });

  if (result) {
    console.log('消息列表:', result.messages);
  }
}

// 更新消息状态
async function exampleUpdateMessageStatus() {
  const messageId = 'msg-uuid';
  const message = await updateMessageStatus(messageId, {
    status: 'read',
  });
  
  if (message) {
    console.log('状态更新成功:', message);
  }
}

// 回复消息
async function exampleReplyMessage() {
  const messageId = 'msg-uuid';
  const reply = await replyMessage(messageId, {
    reply: '感谢您的反馈，我们会尽快处理。',
  });
  
  if (reply) {
    console.log('回复成功:', reply);
  }
}

// ==================== 准备度Pack管理示例 ====================

// 获取Pack列表
async function exampleGetPacks() {
  const result = await getReadinessPacks({
    page: 1,
    limit: 20,
    countryCode: 'IS',
    isActive: true,
  });

  if (result) {
    console.log('Pack列表:', result.packs);
  }
}

// 创建Pack
async function exampleCreatePack() {
  const newPack = await createReadinessPack({
    pack: {
      packId: 'pack.is.iceland',
      destinationId: 'IS-ICELAND',
      displayName: {
        en: 'Iceland Travel Readiness',
        zh: '冰岛旅行准备度',
      },
      version: '1.0.0',
      lastReviewedAt: new Date().toISOString(),
      geo: {
        countryCode: 'IS',
        region: 'Iceland',
        city: 'Reykjavik',
        lat: 64.1265,
        lng: -21.8174,
      },
      supportedSeasons: ['summer', 'winter'],
      rules: [],
      checklists: [],
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  });
  
  if (newPack) {
    console.log('创建成功:', newPack);
  }
}

// 更新Pack
async function exampleUpdatePack() {
  const packId = 'pack.is.iceland';
  
  // 只更新状态
  const updatedPack1 = await updateReadinessPack(packId, {
    isActive: false,
  });
  
  // 更新Pack数据
  const updatedPack2 = await updateReadinessPack(packId, {
    pack: {
      // 完整的Pack数据
      packId: 'pack.is.iceland',
      destinationId: 'IS-ICELAND',
      displayName: {
        en: 'Updated Iceland Travel Readiness',
        zh: '更新后的冰岛旅行准备度',
      },
      version: '1.1.0',
      lastReviewedAt: new Date().toISOString(),
      geo: {
        countryCode: 'IS',
        region: 'Iceland',
        city: 'Reykjavik',
        lat: 64.1265,
        lng: -21.8174,
      },
      supportedSeasons: ['summer', 'winter', 'spring'],
      rules: [],
      checklists: [],
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  });
}

// 删除Pack
async function exampleDeletePack() {
  const packId = 'pack.is.iceland';
  const result = await deleteReadinessPack(packId);
  
  if (result) {
    console.log('删除成功:', result.message);
  }
}

// ==================== 地点管理示例 ====================

// 更新地点
async function exampleUpdatePlace() {
  const placeId = 123;
  const updatedPlace = await updatePlace(placeId, {
    nameCN: '新中文名称',
    rating: 4.5,
    metadata: {
      openingHours: {
        monday: '09:00-18:00',
        tuesday: '09:00-18:00',
      },
    },
  });
  
  if (updatedPlace) {
    console.log('更新成功:', updatedPlace);
  }
}

// 删除地点
async function exampleDeletePlace() {
  const placeId = 123;
  const result = await deletePlace(placeId);
  
  if (result) {
    console.log('删除成功:', result.message);
  }
}
