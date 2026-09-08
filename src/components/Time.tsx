import { useEffect, useState } from 'react';
import { profile } from '../config';
import { beijingTime, runtime } from '../lib/time';

function useNow() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);
  return now;
}

export function BeijingClock() {
  const now = useNow();
  return <div className="time animate fade-in fast delay-2"><i aria-hidden="true" />{' '}<span aria-label="北京时间">{beijingTime(now)}</span></div>;
}

export function SiteFooter() {
  const now = useNow();
  return <footer className="right_foot">
    <div className="right_f_l"><p>
      <span>© {now.getFullYear()} <a href={profile.links.icp} target="_blank" rel="noopener noreferrer">萌 ICP 備 2020060315 號</a></span>{' '}
      <a href={profile.links.travellings} target="_blank" rel="noopener noreferrer" title="开往 · 友链接力">/ Travellings / </a>{' '}
      <span>本站已運行: {runtime(now, profile.startedAt)}</span>
    </p></div>
  </footer>;
}
