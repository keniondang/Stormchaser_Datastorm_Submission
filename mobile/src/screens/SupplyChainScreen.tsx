import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { supplyChainApi } from '../services/api';
import { StockoutAlert, SupplierReliability, RootStackParamList } from '../types';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorView from '../components/common/ErrorView';
import AlertCard from '../components/cards/AlertCard';
import { Colors, FontSizes, FontWeights, Spacing } from '../utils/constants';
import { getRiskColor, formatPercentage } from '../utils/formatters';

type NavigationProp = StackNavigationProp<RootStackParamList>;

export default function SupplyChainScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [alerts, setAlerts] = useState<StockoutAlert[]>([]);
  const [suppliers, setSuppliers] = useState<SupplierReliability[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'alerts' | 'suppliers'>('alerts');

  const loadData = async () => {
    try {
      setError(null);
      const [alertsData, suppliersData] = await Promise.all([
        supplyChainApi.getAlerts('HIGH', 20),
        supplyChainApi.getSuppliers(undefined, 20),
      ]);
      setAlerts(alertsData);
      setSuppliers(suppliersData);
    } catch (err: any) {
      setError(err.message || 'Failed to load supply chain data');
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

  const handleSupplierPress = (supplierId: string) => {
    navigation.navigate('SupplierDetail', { supplierId });
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorView message={error} onRetry={loadData} />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'alerts' && styles.tabActive]}
          onPress={() => setActiveTab('alerts')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'alerts' && styles.tabTextActive,
            ]}
          >
            Alerts ({alerts.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'suppliers' && styles.tabActive]}
          onPress={() => setActiveTab('suppliers')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'suppliers' && styles.tabTextActive,
            ]}
          >
            Suppliers ({suppliers.length})
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.content}>
          {activeTab === 'alerts' ? (
            <>
              <Text style={styles.sectionTitle}>Stockout Risk Alerts</Text>
              {alerts.length > 0 ? (
                alerts.map((alert) => <AlertCard key={alert.id} alert={alert} />)
              ) : (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>No alerts at this time</Text>
                </View>
              )}
            </>
          ) : (
            <>
              <Text style={styles.sectionTitle}>Supplier Reliability</Text>
              {suppliers.map((supplier) => {
                const riskColor = getRiskColor(supplier.risk_class);
                return (
                  <TouchableOpacity
                    key={supplier.supplier_id}
                    style={styles.supplierCard}
                    onPress={() => handleSupplierPress(supplier.supplier_id)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.supplierHeader}>
                      <View style={styles.supplierHeaderLeft}>
                        <Text style={styles.supplierId}>{supplier.supplier_id}</Text>
                        <Text style={styles.supplierMeta}>
                          {supplier.total_orders} orders
                        </Text>
                      </View>
                      <View
                        style={[
                          styles.riskBadge,
                          { backgroundColor: riskColor + '20' },
                        ]}
                      >
                        <Text style={[styles.riskText, { color: riskColor }]}>
                          {supplier.risk_class}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.supplierMetrics}>
                      <View style={styles.supplierMetric}>
                        <Text style={styles.supplierMetricLabel}>Avg Lead Time</Text>
                        <Text style={styles.supplierMetricValue}>
                          {supplier.avg_lead_time.toFixed(1)} days
                        </Text>
                      </View>
                      <View style={styles.supplierMetric}>
                        <Text style={styles.supplierMetricLabel}>Lead Time Std</Text>
                        <Text style={styles.supplierMetricValue}>
                          {supplier.lead_time_std.toFixed(1)} days
                        </Text>
                      </View>
                      <View style={styles.supplierMetric}>
                        <Text style={styles.supplierMetricLabel}>Stockout Rate</Text>
                        <Text
                          style={[
                            styles.supplierMetricValue,
                            { color: supplier.stockout_rate > 0.05 ? Colors.error : Colors.success },
                          ]}
                        >
                          {formatPercentage(supplier.stockout_rate * 100)}
                        </Text>
                      </View>
                      <View style={styles.supplierMetric}>
                        <Text style={styles.supplierMetricLabel}>Reliability Index</Text>
                        <Text style={styles.supplierMetricValue}>
                          {supplier.reliability_index.toFixed(2)}
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}
              {suppliers.length === 0 && (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>No suppliers found</Text>
                </View>
              )}
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  tab: {
    flex: 1,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: Colors.primary,
  },
  tabText: {
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
    fontWeight: FontWeights.medium,
  },
  tabTextActive: {
    color: Colors.primary,
    fontWeight: FontWeights.semibold,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: Spacing.md,
  },
  sectionTitle: {
    fontSize: FontSizes.xl,
    fontWeight: FontWeights.bold,
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  supplierCard: {
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
  supplierHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  supplierHeaderLeft: {
    flex: 1,
  },
  supplierId: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.semibold,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  supplierMeta: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
  },
  riskBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: 6,
  },
  riskText: {
    fontSize: FontSizes.xs,
    fontWeight: FontWeights.semibold,
  },
  supplierMetrics: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  supplierMetric: {
    width: '48%',
    marginBottom: Spacing.sm,
  },
  supplierMetricLabel: {
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  supplierMetricValue: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.semibold,
    color: Colors.text,
  },
  emptyContainer: {
    padding: Spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
  },
});

