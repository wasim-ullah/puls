import { Link } from 'react-router-dom';
import ReserveUsername from '../components/ReserveUsername';
import { useTitle } from '../lib/util';

const NOW = [
  ['Your own link', 'puls.so/@yourname, one address for LinkedIn, your CV and your email signature.'],
  ['Work pages', 'Every piece gets its own page with images, video, the story behind it, results and credits.'],
  ['Results up front', 'Your strongest number shows on every card, so people see the impact before they click.'],
  ['Explore', 'Browse work by category and search by brand, agency or title.'],
];

const NEXT = [
  ['Verified results', 'Connect the ad or analytics account, or have the client sign off, and your numbers get a Verified badge.'],
  ['Jury scores', 'Working marketers score entries on idea, craft, strategy and results, and every vote is public.'],
  ['Daily awards', 'Puls of the Day, Month and Year, decided on results as well as craft.'],
];

export default function HowItWorks() {
  useTitle('How it works');
  return (
    <>
      <section className="wrap" style={{ paddingTop: 64, paddingBottom: 56 }}>
        <div className="section-head">
          <h1 className="display h-xl" style={{ flex: '1 1 640px' }}>A portfolio that shows what your work achieved.</h1>
          <p className="muted" style={{ flex: '0 1 400px', fontSize: 16 }}>
            Design portfolios show how work looks. Marketing work also needs to show what it did, and Puls puts that first.
          </p>
        </div>
      </section>
      <section className="band-white">
        <div className="wrap section">
          <h2 className="h-md" style={{ marginBottom: 24 }}>Available now</h2>
          <div className="steps">
            {NOW.map(([h, p], i) => (
              <div key={h}><span className="mono small muted">{String(i + 1).padStart(2, '0')}</span><h3 className="h-sm">{h}</h3><p className="muted" style={{ fontSize: 14 }}>{p}</p></div>
            ))}
          </div>
        </div>
      </section>
      <section className="wrap section">
        <div className="row gap-12" style={{ marginBottom: 24 }}><h2 className="h-md">Coming next</h2><span className="pill pill-line"><span className="dot" />In development</span></div>
        <div className="steps">
          {NEXT.map(([h, p], i) => (
            <div key={h}><span className="mono small muted">{String(i + 1).padStart(2, '0')}</span><h3 className="h-sm">{h}</h3><p className="muted" style={{ fontSize: 14 }}>{p}</p></div>
          ))}
        </div>
        <div className="cta-dark" style={{ marginTop: 72 }}>
          <div className="stack gap-12" style={{ flex: '1 1 420px' }}>
            <h2 className="h-lg">Get your username before someone else does.</h2>
            <p style={{ color: '#B5B5AE' }}>Free while in early access. <Link to="/explore" style={{ textDecoration: 'underline' }}>See what others have posted.</Link></p>
          </div>
          <div style={{ flex: '1 1 420px' }}><ReserveUsername dark /></div>
        </div>
      </section>
    </>
  );
}
