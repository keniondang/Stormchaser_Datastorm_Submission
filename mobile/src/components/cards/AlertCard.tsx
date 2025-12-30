import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { StockoutAlert } from '../../types';
import { Colors, FontSizes, FontWeights, Spacing } from '../../utils/constants';
import { formatDateShort, getRiskColor } from '../../utils/formatters';

interface AlertCardProps {
  alert: StockoutAlert;
}

export default function AlertCard({ alert }: AlertCardProps) {
  const riskColor = getRiskColor(alert.priority);
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.skuName}>{alert.sku_name}</Text>
          <Text style={styles.location}>{alert.city}, {alert.country}</Text>
        </View>
        <View style={[styles.priorityBadge, { backgroundColor: riskColor + '20' }]}>
          <Text style={[styles.priorityText, { color: riskColor }]}>
            {alert.priority}
          </Text>
        </View>
      </View>
      
      <View style={styles.metrics}>
        <View style={styles.metric}>
          <Text style={styles.metricLabel}>Risk Score</Text>
          <Text style={[styles.metricValue, { color: riskColor }]}>
            {(alert.stockout_risk_score * 100).toFixed(0)}%
          </Text>
        </View>
        <View style={styles.metric}>
          <Text style={styles.metricLabel}>Coverage Days</Text>
          <Text style={styles.metricValue}>
            {alert.inventory_coverage_days.toFixed(1)}
          </Text>
        </View>
        <View style={styles.metric}>
          <Text style={styles.metricLabel}>Current Stock</Text>
          <Text style={styles.metricValue}>
            {Math.round(alert.current_stock)}
          </Text>
        </View>
      </View>
      
      <Text style={styles.date}>{formatDateShort(alert.date)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: Colors.error,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  headerLeft: {
    flex: 1,
  },
  skuName: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.semibold,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  location: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
  },
  priorityBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: 6,
  },
  priorityText: {
    fontSize: FontSizes.xs,
    fontWeight: FontWeights.semibold,
  },
  metrics: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  metric: {
    flex: 1,
  },
  metricLabel: {
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  metricValue: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.semibold,
    color: Colors.text,
  },
  date: {
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
  },
});

