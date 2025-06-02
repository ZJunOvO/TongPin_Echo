import React from 'react';
import { Platform } from 'react-native';
import { BlurView } from 'expo-blur';

// 定义Props接口
interface AppBlurViewProps {
  blurType?: 'light' | 'dark';
  blurAmount?: number; // expo-blur使用intensity属性
  children?: React.ReactNode;
  style?: any;
}

const AppBlurView: React.FC<AppBlurViewProps> = ({ 
  style, 
  blurType = 'light', 
  blurAmount = 10, 
  children, 
  ...props 
}) => {
  // expo-blur使用intensity而不是blurAmount
  // 将blurAmount转换为expo-blur的intensity (0-100)
  // 提高最大值以获得更强的毛玻璃效果
  const intensity = Math.min(Math.max(blurAmount * 8, 0), 100); // 从 *10 改为 *8，并将最大值保持在100
  
  // expo-blur的tint属性对应blurType
  const tint = blurType === 'dark' ? 'dark' : 'light';

  return (
    <BlurView 
      style={style} 
      intensity={intensity}
      tint={tint}
      // 为Android添加实验性模糊方法以获得更好的效果
      experimentalBlurMethod={Platform.OS === 'android' ? 'dimezisBlurView' : undefined}
      {...props}
    >
      {children}
    </BlurView>
  );
};

export default AppBlurView; 