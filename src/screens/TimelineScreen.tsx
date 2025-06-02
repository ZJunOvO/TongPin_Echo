import React, { useMemo, useRef, useCallback, useEffect } from 'react';
import { View, StyleSheet, Text, ScrollView, RefreshControl, Pressable, SafeAreaView } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import ArtCard from '../components/organisms/ArtCard';
import { useTheme } from '../state/ThemeContext';
import { useUIStore } from '../state/uiStore';
import AppBlurView from '../components/atoms/BlurView';
import { spacing, typography } from '../styles/theme';
import { ArtCardProps } from '../types';
import { getSignals } from '../api/signals';
import { RootStackParamList } from '../navigation/AppNavigator';

const TimelineScreen = () => {
  const { colors, isDark } = useTheme();
  const { setFabVisible } = useUIStore();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const lastScrollY = useRef(0);

  // 使用useQuery获取信号数据
  const { data: signals = [], isLoading, isRefetching, refetch } = useQuery({
    queryKey: ['signals'],
    queryFn: getSignals,
  });

  // 为每个信号创建稳定的animated ref和opacity值，用于聚光灯动画的位置测量
  const [cardData, setCardData] = React.useState(new Map());

  // 使用useEffect来更新cardData，而不是useMemo
  React.useEffect(() => {
    const newData = new Map();
    signals.forEach(signal => {
      if (cardData.has(signal.id)) {
        // 保留现有的ref和opacity
        newData.set(signal.id, cardData.get(signal.id));
      } else {
        // 为新信号创建ref和opacity
        newData.set(signal.id, {
          ref: { current: null }, // 使用普通ref，不用useAnimatedRef
          opacity: 1, // 使用普通数值，稍后用useSharedValue包装
        });
      }
    });
    
    // 只有当数据真正发生变化时才更新
    if (newData.size !== cardData.size || signals.some(signal => !cardData.has(signal.id))) {
      setCardData(newData);
    }
  }, [signals]);

  // 瀑布流布局算法：将数据分配到两列中，每次选择当前高度较短的列
  const { leftColumn, rightColumn } = useMemo(() => {
    const left: ArtCardProps[] = [];
    const right: ArtCardProps[] = [];
    let leftHeight = 0;
    let rightHeight = 0;

    signals.forEach((card) => {
      if (leftHeight <= rightHeight) {
        left.push(card);
        leftHeight += card.height + spacing.m; // 加上卡片间距
      } else {
        right.push(card);
        rightHeight += card.height + spacing.m;
      }
    });

    return { leftColumn: left, rightColumn: right };
  }, [signals]);

  const handleScroll = (event: any) => {
    const currentScrollY = event.nativeEvent.contentOffset.y;
    const scrollDirection = currentScrollY > lastScrollY.current ? 'down' : 'up';
    
    // 只有当滚动距离超过阈值时才触发显示/隐藏
    const scrollThreshold = 10;
    const scrollDelta = Math.abs(currentScrollY - lastScrollY.current);
    
    if (scrollDelta > scrollThreshold) {
      if (scrollDirection === 'down' && currentScrollY > 50) {
        // 向下滚动且不在顶部时隐藏FAB
        setFabVisible(false);
      } else if (scrollDirection === 'up') {
        // 向上滚动时显示FAB
        setFabVisible(true);
      }
      
      lastScrollY.current = currentScrollY;
    }
  };

  // 处理卡片点击事件 - 聚光灯展开动画的核心逻辑
  const handleCardPress = useCallback((signalId: string) => {
    const cardInfo = cardData.get(signalId);
    if (cardInfo && cardInfo.ref && cardInfo.ref.current) {
      // 使用普通的measure函数进行测量
      cardInfo.ref.current.measure((x: number, y: number, width: number, height: number, pageX: number, pageY: number) => {
        console.log('卡片测量成功:', { x, y, width, height, pageX, pageY });
        
        navigation.navigate('SignalDetailScreen', { 
          signalId,
          sourceMeasurements: {
            x: pageX,
            y: pageY,
            width,
            height,
          }
        });
      });
    } else {
      console.log('cardData未找到或ref为空，使用普通导航:', signalId);
      // 如果测量失败，回退到普通导航（无聚光灯动画）
      navigation.navigate('SignalDetailScreen', { signalId });
    }
  }, [cardData, navigation]);

  // 渲染单张卡片的函数
  const renderCard = useCallback((item: ArtCardProps) => {
    const cardInfo = cardData.get(item.id);
    if (!cardInfo) return null;

    return (
      <View 
        ref={cardInfo.ref}
        style={styles.cardWrapper}
      >
        <Pressable onPress={() => handleCardPress(item.id)}>
          <ArtCard signal={item} height={item.height} />
        </Pressable>
      </View>
    );
  }, [cardData, handleCardPress]);

  return (
    // 该代码使用 SafeAreaView 组件来确保内容在设备的安全区域内显示，避免被状态栏或底部导航遮挡。
    // 通过 styles.container 和 colors.background 设置容器的样式和背景颜色。
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header with BlurView */}
      <View style={styles.header}>
        <AppBlurView
            blurType={isDark ? 'dark' : 'light'}
            blurAmount={35}
            style={StyleSheet.absoluteFillObject}
        />
        <Text style={[styles.headerTitle, { color: colors.text }]}>时间线</Text>
      </View>
      <ScrollView 
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContentContainer}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16} // 60fps的滚动事件频率
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        <View style={styles.columnsContainer}>
          {/* 左列 */}
          <View style={styles.column}>
            {leftColumn.map((card) => (
              <View key={card.id}>
                {renderCard(card)}
              </View>
            ))}
          </View>

          {/* 右列 */}
          <View style={styles.column}>
            {rightColumn.map((card) => (
              <View key={card.id}>
                {renderCard(card)}
              </View>
            ))}
          </View>
        </View>
        
        {/* 底部留白，为TabBar留出空间 */}
        <View style={{ height: spacing.xl * 3 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: spacing.xl, // Match SafeAreView typical top padding
    paddingBottom: spacing.m,
    paddingHorizontal: spacing.m,
    alignItems: 'flex-start',
    position: 'relative', // Needed for absoluteFillObject
    minHeight: 50 + spacing.xl, // Adjust based on your design
  },
  headerTitle: {
    ...typography.h1,
    fontWeight: 'bold',
    zIndex: 1, // 确保标题在毛玻璃效果之上
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContentContainer: {
    paddingHorizontal: spacing.m,
    paddingTop: spacing.m,
  },
  columnsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  column: {
    flex: 1,
    paddingHorizontal: spacing.s / 2, // 列之间的间距
  },
  cardWrapper: {
    marginBottom: spacing.m, // 卡片垂直间距
  },
});

export default TimelineScreen; 