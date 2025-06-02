import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ImageBackground, Image } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withTiming, 
  withSequence,
  Easing,
  interpolate
} from 'react-native-reanimated';
import AppBlurView from '../atoms/BlurView';
import { useTheme } from '../../state/ThemeContext';
import { spacing, typography } from '../../styles/theme';
import AppIcon from '../atoms/AppIcon';

const MAX_VISIBLE_AVATARS = 3; // 最多显示的用户头像数量

// 假设的 SignalType 定义 (用户需要根据实际情况完善)
export interface SignalType {
  id: string; // 假设每个 signal 都有一个唯一ID
  imageUrl?: string;
  title: string;
  cardCategory: { iconName: string; text: string };
  timestamp: string;
  users: { name: string; avatarUrl: string }[];
  statusIndicatorColor?: string; // 可能会被 signal.status 替代
  backgroundColor?: string; // 卡片背景色，可能基于 type 或 status
  status?: string; // 'pending', 'settled', 'completed', 'shelved', etc.
  type?: string;   // 'proposal', 'wish', 'plan', 'redemption', etc.
  // 其他 signal 特有的字段可以加在这里
  // 例如： planDetails?: { completedTasks: number, totalTasks: number };
  // 例如： currentUserCanRespond?: boolean;
}

// 修改 ArtCardProps：
export type ArtCardProps = {
  signal: SignalType; // 主要 prop
  height?: number; // 将 height 设为可选
  isAnimatedActor?: boolean; // 新增 prop
  isDetailViewActor?: boolean; // 新增 prop，用于详情页背景演员
  animationProgress?: Animated.SharedValue<number>; // <--- 新增动画进度 prop
};

