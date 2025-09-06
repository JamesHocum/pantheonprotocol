import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.864bd66b1356479ba657037fdf3c804c',
  appName: 'darkbert-cyber-nexus',
  webDir: 'dist',
  server: {
    url: 'https://864bd66b-1356-479b-a657-037fdf3c804c.lovableproject.com?forceHideBadge=true',
    cleartext: true,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#000000',
      showSpinner: true,
      spinnerColor: '#00ff41',
    },
    StatusBar: {
      style: 'dark',
      backgroundColor: '#000000',
    },
  },
};

export default config;