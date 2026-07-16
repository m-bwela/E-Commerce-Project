import React from 'react';
import { Link } from 'react-router-dom';
import './NotFound.css';

export default function NotFoundPage() {
  return (
    <div className="nf-root">
      <div className="nf-glow nf-glow-1" />
      <div className="nf-glow nf-glow-2" />
      <div className="nf-content">
        <p className="nf-label">Error — Page Not Found</p>
        <div className="nf-code">404</div>
        <div className="nf-divider" />
        <h1 className="nf-title">This page doesn&apos;t exist</h1>
        <p className="nf-message">
          The page you&apos;re looking for has been moved, removed,<br />
          or never existed. Let us guide you back.
        </p>
        <Link to="/" className="nf-btn">Return Home</Link>
      </div>
    </div>
  );
}
