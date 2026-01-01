import { format, parseISO } from 'date-fns';

export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

export const formatNumber = (value: number, decimals: number = 0): string => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
};

export const formatPercentage = (value: number, decimals: number = 1): string => {
  return `${value.toFixed(decimals)}%`;
};

export const formatDate = (dateString: string): string => {
  try {
    const date = parseISO(dateString);
    return format(date, 'MMM dd, yyyy');
  } catch {
    return dateString;
  }
};

export const formatDateShort = (dateString: string): string => {
  try {
    const date = parseISO(dateString);
    return format(date, 'MMM dd');
  } catch {
    return dateString;
  }
};

export const getRiskColor = (riskClass: string): string => {
  const riskColors: Record<string, string> = {
    high: '#ef4444',
    medium: '#f59e0b',
    low: '#10b981',
    reliable: '#10b981',
    'slow but stable': '#3b82f6',
    unreliable: '#f59e0b',
    'high-risk': '#ef4444',
  };
  return riskColors[riskClass.toLowerCase()] || '#64748b';
};

