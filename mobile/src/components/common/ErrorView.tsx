import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Colors, FontSizes, FontWeights, Spacing } from '../../utils/constants';

interface ErrorViewProps {
  message: string;
  onRetry?: () => void;
}

export default function ErrorView({ message, onRetry }: ErrorViewProps) {
  const isNetworkError = message.toLowerCase().includes('cannot connect') || 
                        message.toLowerCase().includes('network error') ||
                        message.toLowerCase().includes('no response');
  
  const getHelpText = () => {
    if (isNetworkError) {
      return Platform.OS === 'android' 
        ? 'For Android: Make sure backend is running and use 10.0.2.2:8000'
        : 'For iOS: Make sure backend is running at localhost:8000';
    }
    return null;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.message}>{message}</Text>
      {getHelpText() && (
        <View style={styles.helpContainer}>
          <Text style={styles.helpTitle}>Troubleshooting:</Text>
          <Text style={styles.helpText}>1. Start the backend: cd backend && uvicorn app.main:app --reload</Text>
          <Text style={styles.helpText}>2. Check the API URL in src/services/api.ts</Text>
          <Text style={styles.helpText}>3. For physical devices, use your computer's IP address</Text>
        </View>
      )}
      {onRetry && (
        <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  message: {
    fontSize: FontSizes.md,
    color: Colors.error,
    textAlign: 'center',
    marginBottom: Spacing.md,
    fontWeight: FontWeights.semibold,
  },
  helpContainer: {
    backgroundColor: Colors.background,
    padding: Spacing.md,
    borderRadius: 8,
    marginBottom: Spacing.md,
    width: '100%',
    maxWidth: 400,
  },
  helpTitle: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.bold,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  helpText: {
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
    lineHeight: 18,
  },
  retryButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: 8,
    marginTop: Spacing.sm,
  },
  retryText: {
    color: Colors.surface,
    fontSize: FontSizes.md,
    fontWeight: FontWeights.semibold,
  },
});

