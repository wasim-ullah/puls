import { Link } from 'react-router-dom';
import { useTitle } from '../lib/util';

export default function NotFound({ what = 'page' }: { what?: 'page' | 'profile' | 'work' }) {
  useTitle('Not found');
  const text = {
    page: "We couldn't find that page.",
    profile: "There's no profile at this address yet. It might be yours to claim.",
    work: 'This work is unpublished, moved, or never existed.',
  }[what];
  return (
    <section className="wrap" style={{ paddingTop: 120, paddingBottom: 140, textAlign: 'center' }}>
      <span className="eyebrow">404</span>
      <h1 className="display h-xl" style={{ margin: '12px 0 16px' }}>Nothing here.</h1>
      <p className="muted" style={{ fontSize: 17, marginBottom: 28 }}>{text}</p>
      <div className="row gap-8" style={{ justifyContent: 'center' }}>
        <Link to="/" className="btn btn-primary">Go home</Link>
        <Link to="/explore" className="btn btn-outline">Explore work</Link>
      </div>
    </section>
  );
}
