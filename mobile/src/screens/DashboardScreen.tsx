import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { dashboardApi } from '../services/api';
import { DashboardSummary, SalesTrend } from '../types';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorView from '../components/common/ErrorView';
import MockDataIndicator from '../components/common/MockDataIndicator';
import MetricCard from '../components/cards/MetricCard';
import AlertCard from '../components/cards/AlertCard';
import LineChart from '../components/charts/LineChart';
import { Colors, FontSizes, FontWeights, Spacing } from '../utils/constants';
import { formatCurrency, formatPercentage } from '../utils/formatters';

export default function DashboardScreen() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [salesTrend, setSalesTrend] = useState<SalesTrend | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    try {
      setError(null);
      const [summaryData, trendData] = await Promise.all([
        dashboardApi.getSummary(),
        dashboardApi.getSalesTrend(30),
      ]);
      setSummary(summaryData);
      setSalesTrend(trendData);
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorView message={error} onRetry={loadData} />;
  }

  if (!summary || !salesTrend) {
    return <ErrorView message="No data available" onRetry={loadData} />;
  }

  // Prepare chart data
  const chartLabels = salesTrend.dates.map((d) => {
    const date = new Date(d);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  });

  const salesChartData = {
    labels: chartLabels.slice(-7), // Last 7 days
    datasets: [
      {
        data: salesTrend.sales.slice(-7),
        color: (opacity = 1) => `rgba(37, 99, 235, ${opacity})`,
        strokeWidth: 2,
      },
    ],
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <MockDataIndicator />
      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Key Metrics</Text>
        <View style={styles.metricsGrid}>
          <View style={styles.metricRow}>
            <View style={styles.metricHalf}>
              <MetricCard
                title="Total Sales"
                value={formatCurrency(summary.kpis.total_sales)}
                color={Colors.primary}
              />
            </View>
            <View style={styles.metricHalf}>
              <MetricCard
                title="Promotion ROI"
                value={formatPercentage(summary.kpis.promotion_roi)}
                color={summary.kpis.promotion_roi > 0 ? Colors.success : Colors.error}
              />
            </View>
          </View>
          <View style={styles.metricRow}>
            <View style={styles.metricHalf}>
              <MetricCard
                title="Stockout Rate"
                value={formatPercentage(summary.kpis.stockout_rate)}
                color={summary.kpis.stockout_rate > 5 ? Colors.error : Colors.success}
              />
            </View>
            <View style={styles.metricHalf}>
              <MetricCard
                title="Reliable Suppliers"
                value={`${summary.kpis.reliable_suppliers}/${summary.kpis.total_suppliers}`}
                color={Colors.primary}
              />
            </View>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Sales Trend</Text>
        <LineChart data={salesChartData} height={200} />

        <View style={styles.promotionSummary}>
          <Text style={styles.sectionTitle}>Promotion Summary</Text>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Total</Text>
              <Text style={styles.summaryValue}>{summary.promotion_summary.total_promotions}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Approved</Text>
              <Text style={[styles.summaryValue, { color: Colors.success }]}>
                {summary.promotion_summary.approved_promotions}
              </Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Rejected</Text>
              <Text style={[styles.summaryValue, { color: Colors.error }]}>
                {summary.promotion_summary.rejected_promotions}
              </Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Margin</Text>
              <Text style={styles.summaryValue}>
                {formatCurrency(summary.promotion_summary.total_incremental_margin)}
              </Text>
            </View>
          </View>
        </View>

        {summary.recent_alerts && summary.recent_alerts.length > 0 && (
          <>
            <View style={styles.alertsHeader}>
              <Text style={styles.sectionTitle}>Recent Alerts</Text>
              <TouchableOpacity>
                <Text style={styles.viewAllText}>View All</Text>
              </TouchableOpacity>
            </View>
            {summary.recent_alerts.slice(0, 3).map((alert) => (
              <AlertCard key={alert.id} alert={alert} />
            ))}
          </>
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
  sectionTitle: {
    fontSize: FontSizes.xl,
    fontWeight: FontWeights.bold,
    color: Colors.text,
    marginBottom: Spacing.md,
    marginTop: Spacing.sm,
  },
  metricsGrid: {
    marginBottom: Spacing.md,
  },
  metricRow: {
    flexDirection: 'row',
    marginBottom: Spacing.sm,
  },
  metricHalf: {
    flex: 1,
    marginHorizontal: Spacing.xs,
  },
  promotionSummary: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  summaryValue: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.bold,
    color: Colors.text,
  },
  alertsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  viewAllText: {
    fontSize: FontSizes.sm,
    color: Colors.primary,
    fontWeight: FontWeights.semibold,
  },
});

