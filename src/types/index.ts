export interface ArtCardProps {
  id: string;
  type?: 'proposal' | 'wish' | 'plan' | 'signal' | 'entertainment' | 'art' | 'tech'; // 新增：信号类型
  status?: 'pending' | 'accepted' | 'rejected' | 'completed' | 'settled' | 'declined' | 'draft'; // 扩展状态值
  imageUrl?: string; // 将 imageUrl 设为可选，因为有些卡片可能没有背景图，只有纯色背景和内容
  title: string;
  cardCategory: { // 新增：卡片顶部的分类图标和文字
    iconName: string; // Ionicons 图标名称
    text: string;
  };
  timestamp: string; // 新增：时间戳，例如 "昨天", "2小时前"
  users: Array<{ // 修改：支持多个用户头像
    name: string;
    avatarUrl: string;
  }>;
  height: number; // For masonry layout
  statusIndicatorColor?: string; // 新增：状态指示点颜色 (可选)
  backgroundColor?: string; // 新增：卡片背景颜色 (可选, 用于无 imageUrl 的情况)
  description?: string; // 新增：详细描述
  options?: string[]; // 新增：提议选项
  location?: string; // 新增：地点信息
  date?: string; // 新增：日期
  time?: string; // 新增：时间
  // 新增用户相关字段
  initiatorId?: string; // 发起者ID
  receiverId?: string | null; // 接收者ID，null表示没有特定接收者
  remark?: string; // 新增：备注信息
}

// 新增：创建信号的数据接口
export interface CreateSignalData {
  title: string;
  description?: string;
  options?: string[];
  location?: string;
  date?: string;
  time?: string;
  type: 'proposal' | 'wish' | 'plan' | 'signal';
} 