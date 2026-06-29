import React from 'react';
import { Link } from 'react-router-dom';
import './NotFound.css'; // Import the CSS file for styling

export default function NotFoundPage() {
  return (
    <section className="not-found">
      <div id="tokyo" className="scene">
  <canvas id="tkCanvas"></canvas>
  <div className="tk-scan"></div>
  <div className="tk-sweep"></div>
  <div className="tk-corner tl"></div>
  <div className="tk-corner tr"></div>
  <div className="tk-corner bl"></div>
  <div className="tk-corner br"></div>
  <div className="tk-wrap">
    <div className="tk-tag">エラー &nbsp;//&nbsp; System Failure</div>
    <div className="tk-404">404</div>
    <div className="tk-jp">[ データが見つかりません ]</div>
    <div className="tk-sub">Requested node has been purged from the grid.<br />No recovery possible.</div>
    <button className="tk-btn">⟳ &nbsp; Re-enter the Grid</button>
  </div>
</div>
    </section>
  );
}
