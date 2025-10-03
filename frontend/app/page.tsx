// frontend/app/page.tsx
import Link from 'next/link';
import './page.css';

export default function HomePage() {
  return (
    <div className="page">
      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <h1>Welcome to YourApp</h1>
            <p>
              A modern, secure platform for managing your digital life. 
              Join thousands of users who trust us with their data.
            </p>
            <div className="cta-buttons">
              <Link href="/register" className="btn btn-primary">
                Get Started
              </Link>
              <Link href="/about" className="btn btn-outline">
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="container">
          <h2 className="section-title">Why Choose Us?</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🔒</div>
              <h3>Secure</h3>
              <p>
                Your data is protected with enterprise-grade security 
                and encryption protocols.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">⚡</div>
              <h3>Fast</h3>
              <p>
                Lightning-fast performance with minimal latency 
                for the best user experience.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🎯</div>
              <h3>Reliable</h3>
              <p>
                99.9% uptime guarantee with robust infrastructure 
                and constant monitoring.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}