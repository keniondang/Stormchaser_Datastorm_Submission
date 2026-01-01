import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { isUsingMockApi } from '../../services/api';
import { Colors, FontSizes, FontWeights, Spacing } from '../../utils/constants';

export default function MockDataIndicator() {
  const usingMock = isUsingMockApi();
  
  if (!usingMock) {
    return null;
  }
  
  return (
    <View style={styles.container}>
      <Text style={styles.text}>📡 Using Mock Data (Backend Offline)</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.warning + '20',
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: Colors.warning + '40',
  },
  text: {
    fontSize: FontSizes.xs,
    color: Colors.warning,
    fontWeight: FontWeights.medium,
  },
});


