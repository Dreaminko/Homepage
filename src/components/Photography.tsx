import { useState, useSyncExternalStore } from 'react';
import photoData from '../generated/photos.json';

type Photo = { id: string; src: string; lines: string[] };
const photos: Photo[] = photoData;

const desktopQuery = () => window.matchMedia('(min-width: 769px)');
const subscribe = (callback: () => void) => {
  const query = desktopQuery();
  query.addEventListener('change', callback);
  return () => query.removeEventListener('change', callback);
};
export function Photography() {
  const [photo] = useState(() => photos[Math.floor(Math.random() * photos.length)]);
  const visible = useSyncExternalStore(subscribe, () => desktopQuery().matches, () => false);
  return visible && photo ? <DesktopPhotography photo={photo} /> : null;
}
function DesktopPhotography({ photo }: { photo: Photo }) {
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');
  return <aside className="left" aria-label="摄影背景">
    {state === 'loading' && <div className="pace" role="status" aria-label="正在加载照片"><div className="pace-progress" style={{ right: '20%' }} /></div>}
    <img className={`background-photo ${state === 'ready' ? 'ready' : ''}`} src={photo.src} alt="ゆめ的摄影作品" fetchPriority="high" onLoad={() => setState('ready')} onError={() => setState('error')} />
    {state === 'ready' && <div className="exif"><p>{photo.lines.length ? photo.lines.map((line, i) => <span key={i}>{line}<br /></span>) : '暂无拍摄信息'}</p></div>}
    {state === 'error' && <p className="photo-error">照片暂时无法加载</p>}
  </aside>;
}
