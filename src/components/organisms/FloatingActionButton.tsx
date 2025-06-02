import React from 'react';
import { View, StyleSheet, Pressable, Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
  runOnJS,
  withTiming,
} from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useUIStore } from '../../state/uiStore';
import { useTheme } from '../../state/ThemeContext';
import AppIcon from '../atoms/AppIcon';
import { spacing } from '../../styles/theme';
import { RootStackParamList } from '../../navigation/AppNavigator';

// 定义导航类型
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface FloatingActionButtonProps {}

const FloatingActionButton: React.FC<FloatingActionButtonProps> = () => {
  const { colors } = useTheme();
  const { isFabVisible, setFabVisible } = useUIStore();
  const navigation = useNavigation<NavigationProp>();
  const isExpanded = useSharedValue(0);
  
  // 监听导航状态变化，在模态页面中隐藏FAB
  React.useEffect(() => {
    const unsubscribe = navigation.addListener('state', (e) => {
      const routes = e?.data?.state?.routes;
      if (routes && routes.length > 0) {
        const currentRoute = routes[routes.length - 1];
        const isModal = currentRoute.name !== 'MainApp';
        
        if (isModal) {
          // 在模态页面中隐藏FAB并收起展开状态
          setFabVisible(false);
          isExpanded.value = 0;
        } else {
          // 在主页面中显示FAB
          setFabVisible(true);
        }
      }
    });

    return unsubscribe;
  }, [navigation, setFabVisible]);
  
  // 触觉反馈函数
  const triggerHaptic = () => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  };
  
  // 导航函数，处理动画序列
  const navigateWithAnimation = (screenName: keyof RootStackParamList) => {
    triggerHaptic();
    
    // 先收起FAB
    toggleExpanded();
    
    // 缩短延迟时间，配合200ms的底部滑入动画
    setTimeout(() => {
      // 使用类型安全的导航方法
      switch (screenName) {
        case 'CreateProposalModal':
          navigation.navigate('CreateProposalModal');
          break;
        case 'CreateWishModal':
          navigation.navigate('CreateWishModal');
          break;
        case 'CreatePlanModal':
          navigation.navigate('CreatePlanModal');
          break;
        case 'CreateSignalModal':
          navigation.navigate('CreateSignalModal');
          break;
        default:
          break;
      }
    }, 120); // 缩短到120ms，更快的响应时间
  };
  
  // 子按钮配置
  const subButtons = [
    { 
      icon: 'bulb-outline', 
      label: '提议',
      action: () => {
        // TODO v1.0: 实现提议创建的完整业务逻辑和后端交互
        navigateWithAnimation('CreateProposalModal');
      }
    },
    { 
      icon: 'heart-outline', 
      label: '心愿',
      action: () => {
        // TODO v1.0: 实现心愿创建的完整业务逻辑和后端交互
        navigateWithAnimation('CreateWishModal');
      }
    },
    { 
      icon: 'list-outline', 
      label: '计划',
      action: () => {
        // TODO v1.0: 实现计划创建的完整业务逻辑和后端交互
        navigateWithAnimation('CreatePlanModal');
      }
    },
    { 
      icon: 'camera-outline', 
      label: '拍照',
      action: () => {
        // TODO v1.0: 实现拍照功能，包括图片上传和信号创建
        triggerHaptic();
        console.log('点击了拍照');
        toggleExpanded();
      }
    },
    { 
      icon: 'add-circle-outline', 
      label: '更多',
      action: () => {
        // TODO v1.0: 实现更多功能菜单，如语音录制、位置分享等
        triggerHaptic();
        console.log('点击了更多');
        toggleExpanded();
      }
    },
  ];

  const toggleExpanded = () => {
    triggerHaptic();
    isExpanded.value = withSpring(isExpanded.value === 0 ? 1 : 0, {
      damping: 30, // 进一步增加阻尼，让收起更稳定
      stiffness: 400, // 增加刚度，让动画更快完成
      mass: 0.6, // 减少质量，让动画更轻快
    });
  };

  // FAB可见性动画 - 优化性能
  const fabAnimatedStyle = useAnimatedStyle(() => {
    const translateYValue = isFabVisible 
      ? withTiming(0, { duration: 200 }) // 缩短显示时间
      : withTiming(80, { duration: 150 }); // 缩短隐藏时间
  
    const opacityValue = isFabVisible 
      ? withTiming(1, { duration: 200 }) // 缩短显示时间
      : withTiming(0, { duration: 150 }); // 缩短隐藏时间
  
    return {
      transform: [{ translateY: translateYValue }],
      opacity: opacityValue,
      pointerEvents: isFabVisible ? 'auto' : 'none',
    };
  });

  // 主按钮样式动画，优化性能
  const mainButtonAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          rotate: `${interpolate(isExpanded.value, [0, 1], [0, 45])}deg`,
        },
      ],
      elevation: isFabVisible ? 10 : 0, // 根据FAB可见性调整elevation
      shadowOpacity: isFabVisible ? 0.3 : 0, // 同时调整阴影透明度
    };
  });

  // 子按钮动画样式生成器 - 优化性能
  const getSubButtonAnimatedStyle = (index: number) => {
    return useAnimatedStyle(() => {
      // 5个按钮：从左下到左上的扇形布局
      const angles = [-270, -225, -180, -135, -90]; // 扇形角度分布
      const angle = angles[index] || -90;
      const radius = 85; // 稍微增大半径以适应5个按钮
      
      const translateX = interpolate(
        isExpanded.value,
        [0, 1],
        [0, Math.cos((angle * Math.PI) / 180) * radius]
      );
      
      const translateY = interpolate(
        isExpanded.value,
        [0, 1],
        [0, Math.sin((angle * Math.PI) / 180) * radius]
      );

      // 优化透明度和缩放动画
      const opacity = withTiming(
        interpolate(isExpanded.value, [0, 0.5, 1], [0, 0.8, 1]),
        { duration: 120 } // 缩短动画时间
      );
      const scale = withSpring(
        interpolate(isExpanded.value, [0, 0.7, 1], [0, 0.9, 1]),
        { damping: 20, stiffness: 400 } // 优化弹簧参数
      );

      return {
        transform: [
          { translateX },
          { translateY },
          { scale },
        ],
        opacity,
      };
    });
  };

  // 背景遮罩动画 - 优化性能，确保导航时正确隐藏
  const overlayAnimatedStyle = useAnimatedStyle(() => {
    const opacity = withTiming(
      interpolate(isExpanded.value, [0, 1], [0, 0.5]),
      { duration: 100 } // 进一步缩短遮罩动画时长，更快响应
    );
    
    return {
      opacity,
      pointerEvents: isExpanded.value > 0.1 ? 'auto' : 'none', // 稍微调整阈值
    };
  });

  return (
    <>
      {/* 背景遮罩 - 仅在FAB展开时显示，且在模态页面中隐藏 */}
      <Animated.View style={[styles.overlay, overlayAnimatedStyle, { display: isFabVisible ? 'flex' : 'none' }]}>
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={toggleExpanded}
        />
      </Animated.View>

      {/* FAB容器 */}
      <Animated.View style={[styles.fabContainer, fabAnimatedStyle]}>
        {/* 子按钮 */}
        {subButtons.map((button, index) => (
          <Animated.View
            key={button.icon}
            style={[
              styles.subButton,
              { backgroundColor: colors.card },
              getSubButtonAnimatedStyle(index),
            ]}
          >
            <Pressable
              style={styles.subButtonPressable}
              onPress={button.action}
              android_ripple={{ color: colors.primary + '20', radius: 24 }}
            >
              <AppIcon 
                name={button.icon} 
                size={24} 
                color={colors.primary} 
              />
            </Pressable>
          </Animated.View>
        ))}

        {/* 主按钮 */}
        <Animated.View style={[styles.mainButton, { backgroundColor: colors.primary }]}>
          <Pressable
            style={styles.mainButtonPressable}
            onPress={toggleExpanded}
            android_ripple={{ color: colors.white + '20', radius: 28 }}
          >
            <Animated.View style={mainButtonAnimatedStyle}>
              <AppIcon name="add-sharp" size={28} color={colors.white} />
            </Animated.View>
          </Pressable>
        </Animated.View>
      </Animated.View>
    </>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 998,
  },
  fabContainer: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? spacing.xl * 3 : spacing.xl * 2.5,
    right: spacing.l,
    zIndex: 999,
  },
  mainButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    // elevation: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0,
    borderWidth: 0,
  },
  mainButtonPressable: {
    width: '100%',
    height: '100%',
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  subButton: {
    position: 'absolute',
    width: 48,
    height: 48,
    borderRadius: 24,
    elevation: 6, // 设置子按钮的阴影高度为6，以增强浮动效果
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0,
    borderWidth: 0,                                                                                                                           
    top: 4, // 相对于主按钮的偏移
    left: 4,
  },
  subButtonPressable: {
    width: '100%',
    height: '100%',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default FloatingActionButton; 