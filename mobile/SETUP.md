# Quick Setup Guide

## Fixing Network Errors

If you see "Network Error" or "Cannot connect to backend", follow these steps:

### 1. Start the Backend Server

Open a terminal and run:

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The backend should be running at `http://localhost:8000`

### 2. Verify Backend is Running

Open your browser and visit:
- http://localhost:8000/health
- http://localhost:8000/docs (API documentation)

You should see a response.

### 3. Configure Mobile App API URL

The app automatically detects the platform:

- **iOS Simulator**: Uses `http://localhost:8000`
- **Android Emulator**: Uses `http://10.0.2.2:8000` (automatically set)
- **Physical Device**: You need to use your computer's IP address

#### For Physical Devices:

1. Find your computer's local IP address:
   - **Windows**: Run `ipconfig` and look for IPv4 Address
   - **Mac/Linux**: Run `ifconfig` or `ip addr` and look for inet address

2. Update `mobile/src/services/api.ts`:
   ```typescript
   const API_BASE_URL = 'http://YOUR_IP_ADDRESS:8000';
   // Example: 'http://192.168.1.100:8000'
   ```

3. Make sure your phone and computer are on the same WiFi network

4. Make sure your firewall allows connections on port 8000

### 4. Restart the Mobile App

After making changes:
1. Stop the Expo server (Ctrl+C)
2. Clear cache: `expo start -c`
3. Reload the app

## Testing the Connection

The app will now show helpful error messages if the backend isn't reachable. Check the console logs for API request details.

## Common Issues

- **"ECONNREFUSED"**: Backend not running or wrong port
- **"Network Error"**: Wrong IP address or firewall blocking
- **Timeout**: Backend is slow or not responding