const ArtCard = ({
  signal, // 解构出 signal 对象
  height,
  isAnimatedActor,
  isDetailViewActor,
  animationProgress,
}: ArtCardProps) => {
  const { colors, isDark } = useTheme();

  // 添加保护：如果 signal prop 未定义，则不渲染任何内容
  if (!signal) {
    if (process.env.NODE_ENV === 'development') {
      console.warn("ArtCard component was rendered without a signal prop.");
    }
    return null;
  }

  // 从 signal 对象中解构所需数据
  const { 
    imageUrl, 
    title, 
    cardCategory, 
    timestamp, 
    users, 
    statusIndicatorColor, // 注意：这个将来可能由 signal.status 完全决定
    backgroundColor,    // 注意：这个将来可能由 signal.type 或 signal.status 决定
    status, 
    type 
  } = signal;

  // 状态指示点的光效动画
  const glowScale = useSharedValue(1);
  const glowOpacity = useSharedValue(1);

  useEffect(() => {
    // 为pending状态创建白色呼吸动画
    if (status === 'pending') {
      glowScale.value = withRepeat(
        withSequence(
          withTiming(1.5, { duration: 1500, easing: Easing.out(Easing.quad) }),
          withTiming(1, { duration: 1500, easing: Easing.in(Easing.quad) })
        ),
        -1, // 无限重复
        false // 不反向
      );

      glowOpacity.value = withRepeat(
        withSequence(
          withTiming(0.4, { duration: 1500, easing: Easing.out(Easing.quad) }),
          withTiming(0.8, { duration: 1500, easing: Easing.in(Easing.quad) })
        ),
        -1, // 无限重复
        false // 不反向
      );
    } else if (statusIndicatorColor && statusIndicatorColor === '#FFD700') { // 保留这个逻辑，但提示用户将来可能会基于 signal.status
      // 保持原有的黄色光效动画
      glowScale.value = withRepeat(
        withSequence(
          withTiming(1.8, { duration: 1200, easing: Easing.out(Easing.quad) }),
          withTiming(1, { duration: 1200, easing: Easing.in(Easing.quad) })
        ),
        -1, // 无限重复
        false // 不反向
      );

      glowOpacity.value = withRepeat(
        withSequence(
          withTiming(0.3, { duration: 1200, easing: Easing.out(Easing.quad) }),
          withTiming(1, { duration: 1200, easing: Easing.in(Easing.quad) })
        ),
        -1, // 无限重复
        false // 不反向
      );
    }
  }, [statusIndicatorColor, status]); // 依赖项现在是 signal.statusIndicatorColor 和 signal.status

  // 光晕动画样式
  const glowAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: glowScale.value }],
      opacity: glowOpacity.value,
    };
  });

  // 根据状态获取状态指示点颜色
  const getStatusIndicatorColor = () => {
    if (status === 'pending') {
      return '#FFFFFF'; // pending状态使用白色
    }
    // 注意：这里的 statusIndicatorColor 来自 props.signal，后续应完全基于 signal.status
    return statusIndicatorColor; 
  };

  // 根据类型获取图标（如果需要覆盖cardCategory中的图标）
  const getIconByType = () => {
    if (type) { // type 来自 props.signal
      switch (type) {
        case 'proposal':
          return 'chatbubble-ellipses-outline';
        case 'wish':
          return 'star-outline';
        case 'plan':
          return 'navigate-circle-outline';
        case 'signal':
          return 'radio-outline';
        default:
          return cardCategory.iconName;
      }
    }
    return cardCategory.iconName;
  };

  const finalStatusColor = getStatusIndicatorColor();

  // 动画样式，用于根据 animationProgress 控制透明度
  const titleAnimatedStyle = useAnimatedStyle(() => {
    if (isAnimatedActor && !isDetailViewActor && animationProgress) {
      // 作为时间线上的动画演员，根据进度淡出
      return {
        opacity: interpolate(animationProgress.value, [0, 0.3], [1, 0]), // 在动画前30%完成淡出
      };
    }
    // 其他情况（如普通卡片或详情页演员）保持完全不透明或由其他逻辑控制显隐
    return { opacity: 1 }; 
  });

  // 动画样式，用于 categoryRow 根据 animationProgress 控制透明度
  const categoryRowAnimatedStyle = useAnimatedStyle(() => {
    if (isAnimatedActor && !isDetailViewActor && animationProgress) {
      // 作为时间线上的动画演员，根据进度淡出 (与标题使用相同的淡出曲线)
      return {
        opacity: interpolate(animationProgress.value, [0, 0.3], [1, 0]), 
      };
    }
    return { opacity: 1 };
  });

  // 动画样式，用于 footerRow 根据 animationProgress 控制透明度
  const footerRowAnimatedStyle = useAnimatedStyle(() => {
    if (isAnimatedActor && !isDetailViewActor && animationProgress) {
      // 作为时间线上的动画演员，根据进度淡出 (与标题/类别行使用相同的淡出曲线)
      return {
        opacity: interpolate(animationProgress.value, [0, 0.3], [1, 0]), 
      };
    }
    return { opacity: 1 };
  });

  const cardContent = (
    <View style={styles.contentOuterContainer}>
      <Animated.View style={categoryRowAnimatedStyle}>
        <View style={styles.categoryRow}>
          <AppIcon name={getIconByType()} size={16} color={colors.textSecondary} />
          <Text style={[styles.categoryText, { color: colors.textSecondary }]}>
            {cardCategory.text}
          </Text>
          <Text style={[styles.timestamp, { color: colors.textSecondary }]}>
            ・ {timestamp}
          </Text>
        </View>
      </Animated.View>

      {/* 根据 isDetailViewActor 条件渲染标题，并应用动画样式 */}
      {!isDetailViewActor && (
        <Animated.View style={titleAnimatedStyle}> 
          <Text style={[styles.title, { color: colors.text }]} numberOfLines={3}>
            {title}
          </Text>
        </Animated.View>
      )}

      <Animated.View style={footerRowAnimatedStyle}>
        <View style={styles.footerRow}>
          <View style={styles.avatarsContainer}>
            {users.slice(0, MAX_VISIBLE_AVATARS).map((user, index) => (
              <Image
                key={user.name + index}
                source={{ uri: user.avatarUrl }}
                style={[
                  styles.avatar,
                  { marginLeft: index === 0 ? 0 : -spacing.s }, // 重叠效果
                ]}
              />
            ))}
            {users.length > MAX_VISIBLE_AVATARS && (
              <View style={[styles.avatarOverflow, { backgroundColor: colors.card }]}>
                <Text style={[styles.avatarOverflowText, { color: colors.textSecondary }]}>
                  +{users.length - MAX_VISIBLE_AVATARS}
                </Text>
              </View>
            )}
          </View>
          {finalStatusColor && (
            <View style={styles.statusIndicatorContainer}>
              {/* 光晕效果 - 黄色(活跃)状态或白色(pending)状态显示 */}
              {(finalStatusColor === '#FFD700' || status === 'pending') && (
                <Animated.View
                  style={[
                    styles.statusIndicatorGlow,
                    { backgroundColor: finalStatusColor }, // finalStatusColor 现在基于 signal.status
                    glowAnimatedStyle,
                  ]}
                />
              )}
              {/* 主要状态指示点 */}
              <View style={[styles.statusIndicator, { backgroundColor: finalStatusColor }]} />
            </View>
          )}
        </View>
      </Animated.View>
    </View>
  );

  // 根据 isAnimatedActor 决定样式
  const dynamicStyle = isAnimatedActor ? { flex: 1 } : { height };

  return (
    <View style={[styles.container, dynamicStyle, { backgroundColor: backgroundColor || colors.card }]}>
      {imageUrl ? (
        <ImageBackground source={{ uri: imageUrl }} style={styles.imageBackground} imageStyle={styles.image}>
          <AppBlurView
            style={styles.blurView}
            blurType={isDark ? 'dark' : 'light'}
            blurAmount={25} // 从15增加到25
          >
            {cardContent}
          </AppBlurView>
        </ImageBackground>
      ) : (
        // 对于没有背景图片的卡片，直接使用 AppBlurView 作为背景
        <AppBlurView
          style={styles.fullBlurBackground}
          blurType={isDark ? 'dark' : 'light'}
          blurAmount={30} // 从20增加到30
        >
          {/* 额外添加一层半透明叠加层，使其更接近原型效果 */}
          <View style={[styles.solidColorOverlay, { backgroundColor: backgroundColor || 'transparent' }]}>
             {cardContent}
          </View>
        </AppBlurView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderRadius: spacing.l, // 增大圆角
    overflow: 'hidden',
    // marginBottom 已在之前的步骤中移除
  },
  imageBackground: {
    flex: 1,
  },
  image: {
    borderRadius: spacing.l, // 确保背景图也有圆角
  },
  blurView: { // 用于有背景图的卡片
    flex: 1,
    justifyContent: 'space-between', // 使内容分布在上下
    padding: spacing.m,
  },
  fullBlurBackground: { // 用于无背景图的卡片，模糊整个卡片
    flex: 1,
    borderRadius: spacing.l,
  },
  solidColorOverlay: { // 用于无背景图卡片，在模糊层之上再叠加一层颜色
    flex: 1,
    justifyContent: 'space-between',
    padding: spacing.m,
    borderRadius: spacing.l, // 需要确保圆角传递
  },
  contentOuterContainer: { // 用于控制内容布局，使 footerRow 能固定在底部
    flex: 1,
    justifyContent: 'space-between',
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.s,
  },
  categoryText: {
    ...typography.caption, // 假设有 caption 样式
    marginLeft: spacing.xs,
    fontWeight: '500',
  },
  timestamp: {
    ...typography.caption,
    marginLeft: spacing.xs,
  },
  title: {
    ...typography.body, // 假设有 body 样式
    fontWeight: '600',
    flexShrink: 1, // 确保标题能正确换行
    marginBottom: spacing.m, // 为底部元素留出空间
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 'auto', // 确保 footer 在底部
  },
  avatarsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)', // 给头像一个轻微的边框
  },
  avatarOverflow: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: -spacing.s,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  avatarOverflowText: {
    fontSize: 10,
    fontWeight: '600',
  },
  statusIndicatorContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    zIndex: 2, // 确保在光晕之上
  },
  statusIndicatorGlow: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
    zIndex: 1, // 在主指示点之下
  },
});

export default ArtCard; 