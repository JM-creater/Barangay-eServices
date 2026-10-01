import React from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import { Sidebar } from './Sidebar';
import { useAuth } from '../../hooks/useAuth';

interface LayoutProps {
  children: React.ReactNode;
  showSidebar?: boolean;
}

export const Layout: React.FC<LayoutProps> = ({ children, showSidebar = false }) => {
  const { isAuthenticated } = useAuth();
  const displaySidebar = showSidebar && isAuthenticated;

  return (
    <div className="app-container">
      <Header />
      <div style={{ display: 'flex', flex: 1, minHeight: !isAuthenticated ? 'calc(100vh - 160px)' : 'calc(100vh - 70px)' }}>
        {displaySidebar && <Sidebar />}
        <main
          className="main-content"
          style={{
            flex: 1,
            backgroundColor: '#F5F7FA',
            maxWidth: displaySidebar ? '100%' : '1280px',
            minWidth: 0,
            width: '100%',
          }}
        >
          {children}
        </main>
      </div>
      {!isAuthenticated && <Footer />}
    </div>
  );
};
