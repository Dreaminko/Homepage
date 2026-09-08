import { useEffect, useState } from 'react';
import { profile } from './config';
import { beijingTime, runtime } from './lib/time';
import { Photography } from './components/Photography';
import { SocialLinks } from './components/SocialLinks';

export default function App() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);
  return <div className="wrapper">
    <Photography />
    <div className="right">
      <main className="index_box">
        <div className="index_txt">
          <img className="avatar animate fade-up fast" src="/photos/avatar.webp" alt="梦墨的头像" width="140" height="140" />
          <h1 className="animate fade-in fast delay-1">{profile.name}</h1>
          <h2 className="animate fade-in fast delay-1">{profile.motto}</h2>
          <div className="location animate fade-in fast delay-2"><i aria-hidden="true" />{' ' }{profile.location}</div>
          <br />
          <div className="time animate fade-in fast delay-2"><i aria-hidden="true" />{' ' }<span aria-label="北京时间">{beijingTime(now)}</span></div>
          <SocialLinks />
        </div>
      </main>
      <footer className="right_foot">
        <div className="right_f_l"><p>
          <span>© {now.getFullYear()} <a href={profile.links.icp} target="_blank" rel="noopener noreferrer">萌 ICP 備 2020060315 號</a></span>{' '}
          <a href={profile.links.travellings} target="_blank" rel="noopener noreferrer" title="开往 · 友链接力">/ Travellings / </a>{' '}
          <span>本站已運行: {runtime(now, profile.startedAt)}</span>
        </p></div>
      </footer>
    </div>
  </div>;
}
