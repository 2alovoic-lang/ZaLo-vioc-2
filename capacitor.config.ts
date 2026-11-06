import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.zalovoice.app',
  appName: 'ZaLoVoice',
  webDir: 'dist',
  android: {
    allowMixedContent: false,
  },
};

export default config;
