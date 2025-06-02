import React, { useRef } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '../state/ThemeContext';
import { useUIStore } from '../state/uiStore';
import { spacing, typography } from '../styles/theme';

interface VendingMachineScreenProps {}

const VendingMachineScreen: React.FC<VendingMachineScreenProps> = () => {
  const { colors } = useTheme();
  const { setFabVisible } = useUIStore();
  const lastScrollY = useRef(0);

  const handleScroll = (event: any) => {
    const currentScrollY = event.nativeEvent.contentOffset.y;
    const scrollDirection = currentScrollY > lastScrollY.current ? 'down' : 'up';
    
    const scrollThreshold = 10;
    const scrollDelta = Math.abs(currentScrollY - lastScrollY.current);
    
    if (scrollDelta > scrollThreshold) {
      if (scrollDirection === 'down' && currentScrollY > 50) {
        setFabVisible(false);
      } else if (scrollDirection === 'up') {
        setFabVisible(true);
      }
      
      lastScrollY.current = currentScrollY;
    }

  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.screenTitle, { color: colors.text }]}>益圈</Text>
      
      <ScrollView 
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContentContainer}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        <Text style={[styles.text, { color: colors.textSecondary }]}>
          益圈功能即将上线...
        </Text>
        
        {/* 添加一些内容以便测试滚动 */}
        {Array.from({ length: 15 }, (_, index) => (
          <View key={index} style={[styles.placeholder, { backgroundColor: colors.card }]}>
            <Text style={[styles.placeholderText, { color: colors.text }]}>
              益圈项目 {index + 1}
            </Text>
          </View>
        ))}
        
        {/* 底部留白，为TabBar留出空间 */}
        <View style={{ height: spacing.xl * 3 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: spacing.xl,
  },
  screenTitle: {
    ...typography.h1,
    fontWeight: 'bold',
    marginLeft: spacing.l,
    marginBottom: spacing.m,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContentContainer: {
    paddingHorizontal: spacing.m,
    paddingTop: spacing.m,
  },
  text: {
    ...typography.body,
    textAlign: 'center',
    marginBottom: spacing.l,
  },
  placeholder: {
    height: 80,
    marginBottom: spacing.m,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  placeholderText: {
    ...typography.body,
    fontWeight: '500',
  },
});

export default VendingMachineScreen; 