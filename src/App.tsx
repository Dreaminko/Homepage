import { profile } from './config';
import { Photography } from './components/Photography';
import { SocialLinks } from './components/SocialLinks';
import { BeijingClock, SiteFooter } from './components/Time';
import avatar from './generated/avatar.webp?no-inline';

export default function App() {
  return <div className="wrapper">
    <Photography />
    <div className="right">
      <main className="index_box">
        <div className="index_txt">
          <img className="avatar animate fade-up fast" src={avatar} alt="ゆめ" width="140" height="140" />
          <h1 className="animate fade-in fast delay-1">{profile.name}</h1>
          <h2 className="animate fade-in fast delay-1">{profile.motto}</h2>
          <div className="meta">
            <div className="location animate fade-in fast delay-2"><i aria-hidden="true" />{' ' }{profile.location}</div>
            <BeijingClock />
          </div>
          <SocialLinks />
        </div>
      </main>
      <SiteFooter />
    </div>
  </div>;
}
