/**
 * Haptic feedback utility for mobile devices
 * Provides tactile feedback for user interactions
 */

export type HapticStyle = 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error';

export const triggerHaptic = (style: HapticStyle = 'light'): void => {
  if (!('vibrate' in navigator)) return;

  const patterns: Record<HapticStyle, number | number[]> = {
    light: 10,
    medium: 20,
    heavy: 30,
    success: [10, 50, 10],
    warning: [20, 100, 20],
    error: [30, 100, 30, 100, 30],
  };

  navigator.vibrate(patterns[style]);
};
