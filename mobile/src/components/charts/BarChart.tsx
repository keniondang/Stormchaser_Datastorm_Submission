import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { BarChart as RNBarChart } from 'react-native-chart-kit';
import { Colors } from '../../utils/constants';

interface BarChartProps {
  data: {
    labels: string[];
    datasets: Array<{
      data: number[];
    }>;
  };
  title?: string;
  height?: number;
}

export default function BarChart({ data, title, height = 220 }: BarChartProps) {
  const screenWidth = Dimensions.get('window').width;
  
  const chartConfig = {
    backgroundColor: Colors.surface,
    backgroundGradientFrom: Colors.surface,
    backgroundGradientTo: Colors.surface,
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(37, 99, 235, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(30, 41, 59, ${opacity})`,
    style: {
      borderRadius: 16,
    },
  };

  return (
    <View style={styles.container}>
      <RNBarChart
        data={data}
        width={screenWidth - 32}
        height={height}
        chartConfig={chartConfig}
        style={styles.chart}
        withInnerLines={true}
        withOuterLines={true}
        withVerticalLabels={true}
        withHorizontalLabels={true}
        showValuesOnTopOfBars={true}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
});

