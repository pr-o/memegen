'use client';

import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';

/** Mounts global keyboard shortcuts. Renders nothing. */
export default function KeyboardHandler() {
  useKeyboardShortcuts();
  return null;
}
