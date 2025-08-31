import { useSettings } from '@/app/contexts/SettingsContext';

export function useCurrency() {
  const { formatCurrency } = useSettings();
  return { formatCurrency };
}