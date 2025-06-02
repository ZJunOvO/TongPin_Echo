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

interface PlanData {
  title: string;
  description: string;
  location: string;
  date: string;
  time: string;
}

const CreatePlanScreen: React.FC = () => {
  const { colors, isDark } = useTheme();
  const navigation = useNavigation<NavigationProp<any>>();
  const queryClient = useQueryClient();
  
  // 单一状态对象管理所有表单字段
  const [plan, setPlan] = useState<PlanData>({
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
      console.error('创建计划失败:', error);
    },
  });

  const handleClose = () => {
    // 添加触觉反馈，增强关闭体验
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.goBack();
  };

  const handleSubmit = () => {
    // 基本表单验证
    if (!plan.title.trim()) {
      Alert.alert('提示', '请输入计划名称');
      return;
    }

    const signalData: CreateSignalData = {
      title: plan.title.trim(),
      description: plan.description.trim() || undefined,
      location: plan.location.trim() || undefined,
      date: plan.date.trim() || undefined,
      time: plan.time.trim() || undefined,
      type: 'plan',
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
          disabled={createSignalMutation.isPending || !plan.title.trim()}
        >
          <Text style={[styles.navButtonText, { color: colors.white }]}>
            {createSignalMutation.isPending ? '创建中...' : '创建'}
          </Text>
        </Pressable>
      ),
    });
  }, [navigation, plan, colors, createSignalMutation.isPending]);

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
          <Text style={[styles.headerTitle, { color: colors.text }]}>创建计划</Text>
          <View style={styles.headerRightSpacer} />{/*  占位符，保持标题居中 */}
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.form}>
            {/* 计划标题 */}
            <View style={styles.fieldContainer}>
              <Text style={[styles.fieldLabel, { color: colors.text }]}>
                计划名称 <Text style={{ color: colors.red }}>*</Text>
              </Text>
              <AppTextInput
                placeholder="下个月去台南玩3天"
                value={plan.title}
                onChangeText={(text) => setPlan(prev => ({ ...prev, title: text }))}
                style={styles.inputSpacing}
              />
            </View>

            {/* 计划描述 */}
            <View style={styles.fieldContainer}>
              <Text style={[styles.fieldLabel, { color: colors.text }]}>
                计划概述
              </Text>
              <AppTextInput
                placeholder="描述一下这个计划的目标和主要内容..."
                value={plan.description}
                onChangeText={(text) => setPlan(prev => ({ ...prev, description: text }))}
                multiline
                numberOfLines={3}
                style={[styles.inputSpacing, styles.textArea]}
              />
            </View>

            {/* 地点信息 */}
            <View style={styles.fieldContainer}>
              <Text style={[styles.fieldLabel, { color: colors.text }]}>
                目标地点
              </Text>
              <AppTextInput
                placeholder="台南、京都、家里..."
                value={plan.location}
                onChangeText={(text) => setPlan(prev => ({ ...prev, location: text }))}
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

            {/* 时间规划 */}
            <View style={styles.fieldContainer}>
              <Text style={[styles.fieldLabel, { color: colors.text }]}>
                时间规划
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
                    {plan.date || '开始日期'}
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
                    {plan.time || '结束日期'}
                  </Text>
                </Pressable>
              </View>
            </View>

            {/* 协作蓝图说明 */}
            <View style={styles.blueprintContainer}>
              <View style={[styles.blueprintBox, { backgroundColor: colors.primary + '10', borderColor: colors.primary + '30' }]}>
                <Text style={[styles.blueprintIcon]}>🎯</Text>
                <View style={styles.blueprintContent}>
                  <Text style={[styles.blueprintTitle, { color: colors.text }]}>协作蓝图模式</Text>
                  <Text style={[styles.blueprintText, { color: colors.textSecondary }]}>
                    • 创建后你们可以一起添加"子信号"（任务细则）{'\n'}
                    • 双方投票决定每个任务是否进行{'\n'}
                    • 认领任务并协作完成整个计划{'\n'}
                    • 让复杂的计划变得井井有条 📋
                  </Text>
                </View>
              </View>
              {/* TODO v1.0: 实现协作蓝图功能，包括子信号管理、投票系统、任务认领等 */}
            </View>

            {/* TODO: 模板选择 */}
            <View style={styles.fieldContainer}>
              <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
                📋 计划模板 (即将推出)
              </Text>
              <Text style={[styles.comingSoon, { color: colors.textSecondary }]}>
                旅行计划、学习计划、健身计划...
              </Text>
              {/* TODO v1.0: 实现计划模板功能，预设常用的计划类型和子任务 */}
            </View>

            {/* TODO: 预设子任务 */}
            <View style={styles.fieldContainer}>
              <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
                ✅ 预设子任务 (即将推出)
              </Text>
              <Text style={[styles.comingSoon, { color: colors.textSecondary }]}>
                在创建时就添加一些子任务...
              </Text>
              {/* TODO v1.0: 实现预设子任务功能，允许用户在创建计划时直接添加子任务 */}
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
    minHeight: 80,
    textAlignVertical: 'top',
  },
  dateTimeRow: {
    flexDirection: 'row',
  },
  dateTimeButton: {
    flex: 1,
    marginTop: spacing.s,
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
  blueprintContainer: {
    marginVertical: spacing.l,
  },
  blueprintBox: {
    flexDirection: 'row',
    padding: spacing.m,
    borderRadius: spacing.s,
    borderWidth: 1,
  },
  blueprintIcon: {
    fontSize: 20,
    marginRight: spacing.s,
  },
  blueprintContent: {
    flex: 1,
  },
  blueprintTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  blueprintText: {
    fontSize: 13,
    lineHeight: 18,
  },
  comingSoon: {
    fontSize: 14,
    fontStyle: 'italic',
    textAlign: 'center',
    padding: spacing.l,
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

export default CreatePlanScreen; 