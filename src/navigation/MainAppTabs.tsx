import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Platform, StyleSheet } from 'react-native';
import { useTheme } from '../state/ThemeContext';
import AppIcon from '../components/atoms/AppIcon';
import AppBlurView from '../components/atoms/BlurView';
import { spacing } from '../styles/theme';

// Import screens
import TimelineScreen from '../screens/TimelineScreen';
import FootprintsScreen from '../screens/FootprintsScreen';
import VendingMachineScreen from '../screens/VendingMachineScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();

const MainAppTabs: React.FC = () => {
  const { colors, isDark } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabBarLabel,
        tabBarIconStyle: styles.tabBarIcon,
        tabBarBackground: () => (
          <AppBlurView
            blurType={isDark ? 'dark' : 'light'}
            blurAmount={35}
            style={StyleSheet.absoluteFill}
          />
        ),
      }}
    >
      <Tab.Screen
        name="Timeline"
        component={TimelineScreen}
        options={{
          tabBarLabel: '首页',
          tabBarIcon: ({ color, size, focused }) => (
            <AppIcon name={focused ? 'home' : 'home-outline'} size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Footprints"
        component={FootprintsScreen}
        options={{
          tabBarLabel: '日历',
          tabBarIcon: ({ color, size, focused }) => (
            <AppIcon name={focused ? 'calendar' : 'calendar-outline'} size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="VendingMachine"
        component={VendingMachineScreen}
        options={{
          tabBarLabel: '益圈',
          tabBarIcon: ({ color, size, focused }) => (
            <AppIcon name={focused ? 'compass' : 'compass-outline'} size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: '我的',
          tabBarIcon: ({ color, size, focused }) => (
            <AppIcon name={focused ? 'person' : 'person-outline'} size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 0,
    backgroundColor: 'transparent',
    height: Platform.OS === 'ios' ? spacing.xl * 2.5 : spacing.xl * 2.2,
    paddingBottom: Platform.OS === 'ios' ? spacing.l : spacing.s,
    paddingTop: spacing.s,
  },
  tabBarLabel: {
    fontSize: 10,
    fontWeight: '500',
    marginBottom: Platform.OS === 'ios' ? -spacing.xs : spacing.xs,
  },
  tabBarIcon: {
    marginTop: spacing.xs,
  }
});

export default MainAppTabs; 