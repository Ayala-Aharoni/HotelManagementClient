// src/components/layout/MainLayout.tsx
import React from 'react';
import './MainLayout.css';

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="main-app-shell">
      <div className="tablet-frame">
        {children}
      </div>
    </div>
  );
}