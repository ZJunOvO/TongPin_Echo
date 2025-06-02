import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../state/ThemeContext';
import { spacing, typography } from '../styles/theme';
import AppTextInput from '../components/atoms/AppTextInput';
import AppIcon from '../components/atoms/AppIcon';

const CreateSignalScreen: React.FC = () => {
  const { colors } = useTheme();
  const navigation = useNavigation();

  const handleClose = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* 头部区域 */}
      <View style={[styles.header, { borderBottomColor: colors.textSecondary + '20' }]}>
        <Pressable
          style={styles.closeButton}
          onPress={handleClose}
        >
          <AppIcon name="close" size={24} color={colors.text} />
        </Pressable>
        
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          创建新信号
        </Text>
        
        <View style={styles.placeholder} />
      </View>
      
      <View style={styles.content}>        
        <View style={styles.form}>
          <AppTextInput
            placeholder="输入信号标题..."
            style={styles.inputSpacing}
          />
          
          <AppTextInput
            placeholder="描述你的信号..."
            multiline
            numberOfLines={4}
            style={[styles.inputSpacing, styles.textArea]}
          />
          
          {/* TODO v1.0: 此通用信号创建页面将被废弃，替换为具体的信号类型创建页面 */}
          <Text style={[styles.deprecationNotice, { color: colors.textSecondary }]}>
            ⚠️ 此页面将在v1.0中被具体的信号类型页面替代
          </Text>
        </View>
      </View>
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
    paddingVertical: spacing.l, // 增加垂直内边距
    paddingTop: spacing.xl, // 增加顶部距离
    borderBottomWidth: 1,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: typography.h2.fontSize,
    fontWeight: typography.h2.fontWeight as any,
    flex: 1,
    textAlign: 'center',
  },
  placeholder: {
    width: 40, // 与关闭按钮保持对称
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.l,
    paddingTop: spacing.l,
  },
  form: {
    flex: 1,
    paddingTop: spacing.xl, // 增加表单顶部距离
  },
  inputSpacing: {
    marginBottom: spacing.l,
  },
  textArea: {
    minHeight: 120,
    textAlignVertical: 'top', // Android文本从顶部开始
  },
  deprecationNotice: {
    fontSize: 14,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: spacing.xl,
    padding: spacing.l,
  },
});

export default CreateSignalScreen; 