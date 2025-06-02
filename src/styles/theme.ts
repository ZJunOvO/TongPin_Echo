// /src/styles/theme.ts
const palette = {
  purple: '#5A31F4',
  green: '#0ECD9D',
  red: '#CD0E61',
  black: '#0B0B0B',
  white: '#F0F2F3',
};

export const lightColors = {
  background: '#F0F2F3',
  card: '#FFFFFF',
  text: '#0B0B0B',
  textSecondary: '#6C7A9C',
  icon: '#2C3E50',
  primary: palette.purple,
  ...palette,
};

export const darkColors = {
  background: '#121212',
  card: '#1E1E1E',
  text: '#F0F2F3',
  textSecondary: '#A9B4D2',
  icon: '#B0BEC5',
  primary: palette.purple,
  ...palette,
};

export const spacing = {
  xs: 4,
  s: 8,
  m: 16,
  l: 24,
  xl: 40,
};

// 稍后我们会用自定义字体替换
export const typography = {
  h1: { fontSize: 36, fontWeight: 'bold' },
  h2: { fontSize: 28, fontWeight: 'bold' },
  body: { fontSize: 16 },
  caption: { fontSize: 12 },
}; 