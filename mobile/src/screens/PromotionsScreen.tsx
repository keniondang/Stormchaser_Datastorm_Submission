import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { promotionsApi } from '../services/api';
import { PromotionRecommendation, RootStackParamList } from '../types';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorView from '../components/common/ErrorView';
import PromotionCard from '../components/cards/PromotionCard';
import { Colors, FontSizes, FontWeights, Spacing } from '../utils/constants';

type NavigationProp = StackNavigationProp<RootStackParamList>;

export default function PromotionsScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [promotions, setPromotions] = useState<PromotionRecommendation[]>([]);
  const [filteredPromotions, setFilteredPromotions] = useState<PromotionRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'ALL' | 'APPROVE' | 'REJECT'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const loadData = async () => {
    try {
      setError(null);
      const data = await promotionsApi.getList();
      setPromotions(data);
      setFilteredPromotions(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load promotions');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    let filtered = promotions;

    // Apply status filter
    if (filter !== 'ALL') {
      filtered = filtered.filter((p) => p.promo_decision === filter);
    }

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.sku_name.toLowerCase().includes(query) ||
          p.sku_id.toLowerCase().includes(query) ||
          p.channel.toLowerCase().includes(query)
      );
    }

    setFilteredPromotions(filtered);
  }, [promotions, filter, searchQuery]);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handlePromotionPress = (promotionId: string) => {
    navigation.navigate('PromotionDetail', { promotionId });
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorView message={error} onRetry={loadData} />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.filters}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search SKU, channel..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor={Colors.textSecondary}
        />
        <View style={styles.filterButtons}>
          <TouchableOpacity
            style={[styles.filterButton, filter === 'ALL' && styles.filterButtonActive]}
            onPress={() => setFilter('ALL')}
          >
            <Text
              style={[
                styles.filterButtonText,
                filter === 'ALL' && styles.filterButtonTextActive,
              ]}
            >
              All
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, filter === 'APPROVE' && styles.filterButtonActive]}
            onPress={() => setFilter('APPROVE')}
          >
            <Text
              style={[
                styles.filterButtonText,
                filter === 'APPROVE' && styles.filterButtonTextActive,
              ]}
            >
              Approved
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, filter === 'REJECT' && styles.filterButtonActive]}
            onPress={() => setFilter('REJECT')}
          >
            <Text
              style={[
                styles.filterButtonText,
                filter === 'REJECT' && styles.filterButtonTextActive,
              ]}
            >
              Rejected
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.content}>
          <Text style={styles.countText}>
            {filteredPromotions.length} promotion{filteredPromotions.length !== 1 ? 's' : ''}
          </Text>
          {filteredPromotions.map((promotion) => (
            <PromotionCard
              key={promotion.id}
              promotion={promotion}
              onPress={() => handlePromotionPress(promotion.id)}
            />
          ))}
          {filteredPromotions.length === 0 && (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No promotions found</Text>
            </View>
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
  filters: {
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  searchInput: {
    backgroundColor: Colors.background,
    borderRadius: 8,
    padding: Spacing.sm,
    marginBottom: Spacing.sm,
    fontSize: FontSizes.md,
    color: Colors.text,
  },
  filterButtons: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  filterButton: {
    flex: 1,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: 8,
    backgroundColor: Colors.background,
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: Colors.primary,
  },
  filterButtonText: {
    fontSize: FontSizes.sm,
    color: Colors.text,
    fontWeight: FontWeights.medium,
  },
  filterButtonTextActive: {
    color: Colors.surface,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: Spacing.md,
  },
  countText: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
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

