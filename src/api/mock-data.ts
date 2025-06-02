// /src/api/mock-data.ts
import { ArtCardProps } from '../types';

export const mockArtCards: ArtCardProps[] = [
  {
    id: '1',
    cardCategory: { iconName: 'walk-outline', text: '提议' },
    title: '周末去阳明山走走',
    timestamp: '昨天',
    users: [
      { name: 'Sarah', avatarUrl: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face' },
      { name: 'Alex', avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face' },
    ],
    statusIndicatorColor: '#FFA500', // 橙色表示pending
    imageUrl: 'https://images.unsplash.com/photo-1506748686214-e9df14d4d9d0?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80',
    height: 180,
    // 新增字段
    initiatorId: 'user-002', // Sarah发起的
    receiverId: 'user-001', // 发给Alex的
    status: 'pending', // 等待回应
    type: 'proposal',
    // 添加详细信息用于测试
    description: '天气不错，想去阳明山走走。可以看看花季，呼吸新鲜空气，还能拍些美美的照片。你觉得怎么样？',
    location: '阳明山国家公园',
    date: '2025年1月26日（周日）',
    time: '上午9:00',
    options: ['竹子湖看花', '擎天岗草原', '冷水坑泡脚', '小油坑看硫磺'],
  },
  {
    id: '2',
    cardCategory: { iconName: 'navigate-circle-outline', text: '旅行计划' },
    title: '下个月去台南玩3天, 探索古城美食, 还要去海边散步看日落, 想想就很激动!',
    timestamp: '上上周',
    users: [
      { name: 'Alex', avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face' },
      { name: 'Mike', avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face' },
      { name: 'Sarah', avatarUrl: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face' },
    ],
    statusIndicatorColor: '#FFD700', // 黄色表示settled
    imageUrl: 'https://images.unsplash.com/photo-1528127269061-b9f98e16e3c4?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80',
    height: 250,
    // 新增字段
    initiatorId: 'user-001', // Alex发起的
    receiverId: 'user-003', // 发给Mike的
    status: 'settled', // 已同意
    type: 'plan',
    description: '台南古城之旅，品尝道地美食，感受历史文化气息。',
    location: '台南市',
    date: '2025年2月15-17日',
    time: '三天两夜',
  },
  {
    id: '3',
    cardCategory: { iconName: 'restaurant-outline', text: '心愿' },
    title: '我想吃火锅！一定要去那家新开的, 听说评价超高!',
    timestamp: '2小时前',
    users: [{ name: 'Alex', avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face' }],
    statusIndicatorColor: '#E0E0E0', // 灰色表示draft
    backgroundColor: 'rgba(100, 150, 200, 0.3)',
    height: 220,
    // 新增字段
    initiatorId: 'user-001', // Alex的心愿
    receiverId: null, // 心愿没有特定接收者
    status: 'draft', // 草稿状态
    type: 'wish',
    description: '最近特别想吃火锅，听说新开的那家店评价很好，想去试试！',
    location: '市中心新开的火锅店',
  },
  {
    id: '4',
    cardCategory: { iconName: 'laptop-outline', text: '技术探索' },
    title: '一起研究那个新的开源项目怎么样? 感觉会很有趣, 而且对我们的技能提升也大有裨益。',
    timestamp: '5小时前',
    users: [
      { name: 'Mike', avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face' },
      { name: 'Alex', avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face' },
    ],
    statusIndicatorColor: '#FF6B6B', // 红色表示declined
    backgroundColor: 'rgba(120, 120, 120, 0.3)',
    height: 240,
    // 新增字段
    initiatorId: 'user-003', // Mike发起的
    receiverId: 'user-001', // 发给Alex的
    status: 'declined', // 已拒绝
    type: 'proposal',
    description: '发现了一个很有趣的开源项目，想一起学习研究。',
  },
  {
    id: '5',
    cardCategory: { iconName: 'ticket-outline', text: '娱乐' },
    title: '周末的电影票已经买好了!《沙丘2》',
    timestamp: '3天前',
    users: [{ name: 'Sarah', avatarUrl: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face' }],
    statusIndicatorColor: '#E0E0E0',
    imageUrl: 'https://images.unsplash.com/photo-1598899134739-24c46f58b8c0?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80',
    height: 200,
    // 新增字段
    initiatorId: 'user-002', // Sarah的
    receiverId: null,
    status: 'draft',
    type: 'plan',
  },
  {
    id: '6',
    cardCategory: { iconName: 'color-palette-outline', text: '艺术创作' },
    title: '新的画作完成了，主题是都市霓虹。欢迎大家评价！',
    timestamp: '刚刚',
    users: [
      { name: 'Alex', avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face' },
      { name: 'Sarah', avatarUrl: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face' },
    ],
    statusIndicatorColor: '#FFD700',
    imageUrl: 'https://images.unsplash.com/photo-1534430480872-3498386e7856?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80',
    height: 270,
    // 新增字段
    initiatorId: 'user-001', // Alex发起的
    receiverId: 'user-002', // 发给Sarah的
    status: 'settled', // 已同意
    type: 'proposal',
  },
]; 