import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { RouteProp, useRoute } from '@react-navigation/native';
import { RootStackParamList } from '../types';
import { promotionsApi } from '../services/api';
import { PromotionDetail } from '../types';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorView from '../components/common/ErrorView';
import { Colors, FontSizes, FontWeights, Spacing } from '../utils/constants';
import { formatCurrency, formatPercentage, formatDate } from '../utils/formatters';

type PromotionDetailRouteProp = RouteProp<RootStackParamList, 'PromotionDetail'>;

export default function PromotionDetailScreen() {
  const route = useRoute<PromotionDetailRouteProp>();
  const { promotionId } = route.params;
  const [detail, setDetail] = useState<PromotionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDetail = async () => {
      try {
        setError(null);
        const data = await promotionsApi.getDetail(promotionId);
        setDetail(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load promotion details');
      } finally {
        setLoading(false);
      }
    };

    loadDetail();
  }, [promotionId]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorView message={error} />;
  }

  if (!detail) {
    return <ErrorView message="Promotion not found" />;
  }

  const { promotion } = detail;
  const isApproved = promotion.promo_decision === 'APPROVE';

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.skuName}>{promotion.sku_name}</Text>
            <Text style={styles.meta}>
              {promotion.channel} • {promotion.city}, {promotion.country}
            </Text>
            <Text style={styles.date}>{formatDate(promotion.date)}</Text>
          </View>
          <View
            style={[
              styles.decisionBadge,
              isApproved ? styles.approvedBadge : styles.rejectedBadge,
            ]}
          >
            <Text
              style={[
                styles.decisionText,
                isApproved ? styles.approvedText : styles.rejectedText,
              ]}
            >
              {promotion.promo_decision}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Promotion Details</Text>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Discount</Text>
            <Text style={styles.detailValue}>
              {formatPercentage(promotion.discount_pct * 100)}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>List Price</Text>
            <Text style={styles.detailValue}>{formatCurrency(promotion.list_price)}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Effective Price</Text>
            <Text style={styles.detailValue}>{formatCurrency(promotion.effective_price)}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Stock on Hand</Text>
            <Text style={styles.detailValue}>{Math.round(promotion.stock_on_hand)}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Stock Feasible</Text>
            <Text
              style={[
                styles.detailValue,
                promotion.stock_feasible ? { color: Colors.success } : { color: Colors.error },
              ]}
            >
              {promotion.stock_feasible ? 'Yes' : 'No'}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Demand Analysis</Text>
          <View style={styles.metricsGrid}>
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>Baseline Units</Text>
              <Text style={styles.metricValue}>
                {Math.round(detail.baseline_units_pred)}
              </Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>Predicted Units</Text>
              <Text style={styles.metricValue}>
                {Math.round(detail.predicted_units)}
              </Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>Incremental Units</Text>
              <Text style={[styles.metricValue, { color: Colors.success }]}>
                {Math.round(detail.incremental_units)}
              </Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>Price Elasticity</Text>
              <Text style={styles.metricValue}>
                {detail.price_elasticity
                  ? detail.price_elasticity.toFixed(2)
                  : 'N/A'}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Financial Impact</Text>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Margin per Unit</Text>
            <Text style={styles.detailValue}>
              {formatCurrency(detail.margin_per_unit)}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Incremental Margin</Text>
            <Text
              style={[
                styles.detailValue,
                { color: detail.incremental_margin > 0 ? Colors.success : Colors.error },
                styles.largeValue,
              ]}
            >
              {formatCurrency(detail.incremental_margin)}
            </Text>
          </View>
        </View>

        {detail.decision_reasons && detail.decision_reasons.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Decision Reasons</Text>
            {detail.decision_reasons.map((reason, index) => (
              <View key={index} style={styles.reasonItem}>
                <Text style={styles.reasonText}>• {reason}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: Spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.lg,
    backgroundColor: Colors.card,
    padding: Spacing.md,
    borderRadius: 12,
  },
  headerLeft: {
    flex: 1,
  },
  skuName: {
    fontSize: FontSizes.xxl,
    fontWeight: FontWeights.bold,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  meta: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  date: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
  },
  decisionBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 8,
  },
  approvedBadge: {
    backgroundColor: Colors.success + '20',
  },
  rejectedBadge: {
    backgroundColor: Colors.error + '20',
  },
  decisionText: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.semibold,
  },
  approvedText: {
    color: Colors.success,
  },
  rejectedText: {
    color: Colors.error,
  },
  section: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.bold,
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  detailLabel: {
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
  },
  detailValue: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.semibold,
    color: Colors.text,
  },
  largeValue: {
    fontSize: FontSizes.xl,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  metricCard: {
    width: '48%',
    backgroundColor: Colors.background,
    borderRadius: 8,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  metricLabel: {
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  metricValue: {
    fontSize: FontSizes.xl,
    fontWeight: FontWeights.bold,
    color: Colors.text,
  },
  reasonItem: {
    paddingVertical: Spacing.xs,
  },
  reasonText: {
    fontSize: FontSizes.md,
    color: Colors.text,
    lineHeight: 24,
  },
});

