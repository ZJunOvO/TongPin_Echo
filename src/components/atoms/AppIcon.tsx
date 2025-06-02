import React from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../state/ThemeContext';

type AppIconProps = {
  name: string;
  size?: number;
  color?: string;
};

const AppIcon = ({ name, size = 24, color }: AppIconProps) => {
  const { colors } = useTheme();
  // 如果没有从外部传入颜色，就使用主题中的默认图标颜色
  const iconColor = color || colors.icon; 

  return <Ionicons name={name} size={size} color={iconColor} />;
};

export default AppIcon; 