import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { RootStackParamList, MainTabParamList } from '../types';
import DashboardScreen from '../screens/DashboardScreen';
import PromotionsScreen from '../screens/PromotionsScreen';
import SupplyChainScreen from '../screens/SupplyChainScreen';
import PromotionDetailScreen from '../screens/PromotionDetailScreen';
import SupplierDetailScreen from '../screens/SupplierDetailScreen';
import { Colors } from '../utils/constants';

const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textSecondary,
        headerStyle: {
          backgroundColor: Colors.surface,
        },
        headerTintColor: Colors.text,
        headerTitleStyle: {
          fontWeight: '600',
        },
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          title: 'Dashboard',
          tabBarLabel: 'Dashboard',
        }}
      />
      <Tab.Screen
        name="Promotions"
        component={PromotionsScreen}
        options={{
          title: 'Promotions',
          tabBarLabel: 'Promotions',
        }}
      />
      <Tab.Screen
        name="SupplyChain"
        component={SupplyChainScreen}
        options={{
          title: 'Supply Chain',
          tabBarLabel: 'Supply Chain',
        }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: Colors.surface,
          },
          headerTintColor: Colors.text,
          headerTitleStyle: {
            fontWeight: '600',
          },
        }}
      >
        <Stack.Screen
          name="MainTabs"
          component={MainTabs}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="PromotionDetail"
          component={PromotionDetailScreen}
          options={{ title: 'Promotion Details' }}
        />
        <Stack.Screen
          name="SupplierDetail"
          component={SupplierDetailScreen}
          options={{ title: 'Supplier Details' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

