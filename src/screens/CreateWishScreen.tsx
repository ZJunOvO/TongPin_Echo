import React, { useState, useLayoutEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Pressable, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../state/ThemeContext';
import { spacing, typography } from '../styles/theme';
import AppTextInput from '../components/atoms/AppTextInput';
import AppIcon from '../components/atoms/AppIcon';
import { createSignal } from '../api/signals';
import { CreateSignalData } from '../types';
import AppBlurView from '../components/atoms/BlurView';

interface WishData {
  title: string;
  description: string;
  location: string;
  date: string;
  time: string;
}

const CreateWishScreen: React.FC = () => {
  const { colors, isDark } = useTheme();
  const navigation = useNavigation<NavigationProp<any>>();
  const queryClient = useQueryClient();
  
  // 单一状态对象管理所有表单字段
  const [wish, setWish] = useState<WishData>({
    title: '',
    description: '',
    location: '',
    date: '',
    time: '',
  });

  // 创建信号的mutation
  const createSignalMutation = useMutation({
    mutationFn: createSignal,
    onSuccess: () => {
      // 成功后使signals查询缓存失效，触发自动重新获取
      queryClient.invalidateQueries({ queryKey: ['signals'] });
      
      // 添加触觉反馈
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      
      // 关闭模态框
      navigation.goBack();
    },
    onError: (error) => {
      Alert.alert('创建失败', '请稍后重试');
      console.error('创建心愿失败:', error);
    },
  });

  const handleClose = () => {
    // 添加触觉反馈，增强关闭体验
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.goBack();
  };

  const handleSubmit = () => {
    // 基本表单验证
    if (!wish.title.trim()) {
      Alert.alert('提示', '请输入心愿内容');
      return;
    }

    const signalData: CreateSignalData = {
      title: wish.title.trim(),
      description: wish.description.trim() || undefined,
      location: wish.location.trim() || undefined,
      date: wish.date.trim() || undefined,
      time: wish.time.trim() || undefined,
      type: 'wish',
    };

    // 使用mutation创建信号
    createSignalMutation.mutate(signalData);
  };

  // 设置导航栏按钮
  useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <Pressable 
          style={styles.navButton} 
          onPress={handleClose}
          disabled={createSignalMutation.isPending}
        >
          <Text style={[styles.navButtonText, { 
            color: createSignalMutation.isPending ? colors.textSecondary : colors.text 
          }]}>
            取消
          </Text>
        </Pressable>
      ),
      headerRight: () => (
        <Pressable 
          style={[
            styles.navButton, 
            { backgroundColor: createSignalMutation.isPending ? colors.textSecondary : colors.primary }
          ]} 
          onPress={handleSubmit}
          disabled={createSignalMutation.isPending || !wish.title.trim()}
        >
          <Text style={[styles.navButtonText, { color: colors.white }]}>
            {createSignalMutation.isPending ? '许愿中...' : '许愿'}
          </Text>
        </Pressable>
      ),
    });
  }, [navigation, wish, colors, createSignalMutation.isPending]);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        {/* Header with BlurView */}
        <View style={styles.header}>
          <AppBlurView
            blurType={isDark ? 'dark' : 'light'}
            blurAmount={25}
            style={StyleSheet.absoluteFillObject}
          />
          <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
            <AppIcon name="close-outline" size={30} color={colors.text} />
          </Pressable>
          <Text style={[styles.headerTitle, { color: colors.text }]}>创建心愿</Text>
          <View style={styles.headerRightSpacer} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.form}>
            {/* 心愿内容标题 */}
            <View style={styles.fieldContainer}>
              <Text style={[styles.fieldLabel, { color: colors.text }]}>
                我的心愿 <Text style={{ color: colors.red }}>*</Text>
              </Text>
              <AppTextInput
                placeholder="我想吃火锅！"
                value={wish.title}
                onChangeText={(text) => setWish(prev => ({ ...prev, title: text }))}
                style={styles.inputSpacing}
              />
            </View>

            {/* 心愿描述 */}
            <View style={styles.fieldContainer}>
              <Text style={[styles.fieldLabel, { color: colors.text }]}>
                更多期望
              </Text>
              <AppTextInput
                placeholder="描述一下你的心愿，比如想要什么样的火锅、什么时候吃等..."
                value={wish.description}
                onChangeText={(text) => setWish(prev => ({ ...prev, description: text }))}
                multiline
                numberOfLines={4}
                style={[styles.inputSpacing, styles.textArea]}
              />
            </View>

            {/* 地点信息 - 占位符按钮 */}
            <View style={styles.fieldContainer}>
              <Text style={[styles.fieldLabel, { color: colors.text }]}>
                期望地点
              </Text>
              <AppTextInput
                placeholder="想在哪里实现这个心愿（可选）"
                value={wish.location}
                onChangeText={(text) => setWish(prev => ({ ...prev, location: text }))}
                style={styles.inputSpacing}
              />
              <Pressable 
                style={[styles.placeholderButton, { backgroundColor: colors.card, borderColor: colors.textSecondary }]}
                onPress={() => {
                  // TODO: 实现地点选择功能
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  Alert.alert('提示', '地点选择功能即将推出');
                }}
              >
                <AppIcon name="location-outline" size={20} color={colors.textSecondary} />
                <Text style={[styles.placeholderButtonText, { color: colors.textSecondary }]}>
                  选择地点
                </Text>
              </Pressable>
            </View>

            {/* 日期和时间 - 占位符按钮 */}
            <View style={styles.fieldContainer}>
              <Text style={[styles.fieldLabel, { color: colors.text }]}>
                期望时间
              </Text>
              <View style={styles.dateTimeRow}>
                <Pressable 
                  style={[styles.placeholderButton, styles.dateTimeButton, { backgroundColor: colors.card, borderColor: colors.textSecondary }]}
                  onPress={() => {
                    // TODO: 实现日期选择功能
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    Alert.alert('提示', '日期选择功能即将推出');
                  }}
                >
                  <AppIcon name="calendar-outline" size={20} color={colors.textSecondary} />
                  <Text style={[styles.placeholderButtonText, { color: colors.textSecondary }]}>
                    {wish.date || '选择日期'}
                  </Text>
                </Pressable>
                
                <Pressable 
                  style={[styles.placeholderButton, styles.dateTimeButton, { backgroundColor: colors.card, borderColor: colors.textSecondary, marginLeft: spacing.s }]}
                  onPress={() => {
                    // TODO: 实现时间选择功能
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    Alert.alert('提示', '时间选择功能即将推出');
                  }}
                >
                  <AppIcon name="time-outline" size={20} color={colors.textSecondary} />
                  <Text style={[styles.placeholderButtonText, { color: colors.textSecondary }]}>
                    {wish.time || '选择时间'}
                  </Text>
                </Pressable>
              </View>
            </View>

            {/* 心愿小贴士 */}
            <View style={styles.tipContainer}>
              <View style={[styles.tipBox, { backgroundColor: colors.card, borderColor: colors.primary + '30' }]}>
                <Text style={[styles.tipIcon]}>💡</Text>
                <View style={styles.tipContent}>
                  <Text style={[styles.tipTitle, { color: colors.text }]}>心愿小贴士</Text>
                  <Text style={[styles.tipText, { color: colors.textSecondary }]}>
                    • 心愿是向对方表达你的愿望{'\n'}
                    • 对方可以选择帮你实现{'\n'}
                    • 也可以由你自己标记为已实现{'\n'}
                    • 让默契在心愿的满足中慢慢建立 ✨
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: spacing.xl, 
    paddingBottom: spacing.m,
    paddingHorizontal: spacing.m,
    position: 'relative', 
    minHeight: 50 + spacing.xl, 
  },
  headerTitle: {
    ...typography.h2,
    fontWeight: 'bold',
    textAlign: 'center',
    zIndex: 1,
  },
  backButton: {
    padding: spacing.s,
    zIndex: 1,
  },
  headerRightSpacer: {
    width: (30 + spacing.s * 2), 
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.l,
  },
  form: {
    paddingTop: spacing.xl,
    paddingBottom: spacing.xl,
  },
  fieldContainer: {
    marginBottom: spacing.l,
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: spacing.s,
  },
  inputSpacing: {
    marginBottom: 0,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  placeholderButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.m,
    paddingHorizontal: spacing.m,
    borderWidth: 1,
    borderRadius: spacing.s,
    marginTop: spacing.s,
  },
  placeholderButtonText: {
    fontSize: 16,
    marginLeft: spacing.s,
  },
  dateTimeRow: {
    flexDirection: 'row',
  },
  dateTimeButton: {
    flex: 1,
    marginTop: spacing.s,
  },
  tipContainer: {
    marginVertical: spacing.l,
  },
  tipBox: {
    flexDirection: 'row',
    padding: spacing.m,
    borderRadius: spacing.s,
    borderWidth: 1,
  },
  tipIcon: {
    fontSize: 20,
    marginRight: spacing.s,
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  tipText: {
    fontSize: 13,
    lineHeight: 18,
  },
  navButton: {
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
    borderRadius: spacing.s,
    minWidth: 60,
    alignItems: 'center',
  },
  navButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default CreateWishScreen; 