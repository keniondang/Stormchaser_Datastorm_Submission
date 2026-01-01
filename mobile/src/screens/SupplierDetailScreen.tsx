import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { RouteProp, useRoute } from '@react-navigation/native';
import { RootStackParamList } from '../types';
import { supplyChainApi } from '../services/api';
import { SupplierDetail } from '../types';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorView from '../components/common/ErrorView';
import LineChart from '../components/charts/LineChart';
import { Colors, FontSizes, FontWeights, Spacing } from '../utils/constants';
import { getRiskColor, formatPercentage } from '../utils/formatters';

type SupplierDetailRouteProp = RouteProp<RootStackParamList, 'SupplierDetail'>;

export default function SupplierDetailScreen() {
  const route = useRoute<SupplierDetailRouteProp>();
  const { supplierId } = route.params;
  const [detail, setDetail] = useState<SupplierDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDetail = async () => {
      try {
        setError(null);
        const data = await supplyChainApi.getSupplierDetail(supplierId);
        setDetail(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load supplier details');
      } finally {
        setLoading(false);
      }
    };

    loadDetail();
  }, [supplierId]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorView message={error} />;
  }

  if (!detail) {
    return <ErrorView message="Supplier not found" />;
  }

  const { supplier } = detail;
  const riskColor = getRiskColor(supplier.risk_class);

  // Prepare lead time chart data
  const leadTimeData = {
    labels: detail.lead_time_history.slice(-7).map((h) => {
      const date = new Date(h.date);
      return `${date.getMonth() + 1}/${date.getDate()}`;
    }),
    datasets: [
      {
        data: detail.lead_time_history.slice(-7).map((h) => h.lead_time_days),
        color: (opacity = 1) => `rgba(37, 99, 235, ${opacity})`,
        strokeWidth: 2,
      },
    ],
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.supplierId}>{supplier.supplier_id}</Text>
            <Text style={styles.meta}>{supplier.total_orders} total orders</Text>
          </View>
          <View style={[styles.riskBadge, { backgroundColor: riskColor + '20' }]}>
            <Text style={[styles.riskText, { color: riskColor }]}>
              {supplier.risk_class}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Performance Metrics</Text>
          <View style={styles.metricsGrid}>
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>Average Lead Time</Text>
              <Text style={styles.metricValue}>
                {supplier.avg_lead_time.toFixed(1)} days
              </Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>Lead Time Std Dev</Text>
              <Text style={styles.metricValue}>
                {supplier.lead_time_std.toFixed(1)} days
              </Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>Coefficient of Variation</Text>
              <Text style={styles.metricValue}>
                {supplier.coefficient_of_variation.toFixed(2)}
              </Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>Reliability Index</Text>
              <Text style={styles.metricValue}>
                {supplier.reliability_index.toFixed(2)}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Risk Indicators</Text>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Stockout Rate</Text>
            <Text
              style={[
                styles.detailValue,
                {
                  color:
                    supplier.stockout_rate > 0.05 ? Colors.error : Colors.success,
                },
              ]}
            >
              {formatPercentage(supplier.stockout_rate * 100)}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Average Stockout Risk</Text>
            <Text style={styles.detailValue}>
              {formatPercentage(supplier.avg_stockout_risk * 100)}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Stockout Incidents</Text>
            <Text style={styles.detailValue}>{detail.stockout_incidents}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Performance Trend</Text>
            <Text
              style={[
                styles.detailValue,
                {
                  color:
                    detail.performance_trend === 'Improving'
                      ? Colors.success
                      : detail.performance_trend === 'Declining'
                      ? Colors.error
                      : Colors.text,
                },
              ]}
            >
              {detail.performance_trend}
            </Text>
          </View>
        </View>

        {detail.lead_time_history && detail.lead_time_history.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Lead Time History</Text>
            <LineChart data={leadTimeData} height={200} />
          </View>
        )}

        {detail.recommendations && detail.recommendations.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recommendations</Text>
            {detail.recommendations.map((recommendation, index) => (
              <View key={index} style={styles.recommendationItem}>
                <Text style={styles.recommendationText}>• {recommendation}</Text>
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
  supplierId: {
    fontSize: FontSizes.xxl,
    fontWeight: FontWeights.bold,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  meta: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
  },
  riskBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 8,
  },
  riskText: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.semibold,
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
  recommendationItem: {
    paddingVertical: Spacing.xs,
  },
  recommendationText: {
    fontSize: FontSizes.md,
    color: Colors.text,
    lineHeight: 24,
  },
});

