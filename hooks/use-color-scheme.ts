import { useContext } from 'react';
import { useColorScheme as useRNColorScheme } from 'react-native';

import { AppSettingsContext } from '@/app/providers/AppSettingsProvider';

export function useColorScheme() {
  const appSettings = useContext(AppSettingsContext);
  const systemTheme = useRNColorScheme();

  if (appSettings?.theme) {
    return appSettings.theme;
  }

  return systemTheme ?? 'light';
}
