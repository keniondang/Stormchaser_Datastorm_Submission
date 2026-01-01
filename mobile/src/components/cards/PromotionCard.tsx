import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { PromotionRecommendation } from '../../types';
import { Colors, FontSizes, FontWeights, Spacing } from '../../utils/constants';
import { formatCurrency, formatPercentage, formatDateShort } from '../../utils/formatters';

interface PromotionCardProps {
  promotion: PromotionRecommendation;
  onPress: () => void;
}

export default function PromotionCard({ promotion, onPress }: PromotionCardProps) {
  const isApproved = promotion.promo_decision === 'APPROVE';
  
  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.skuName}>{promotion.sku_name}</Text>
          <Text style={styles.channel}>{promotion.channel} • {promotion.city}</Text>
        </View>
        <View style={[styles.badge, isApproved ? styles.approvedBadge : styles.rejectedBadge]}>
          <Text style={[styles.badgeText, isApproved ? styles.approvedText : styles.rejectedText]}>
            {promotion.promo_decision}
          </Text>
        </View>
      </View>
      
      <View style={styles.metrics}>
        <View style={styles.metric}>
          <Text style={styles.metricLabel}>Incremental Units</Text>
          <Text style={styles.metricValue}>{Math.round(promotion.incremental_units)}</Text>
        </View>
        <View style={styles.metric}>
          <Text style={styles.metricLabel}>Margin</Text>
          <Text style={[styles.metricValue, { color: Colors.success }]}>
            {formatCurrency(promotion.incremental_margin)}
          </Text>
        </View>
        <View style={styles.metric}>
          <Text style={styles.metricLabel}>Discount</Text>
          <Text style={styles.metricValue}>
            {formatPercentage(promotion.discount_pct * 100)}
          </Text>
        </View>
      </View>
      
      <Text style={styles.date}>{formatDateShort(promotion.date)}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: Spacing.md,
    marginBottom: Spacing.md,
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
  channel: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
  },
  badge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: 6,
  },
  approvedBadge: {
    backgroundColor: Colors.success + '20',
  },
  rejectedBadge: {
    backgroundColor: Colors.error + '20',
  },
  badgeText: {
    fontSize: FontSizes.xs,
    fontWeight: FontWeights.semibold,
  },
  approvedText: {
    color: Colors.success,
  },
  rejectedText: {
    color: Colors.error,
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

