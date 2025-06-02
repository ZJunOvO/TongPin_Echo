import React from 'react';
import { TextInput, TextInputProps, StyleSheet } from 'react-native';
import { useTheme } from '../../state/ThemeContext';
import { spacing, typography } from '../../styles/theme';

interface AppTextInputProps extends TextInputProps {
  // 可以扩展自定义props
}

const AppTextInput: React.FC<AppTextInputProps> = (props) => {
  const { colors } = useTheme();
  
  return (
    <TextInput
      style={[
        styles.input,
        {
          backgroundColor: colors.card,
          color: colors.text,
          borderColor: colors.textSecondary,
        },
        props.style,
      ]}
      placeholderTextColor={colors.textSecondary}
      {...props}
    />
  );
};

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderRadius: spacing.s,
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.m,
    fontSize: typography.body.fontSize,
    marginBottom: spacing.m,
    minHeight: 48, // 确保足够的触摸区域
  },
});

export default AppTextInput; 