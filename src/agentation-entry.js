import React from 'react';
import { createRoot } from 'react-dom/client';
import { Agentation } from 'agentation';

function isDevEnvironment() {
  if (typeof window === 'undefined' || !window.location) return false;
  const hostname = window.location.hostname;
  const isLocal = hostname === 'localhost' ||
                  hostname === '127.0.0.1' ||
                  hostname === '0.0.0.0' ||
                  hostname.endsWith('.local');
  const hasParam = new URLSearchParams(window.location.search).has('agentation');
  return isLocal || hasParam;
}

function initAgentation() {
  if (!isDevEnvironment()) return;
  if (document.getElementById('agentation-root')) return;

  const container = document.createElement('div');
  container.id = 'agentation-root';
  container.style.position = 'relative';
  container.style.zIndex = '999999';
  document.body.appendChild(container);

  try {
    const root = createRoot(container);
    root.render(
      React.createElement(Agentation, {
        copyToClipboard: true,
        useHashLocation: false,
        appName: 'SciPortal Chemical Laboratory',
        onSubmit: (output, annotations) => {
          console.log('[Agentation] Feedback recorded:', annotations);
          if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(output)
              .then(() => console.log('[Agentation] Copied feedback to clipboard!'))
              .catch(err => console.warn('[Agentation] Clipboard copy error:', err));
          }
        }
      })
    );
    console.log('✅ Agentation visual feedback toolbar mounted (local development mode).');
  } catch (err) {
    console.error('❌ Failed to mount Agentation:', err);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAgentation);
} else {
  initAgentation();
}
