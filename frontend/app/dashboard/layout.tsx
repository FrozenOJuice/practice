// frontend/app/dashboard/layout.tsx
'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import '../auth.css';

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const router = useRouter();

  // In your dashboard/layout.tsx, update the handleLogout function:
  const handleLogout = async () => {
    const refreshToken = localStorage.getItem('refresh_token');
    
    try {
      // Call backend logout to remove refresh token from users.json
      if (refreshToken) {
        await fetch('http://localhost:8000/auth/logout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            refresh_token: refreshToken
          }),
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
      // Still proceed with frontend cleanup even if backend call fails
    } finally {
      // Always clean up frontend tokens
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      // Redirect to login page
      router.push('/login');
    }
  };

  return (
    <div className="dashboard-layout">
      <nav className="dashboard-nav">
        <div className="container">
          <div className="nav-content">
            <Link href="/dashboard" className="logo">
              YourApp Dashboard
            </Link>
            <div className="nav-links">
              <Link href="/dashboard" className="nav-link">
                Overview
              </Link>
              <Link href="/movies" className="nav-link">
                Movies
              </Link>
              <button 
                onClick={handleLogout}
                className="btn btn-outline"
                style={{ marginLeft: '1rem' }}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>
      <main className="dashboard-main">
        {children}
      </main>
    </div>
  );
}