import React, { useState, useLayoutEffect, useCallback } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Pressable, ScrollView, Alert, TextInput } from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../state/ThemeContext';
import { spacing, typography } from '../styles/theme';
import AppTextInput from '../components/atoms/AppTextInput';
import AppIcon from '../components/atoms/AppIcon';
import AppBlurView from '../components/atoms/BlurView';
import { createSignal } from '../api/signals';
import { CreateSignalData } from '../types';

interface ProposalData {
  title: string;
  description: string;
  options: string[];
  location: string;
  date: string;
  time: string;
}

const CreateProposalScreen: React.FC = () => {
  const { colors, isDark } = useTheme();
  const navigation = useNavigation();
  const queryClient = useQueryClient();
  
  // 单一状态对象管理所有表单字段
  const [proposal, setProposal] = useState<ProposalData>({
    title: '',
    description: '',
    options: [''], // 初始包含一个空选项
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
      console.error('创建信号失败:', error);
    },
  });

  const handleClose = () => {
    // 添加触觉反馈，增强关闭体验
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.goBack();
  };

  const handleSubmit = () => {
    // 基本表单验证
    if (!proposal.title.trim()) {
      Alert.alert('提示', '请输入提议内容');
      return;
    }

    // 过滤掉空选项
    const validOptions = proposal.options.filter(option => option.trim() !== '');
    
    const signalData: CreateSignalData = {
      title: proposal.title.trim(),
      description: proposal.description.trim() || undefined,
      options: validOptions.length > 0 ? validOptions : undefined,
      location: proposal.location.trim() || undefined,
      date: proposal.date.trim() || undefined,
      time: proposal.time.trim() || undefined,
      type: 'proposal',
    };

    // 使用mutation创建信号
    createSignalMutation.mutate(signalData);
  };

  // 添加新选项
  const addOption = () => {
    setProposal(prev => ({
      ...prev,
      options: [...prev.options, '']
    }));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  // 更新特定选项的值
  const updateOption = (index: number, value: string) => {
    setProposal(prev => {
      const newOptions = [...prev.options];
      newOptions[index] = value;
      return { ...prev, options: newOptions };
    });
  };

  // 删除选项
  const removeOption = (index: number) => {
    if (proposal.options.length > 1) {
      setProposal(prev => ({
        ...prev,
        options: prev.options.filter((_, i) => i !== index)
      }));
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  // 设置导航栏按钮
  // useLayoutEffect(() => {
  //   navigation.setOptions({
  //     headerLeft: () => (
  //       <Pressable 
  //         style={styles.navButton} 
  //         onPress={handleClose}
  //         disabled={createSignalMutation.isPending}
  //       >
  //         <Text style={[styles.navButtonText, { 
  //           color: createSignalMutation.isPending ? colors.textSecondary : colors.text 
  //         }]}>
  //           取消
  //         </Text>
  //       </Pressable>
  //     ),
  //     headerRight: () => (
  //       <Pressable 
  //         style={[\
  //           styles.navButton, \
  //           { backgroundColor: createSignalMutation.isPending ? colors.textSecondary : colors.primary }\
  //         ]} 
  //         onPress={handleSubmit}
  //         disabled={createSignalMutation.isPending || !proposal.title.trim()}
  //       >
  //         <Text style={[styles.navButtonText, { color: colors.white }]}>
  //           {createSignalMutation.isPending ? '发起中...' : '发起'}
  //         </Text>
  //       </Pressable>
  //     ),
  //   });
  // }, [navigation, proposal, colors, createSignalMutation.isPending]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* 头部区域 */}
      <View style={styles.header}>
        <AppBlurView
          blurType={isDark ? 'dark' : 'light'}
          blurAmount={25}
          style={StyleSheet.absoluteFillObject}
        />
        <Pressable style={styles.closeButton} onPress={handleClose}>
          <AppIcon name="close" size={24} color={colors.text} />
        </Pressable>
        
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          创建提议
        </Text>
        
        <Pressable 
          style={[styles.createButton, { backgroundColor: colors.primary }]}
          onPress={handleSubmit}
        >
          <Text style={[styles.createButtonText, { color: colors.white }]}>
            发起
          </Text>
        </Pressable>
      </View>
      
      <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.scrollContentContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.form}>
          {/* 必填标题 */}
          <View style={styles.fieldContainer}>
            <Text style={[styles.fieldLabel, { color: colors.text }]}>
              提议内容 <Text style={{ color: colors.red }}>*</Text>
            </Text>
            <AppTextInput
              placeholder="比如：周末去阳明山走走？"
              value={proposal.title}
              onChangeText={(text) => setProposal(prev => ({ ...prev, title: text }))}
              style={styles.inputSpacing}
            />
          </View>

          {/* 可选描述 */}
          <View style={styles.fieldContainer}>
            <Text style={[styles.fieldLabel, { color: colors.text }]}>
              详细说明
            </Text>
            <AppTextInput
              placeholder="添加更多细节，让对方更好理解你的想法..."
              value={proposal.description}
              onChangeText={(text) => setProposal(prev => ({ ...prev, description: text }))}
              multiline
              numberOfLines={3}
              style={[styles.inputSpacing, styles.textArea]}
            />
          </View>

          {/* 动态选项列表 */}
          <View style={styles.fieldContainer}>
            <Text style={[styles.fieldLabel, { color: colors.text }]}>
              提供选项给对方选择
            </Text>
            {proposal.options.map((option, index) => (
              <View key={index} style={styles.optionRow}>
                <AppTextInput
                  placeholder={`选项 ${index + 1}`}
                  value={option}
                  onChangeText={(text) => updateOption(index, text)}
                  style={[styles.inputSpacing, styles.optionInput]}
                />
                {proposal.options.length > 1 && (
                  <Pressable 
                    style={[styles.removeButton, { backgroundColor: colors.red + '20' }]}
                    onPress={() => removeOption(index)}
                  >
                    <AppIcon name="close" size={16} color={colors.red} />
                  </Pressable>
                )}
              </View>
            ))}
            
            <Pressable 
              style={[styles.addButton, { borderColor: colors.primary }]}
              onPress={addOption}
            >
              <AppIcon name="add" size={20} color={colors.primary} />
              <Text style={[styles.addButtonText, { color: colors.primary }]}>
                添加选项
              </Text>
            </Pressable>
          </View>

          {/* 地点信息 - 占位符按钮 */}
          <View style={styles.fieldContainer}>
            <Text style={[styles.fieldLabel, { color: colors.text }]}>
              建议地点
            </Text>
            <AppTextInput
              placeholder="推荐一个地点（可选）"
              value={proposal.location}
              onChangeText={(text) => setProposal(prev => ({ ...prev, location: text }))}
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
              时间安排
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
                  {proposal.date || '选择日期'}
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
                  {proposal.time || '选择时间'}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.l,
    paddingVertical: spacing.l,
    paddingTop: spacing.xl,
    position: 'relative',
    minHeight: 50 + spacing.xl,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  headerTitle: {
    fontSize: typography.h2.fontSize,
    fontWeight: typography.h2.fontWeight as any,
    flex: 1,
    textAlign: 'center',
    zIndex: 1,
  },
  createButton: {
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
    borderRadius: spacing.s,
    minWidth: 60,
    alignItems: 'center',
    zIndex: 1,
  },
  createButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  content: { // This style is no longer used for ScrollView, will be renamed/repurposed
    flex: 1,
    paddingHorizontal: spacing.l,
  },
  scrollContainer: { // New style for ScrollView's style prop
    flex: 1,
    paddingHorizontal: spacing.l,
  },
  scrollContentContainer: { // New style for ScrollView's contentContainerStyle prop
    paddingTop: spacing.xl,
    paddingBottom: spacing.xl,
  },
  form: { // Styles for the View inside ScrollView
    // paddingTop: spacing.xl, // Moved to scrollContentContainer
    // paddingBottom: spacing.xl, // Moved to scrollContentContainer
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
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.s,
  },
  optionInput: {
    flex: 1,
    marginRight: spacing.s,
  },
  removeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.m,
    paddingHorizontal: spacing.l,
    borderWidth: 1.5,
    borderRadius: spacing.s,
    borderStyle: 'dashed',
    marginTop: spacing.s,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: spacing.s,
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
  // navButton: {
  //   paddingHorizontal: spacing.m,
  //   paddingVertical: spacing.s,
  //   borderRadius: spacing.s,
  //   minWidth: 60,
  //   alignItems: 'center',
  // },
  // navButtonText: {
  //   fontSize: 16,
  //   fontWeight: '600',
  // },
});

export default CreateProposalScreen; 