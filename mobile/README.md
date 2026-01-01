# FMCG Analytics Mobile App

React Native mobile application for FMCG promotion effectiveness and supply chain risk analytics.

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator (for Mac) or Android Studio (for Android development)

## Setup

1. Install dependencies:
```bash
cd mobile
npm install
```

2. Start the development server:
```bash
npm start
```

3. Run on your preferred platform:
   - Press `i` for iOS simulator
   - Press `a` for Android emulator
   - Scan QR code with Expo Go app on your device

## Configuration

### API Configuration

Update the API base URL in `src/services/api.ts`:

```typescript
const API_BASE_URL = __DEV__ 
  ? 'http://localhost:8000'  // Development
  : 'http://your-production-api.com';  // Production
```

For Android emulator, use `http://10.0.2.2:8000` instead of `localhost`.

For iOS simulator, use `http://localhost:8000`.

For physical devices, use your computer's local IP address (e.g., `http://192.168.1.100:8000`).

## Project Structure

```
mobile/
├── src/
│   ├── screens/          # Screen components
│   │   ├── DashboardScreen.tsx
│   │   ├── PromotionsScreen.tsx
│   │   ├── SupplyChainScreen.tsx
│   │   ├── PromotionDetailScreen.tsx
│   │   └── SupplierDetailScreen.tsx
│   ├── components/       # Reusable components
│   │   ├── charts/       # Chart components
│   │   ├── cards/        # Card components
│   │   └── common/       # Common components
│   ├── services/        # API services
│   ├── navigation/      # Navigation setup
│   ├── types/           # TypeScript types
│   └── utils/           # Utilities and constants
├── App.tsx              # Root component
└── package.json
```

## Features

### Dashboard
- Key performance indicators (KPIs)
- Sales trend charts
- Promotion summary
- Recent alerts

### Promotions
- List of promotion recommendations
- Filter by status (Approved/Rejected)
- Search functionality
- Detailed promotion analytics

### Supply Chain
- Stockout risk alerts
- Supplier reliability rankings
- Lead time analysis
- Risk indicators

## Development

### Adding New Screens

1. Create screen component in `src/screens/`
2. Add route to navigation in `src/navigation/AppNavigator.tsx`
3. Add types to `src/types/index.ts` if needed

### Adding New Components

1. Create component in appropriate `src/components/` subdirectory
2. Use design system constants from `src/utils/constants.ts`
3. Follow existing component patterns

## Building for Production

### iOS
```bash
expo build:ios
```

### Android
```bash
expo build:android
```

## Troubleshooting

### API Connection Issues

- Ensure backend server is running
- Check API_BASE_URL configuration
- Verify network connectivity
- For Android emulator, use `10.0.2.2` instead of `localhost`

### Metro Bundler Issues

- Clear cache: `expo start -c`
- Reset: `expo start --clear`

## Dependencies

- React Native
- React Navigation
- Axios (API calls)
- React Native Chart Kit (charts)
- Expo (development platform)

