import { ArtCardProps, CreateSignalData } from '../types';
import { mockArtCards } from './mock-data';

// 模拟API：获取所有信号
export const getSignals = async (): Promise<ArtCardProps[]> => {
  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, 300));
  
  return [...mockArtCards]; // 返回副本以避免直接修改原数组
};

// 模拟API：根据ID获取单个信号
export const getSignalById = async (signalId: string): Promise<ArtCardProps | null> => {
  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, 200));
  
  const signal = mockArtCards.find(signal => signal.id === signalId);
  return signal ? { ...signal } : null; // 返回副本或null
};

// 模拟API：响应信号（同意/拒绝）
export const respondToSignal = async (signalId: string, response: 'accepted' | 'rejected', remark?: string): Promise<ArtCardProps> => {
  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, 400));
  
  const signalIndex = mockArtCards.findIndex(signal => signal.id === signalId);
  if (signalIndex === -1) {
    throw new Error('Signal not found');
  }
  
  // 更新信号状态和备注
  mockArtCards[signalIndex] = {
    ...mockArtCards[signalIndex],
    status: response === 'accepted' ? 'settled' : 'declined',
    statusIndicatorColor: response === 'accepted' ? '#FFD700' : '#FF6B6B', // 金色或红色
    remark: remark, // 添加备注
  };
  
  return { ...mockArtCards[signalIndex] };
};

// 模拟API：创建新信号
export const createSignal = async (signalData: CreateSignalData): Promise<ArtCardProps> => {
  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // 创建新的信号对象
  const newSignal: ArtCardProps = {
    id: Date.now().toString(), // 简单的ID生成
    type: signalData.type,
    status: 'pending', // 新创建的信号默认为pending状态
    title: signalData.title,
    description: signalData.description,
    options: signalData.options,
    location: signalData.location,
    date: signalData.date,
    time: signalData.time,
    cardCategory: getCardCategoryByType(signalData.type),
    timestamp: '刚刚',
    users: [
      { name: '我', avatarUrl: 'https://i.pravatar.cc/150?u=currentuser' }
    ],
    height: Math.floor(Math.random() * 100) + 180, // 随机高度用于瀑布流
    statusIndicatorColor: '#FFFFFF', // pending状态使用白色指示点
    backgroundColor: getBackgroundColorByType(signalData.type),
  };
  
  // 将新信号添加到数组开头
  mockArtCards.unshift(newSignal);
  
  return newSignal;
};

// 根据信号类型获取卡片分类信息
function getCardCategoryByType(type: string): { iconName: string; text: string } {
  switch (type) {
    case 'proposal':
      return { iconName: 'chatbubble-ellipses-outline', text: '提议' };
    case 'wish':
      return { iconName: 'star-outline', text: '心愿' };
    case 'plan':
      return { iconName: 'navigate-circle-outline', text: '计划' };
    case 'signal':
      return { iconName: 'radio-outline', text: '信号' };
    default:
      return { iconName: 'chatbubble-ellipses-outline', text: '提议' };
  }
}

// 根据信号类型获取背景颜色
function getBackgroundColorByType(type: string): string {
  switch (type) {
    case 'proposal':
      return 'rgba(64, 156, 255, 0.3)'; // 蓝色系
    case 'wish':
      return 'rgba(255, 193, 64, 0.3)'; // 金色系
    case 'plan':
      return 'rgba(64, 255, 156, 0.3)'; // 绿色系
    case 'signal':
      return 'rgba(156, 64, 255, 0.3)'; // 紫色系
    default:
      return 'rgba(64, 156, 255, 0.3)';
  }
} 