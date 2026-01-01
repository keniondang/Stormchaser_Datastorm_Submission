import 'react-native-gesture-handler';
import React, { useState, useEffect } from 'react';
import { StatusBar, View, Text, Switch, StyleSheet, Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import { isUsingMockApi, enableMockApi, disableMockApi } from './src/services/api';

const DevToggle: React.FC = () => {
  const [useMock, setUseMock] = useState<boolean>(isUsingMockApi());

  useEffect(() => {
    setUseMock(isUsingMockApi());
  }, []);

  const onToggle = (value: boolean) => {
    if (value) {
      enableMockApi();
    } else {
      disableMockApi();
    }
    setUseMock(value);
  };

  // Only show on dev builds
  if (!__DEV__) return null;

  return (
    <View style={styles.devContainer} pointerEvents="box-none">
      <View style={styles.devRow}>
        <Text style={styles.devText}>Use Mock API</Text>
        <Switch
          value={useMock}
          onValueChange={onToggle}
          trackColor={{ false: '#767577', true: '#81b0ff' }}
          thumbColor={useMock ? '#2563eb' : Platform.OS === 'android' ? '#f4f3f4' : undefined}
        />
      </View>
      <Text style={styles.devHint}>{useMock ? 'Mock data active' : 'Using real backend'}</Text>
    </View>
  );
};

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <AppNavigator />
      <DevToggle />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  devContainer: {
    position: 'absolute',
    right: 12,
    top: 48,
    backgroundColor: 'rgba(255,255,255,0.95)',
    padding: 10,
    borderRadius: 8,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  devRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  devText: {
    fontSize: 14,
    marginRight: 8,
  },
  devHint: {
    fontSize: 12,
    color: '#666',
    marginTop: 6,
  },
});

