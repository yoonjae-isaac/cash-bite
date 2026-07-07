'use client';

import { Toaster } from 'sonner';
import 'sonner/dist/styles.css';
import { useThemeStore } from '../../application/theme/useThemeStore';

/**
 * sonner Toaster — 테마 스토어에 맞춰 다크/라이트. 기존 App.tsx 의 Toaster 설정을 그대로 이관.
 */
export default function AppToaster() {
  const theme = useThemeStore((s) => s.theme);

  return (
    <Toaster
      position="bottom-center"
      theme={theme === 'dark' ? 'dark' : 'light'}
      richColors={false}
      closeButton
      toastOptions={{
        classNames: {
          toast:
            '!bg-cb-surface !border !border-cb-border !text-cb-foreground !shadow-xl !shadow-[var(--cb-shadow-soft)]',
          title: '!text-cb-foreground',
          description: '!text-cb-muted',
          error: '!border-cb-negative/40',
          success: '!border-cb-positive/35',
        },
      }}
    />
  );
}
