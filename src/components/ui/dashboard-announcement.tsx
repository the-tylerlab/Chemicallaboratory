'use client';

import { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Theme } from '@astryxdesign/core/theme';
import { neutralTheme } from '@astryxdesign/theme-neutral/built';
import Banner, { type BannerStatus } from './astryx-banner';

import '@astryxdesign/core/reset.css';
import '@astryxdesign/core/astryx.css';
import '@astryxdesign/theme-neutral/theme.css';

type AnnouncementState = {
  title: string;
  description: string;
  setKey: string;
  status: BannerStatus;
  visible: boolean;
};

function getAnnouncementState(): AnnouncementState | null {
  const bar = document.getElementById('announcementTickerBar');
  const dataRoot = document.getElementById('announcementTickerData');
  const badge = document.getElementById('tickerBadgeText');
  const track = document.getElementById('tickerMarqueeTrack');
  if (!bar || !dataRoot || !badge || !track) return null;

  const currentMessage = Array.from(track.querySelectorAll<HTMLElement>('.ticker-text-item'))
    .map(item => Array.from(item.querySelectorAll<HTMLElement>('span:not(.ticker-text-dot)'))
      .map(span => span.textContent?.trim() ?? '')
      .filter(Boolean)
      .join(' '))
    .filter(Boolean)[0] ?? '';
  const configuredMessages = (window as Window & { announcementTickerFlipState?: { messages?: string[] } })
    .announcementTickerFlipState?.messages;
  const setKey = JSON.stringify(configuredMessages?.length ? configuredMessages : [currentMessage]);
  const theme = Array.from(bar.classList)
    .find(className => className.startsWith('ticker-theme-'))
    ?.replace('ticker-theme-', '');
  const status: BannerStatus = theme === 'green'
    ? 'success'
    : theme === 'orange' || theme === 'red'
      ? 'warning'
      : 'info';
  return {
    title: badge.textContent?.trim() || 'ประกาศสำคัญ',
    description: currentMessage || 'ยังไม่มีข้อความประกาศ',
    setKey,
    status,
    visible: bar.style.display !== 'none',
  };
}

function DashboardAnnouncement({ bar, initialState }: { bar: HTMLElement; initialState: AnnouncementState }) {
  const [announcement, setAnnouncement] = useState(initialState);
  const [dismissedSet, setDismissedSet] = useState('');

  useEffect(() => {
    const dataRoot = document.getElementById('announcementTickerData');
    const badge = document.getElementById('tickerBadgeText');
    const track = document.getElementById('tickerMarqueeTrack');
    if (!dataRoot || !badge || !track) return;

    const refresh = () => {
      const next = getAnnouncementState();
      if (!next) return;
      setAnnouncement(current => current.title === next.title
        && current.description === next.description
        && current.setKey === next.setKey
        && current.status === next.status
        && current.visible === next.visible
        ? current
        : next);
    };

    const observer = new MutationObserver(refresh);
    observer.observe(dataRoot, { subtree: true, childList: true, characterData: true, attributes: true });
    observer.observe(bar, { attributes: true, attributeFilter: ['class', 'style'] });
    return () => observer.disconnect();
  }, [bar]);

  useEffect(() => {
    bar.classList.toggle('is-dismissed', dismissedSet === announcement.setKey && dismissedSet !== '');
  }, [announcement.setKey, bar, dismissedSet]);

  if (!announcement.visible || dismissedSet === announcement.setKey) return null;

  return (
    <Theme theme={neutralTheme} mode="light">
      <Banner
        key={announcement.setKey}
        className="dashboard-announcement-banner"
        status={announcement.status}
        title={announcement.title}
        description={announcement.description}
        container="card"
        elevation="none"
        isDismissable
        dismissLabel="ปิดประกาศ"
        collapsible={false}
        onDismiss={() => setDismissedSet(announcement.setKey)}
      />
    </Theme>
  );
}

const bar = document.getElementById('announcementTickerBar');
const rootElement = document.getElementById('dashboardAnnouncementRoot');
const initialState = getAnnouncementState();

if (bar && rootElement && initialState) {
  createRoot(rootElement).render(<DashboardAnnouncement bar={bar} initialState={initialState} />);
}
