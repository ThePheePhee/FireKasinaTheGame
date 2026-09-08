import {Component, type ErrorInfo, type ReactNode} from 'react';

export default class SceneBoundary extends Component<{children: ReactNode; onRecover: () => void}, {failed: boolean}> {
  state = {failed: false};
  static getDerivedStateFromError() { return {failed: true}; }
  componentDidCatch(error: Error, info: ErrorInfo) { console.error('Scene interrupted', error, info.componentStack); }
  render() {
    if (this.state.failed) return <section className="scene-loading" role="alert">
      <span className="pixel-flame" aria-hidden="true"/>
      <h2>A THREAD COMES LOOSE</h2>
      <p>This part of the landscape could not open. Your journey is still here.</p>
      <button onClick={this.props.onRecover}>RETURN TO THE MAP</button>
    </section>;
    return this.props.children;
  }
}
