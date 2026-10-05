import { Component } from 'react';

export class ErrorBoundary extends Component {
  state = { error: null, key: this.props.resetKey };
  static getDerivedStateFromError(error) { return { error }; }
  static getDerivedStateFromProps(p, s) { return p.resetKey !== s.key ? { error: null, key: p.resetKey } : null; }
  componentDidCatch(e, info) { console.error(e, info?.componentStack); }
  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className="grid min-h-[60dvh] place-items-center p-6 text-center" role="alert">
        <div><h1 className="font-display text-3xl text-navy">Something went wrong</h1><p className="mt-2 text-muted-foreground">Please reload the page. If this keeps happening, contact 4PL Academy.</p>
          <button type="button" className="btn btn-navy mt-5" onClick={() => window.location.reload()}>Reload</button></div>
      </div>
    );
  }
}
