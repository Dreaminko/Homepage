import { useState } from 'react';
import { faGithub, faXTwitter, faTelegram, faDiscord } from '@fortawesome/free-brands-svg-icons';
import { faPen, faCompactDisc } from '@fortawesome/free-solid-svg-icons';
import { profile } from '../config';

type IconDefinition = typeof faGithub;
function Icon({ icon }: { icon: IconDefinition }) {
  const [width, height, , , paths] = icon.icon;
  return <i className="social-icon" aria-hidden="true"><svg viewBox={`0 0 ${width} ${height}`} aria-hidden="true" focusable="false">{(Array.isArray(paths) ? paths : [paths]).map((path, i) => <path key={i} d={path} />)}</svg></i>;
}
export function SocialLinks() {
  const [message, setMessage] = useState('');
  async function copyDiscord() {
    try {
      await navigator.clipboard.writeText(profile.discord);
      setMessage(`已复制 Discord：${profile.discord}`);
    } catch {
      setMessage(`请手动复制 Discord：${profile.discord}`);
    }
  }
  return <nav className="menu animate fade-in delay-3" aria-label="社交与个人站点">
    <div className="menu-row-1">
      <a href={profile.links.notion} target="_blank" rel="noopener noreferrer" aria-label="Notion" title="Notion"><Icon icon={faPen} /></a>
      <a href={profile.links.github} target="_blank" rel="noopener noreferrer" aria-label="GitHub" title="GitHub"><Icon icon={faGithub} /></a>
      <a href={profile.links.x} target="_blank" rel="noopener noreferrer" aria-label="X" title="X"><Icon icon={faXTwitter} /></a>
    </div>
    <div className="menu-row-2">
      <a href={profile.links.telegram} target="_blank" rel="noopener noreferrer" aria-label="Telegram" title="Telegram"><Icon icon={faTelegram} /></a>
      <button onClick={copyDiscord} aria-label="复制 Discord 用户名" title="Discord"><Icon icon={faDiscord} /></button>
      <a href={profile.links.music} aria-label="Music" title="Music"><Icon icon={faCompactDisc} /></a>
    </div>
    <p className="copy-status" role="status">{message}</p>
  </nav>;
}
