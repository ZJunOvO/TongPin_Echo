import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { View } from 'react-native';
import { useTheme } from '../state/ThemeContext';
import FloatingActionButton from '../components/organisms/FloatingActionButton';

// Import screen components
import MainAppTabs from './MainAppTabs';
import CreateSignalScreen from '../screens/CreateSignalScreen';
import CreateProposalScreen from '../screens/CreateProposalScreen';
import CreateWishScreen from '../screens/CreateWishScreen';
import CreatePlanScreen from '../screens/CreatePlanScreen';
import SignalDetailScreen from '../screens/SignalDetailScreen';

// 定义根导航器的参数类型
export type RootStackParamList = {
  MainApp: undefined;
  SignalDetailScreen: { 
    signalId: string;
    sourceMeasurements?: {
      x: number;
      y: number;
      width: number;
      height: number;
    };
  };
  CreateSignalModal: undefined;
  CreateProposalModal: undefined;
  CreateWishModal: undefined;
  CreatePlanModal: undefined;
};

const RootStack = createNativeStackNavigator<RootStackParamList>();

// 内部导航器组件，包含FAB
const NavigatorWithFAB: React.FC = () => {
  return (
    <>
      <RootStack.Navigator>
        {/* 主应用标签页 */}
        <RootStack.Screen
          name="MainApp"
          component={MainAppTabs}
          options={{ headerShown: false }}
        />
        
        {/* 详情页 - 禁用默认动画以使用自定义聚光灯展开动画 */}
        <RootStack.Screen
          name="SignalDetailScreen"
          component={SignalDetailScreen}
          options={{
            headerShown: false,
            gestureEnabled: true,
            animation: 'none', // 禁用默认动画，使用自定义聚光灯动画
            animationDuration: 0, // 确保没有过渡动画
          }}
        />
        
        {/* 模态屏幕组 */}
        <RootStack.Group
          screenOptions={{
            presentation: 'modal',
            headerShown: false,
            gestureEnabled: true,
            animation: 'slide_from_right',
            animationDuration: 200,
            animationTypeForReplace: 'pop',
          }}
        >
          <RootStack.Screen 
            name="CreateSignalModal" 
            component={CreateSignalScreen}
            options={{
              animationTypeForReplace: 'pop',
              gestureDirection: 'vertical',
            }}
          />
          <RootStack.Screen 
            name="CreateProposalModal" 
            component={CreateProposalScreen}
            options={{
              animationTypeForReplace: 'pop',
              gestureDirection: 'vertical',
            }}
          />
          <RootStack.Screen 
            name="CreateWishModal" 
            component={CreateWishScreen}
            options={{
              animationTypeForReplace: 'pop',
              gestureDirection: 'vertical',
            }}
          />
          <RootStack.Screen 
            name="CreatePlanModal" 
            component={CreatePlanScreen}
            options={{
              animationTypeForReplace: 'pop',
              gestureDirection: 'vertical',
            }}
          />
        </RootStack.Group>
      </RootStack.Navigator>
      
      {/* 全局悬浮行动按钮 - 现在在导航容器内部 */}
      <FloatingActionButton />
    </>
  );
};

const AppNavigator: React.FC = () => {
  const { colors } = useTheme();

  return (
    <SafeAreaProvider>
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <NavigationContainer>
          <NavigatorWithFAB />
        </NavigationContainer>
      </View>
    </SafeAreaProvider>
  );
};

export default AppNavigator; 