// frontend/app/layout.tsx (update the navigation section)
import './page.css';
import './auth.css'; // Add this import
import { ReactNode } from 'react';
import Link from 'next/link';

interface LayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: LayoutProps) {
  return (
    <html lang="en">
      <body>
        <div className="layout">
          {/* Navigation */}
          <nav className="navbar">
            <div className="container">
              <div className="nav-content">
                <Link href="/" className="logo">
                  YourApp
                </Link>
                <div className="nav-links">
                  <Link href="/" className="nav-link">
                    Home
                  </Link>
                  <Link href="/about" className="nav-link">
                    About
                  </Link>
                  <Link href="/login" className="nav-link">
                    Login
                  </Link>
                  <Link href="/register" className="btn btn-primary">
                    Sign Up
                  </Link>
                </div>
              </div>
            </div>
          </nav>

          {/* Main Content */}
          <main className="main-content">
            {children}
          </main>

          {/* Footer */}
          <footer className="footer">
            <div className="container">
              <div className="footer-content">
                <div className="copyright">
                  © 2024 YourApp. All rights reserved.
                </div>
                <div className="footer-links">
                  <Link href="/privacy" className="footer-link">
                    Privacy Policy
                  </Link>
                  <Link href="/terms" className="footer-link">
                    Terms of Service
                  </Link>
                  <Link href="/contact" className="footer-link">
                    Contact
                  </Link>
                </div>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}