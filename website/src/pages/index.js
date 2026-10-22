import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import CodeBlock from '@theme/CodeBlock';

const features = [
  {
    "title": "Five levels",
    "body": "debug, info, warn, error and fatal, with typed metadata on every entry."
  },
  {
    "title": "Child loggers",
    "body": "Scope a logger to a module or request, and its context is stamped on each line."
  },
  {
    "title": "Pluggable transports",
    "body": "Console, batch or your own transport. Each one can filter its own level."
  },
  {
    "title": "Zero dependencies",
    "body": "Nothing in node_modules that you didn't ask for."
  }
];
const steps = [
  {
    "title": "Install",
    "code": "npm install @88khp/logger"
  },
  {
    "title": "Create once",
    "code": "createLogger({ level: 'info' })"
  },
  {
    "title": "Log with metadata",
    "code": "logger.info('…', { port })"
  }
];
const code = "import { createLogger } from '@88khp/logger';\n\nconst logger = createLogger({ level: 'info' });\n\nlogger.info('Server started', { port: 3000 });\nlogger.error('Request failed', { path: '/api/user', status: 500 });";

const Art = () => (
  <svg viewBox="0 0 480 360" role="img" aria-label="A log window with level tags and metadata">
    <defs>
      <linearGradient id="artBg" x1="0" y1="0" x2="1" y2="1">
        <stop className="art-s1" offset="0" />
        <stop className="art-s2" offset="1" />
      </linearGradient>
      <filter id="artShadow" x="-25%" y="-25%" width="150%" height="170%">
        <feDropShadow dx="0" dy="14" stdDeviation="14" floodOpacity="0.28" />
      </filter>
    </defs>
    <rect x="0" y="0" width="480" height="360" rx="28" fill="url(#artBg)" />
    <rect className="art-card" x="52" y="52" width="376" height="236" rx="20" filter="url(#artShadow)" />
    <circle className="art-bar-strong" cx="82" cy="78" r="6" />
    <circle className="art-bar-strong" cx="102" cy="78" r="6" />
    <circle className="art-bar-strong" cx="122" cy="78" r="6" />
    <rect className="art-accent" x="80" y="110" width="58" height="20" rx="10" />
    <rect className="art-bar" x="152" y="116" width="170" height="8" rx="4" />
    <rect className="art-tag-warn" x="80" y="144" width="58" height="20" rx="10" />
    <rect className="art-bar" x="152" y="150" width="140" height="8" rx="4" />
    <rect className="art-tag-error" x="80" y="178" width="58" height="20" rx="10" />
    <rect className="art-bar" x="152" y="184" width="186" height="8" rx="4" />
    <rect className="art-bar-strong" x="80" y="212" width="58" height="20" rx="10" />
    <rect className="art-bar" x="152" y="218" width="110" height="8" rx="4" />
    <rect className="art-card" x="270" y="226" width="150" height="90" rx="18" filter="url(#artShadow)" />
    <rect className="art-bar" x="290" y="250" width="110" height="8" rx="4" />
    <rect className="art-accent" x="290" y="270" width="70" height="8" rx="4" />
    <text className="art-mark" x="36" y="332">88khp / logger</text>
  </svg>
);

export default function Home() {
  return (
    <Layout title="Structured logging for every JavaScript runtime" description="A logger for React Native, Node.js and the browser with typed metadata, child loggers and pluggable transports. No runtime dependencies.">
      <header className="hero">
        <div className="container">
          <div className="hero__text">
          <span className="hero__eyebrow">logger</span>
          <h1 className="hero__title">Structured logging for every JavaScript runtime</h1>
          <p className="hero__lede">A logger for React Native, Node.js and the browser with typed metadata, child loggers and pluggable transports. No runtime dependencies.</p>
          <div className="hero__install">
            <span className="prompt">$</span>
            <code>npm install @88khp/logger</code>
          </div>
          <div className="hero__actions">
            <Link className="btn btn--primary" to="/docs/intro">Install</Link>
            <Link className="btn" to="/docs/intro">Read the docs</Link>
          </div>
          </div>
          <div className="hero__art"><Art /></div>
        </div>
      </header>

      <section className="section">
        <div className="container">
          <div className="section__head">
            <h2>How it fits together</h2>
          </div>
          <ol className="steps">
            {steps.map((s, i) => (
              <li className="step" key={s.title}>
                <span className="step__num">{i + 1}</span>
                <div>
                  <h3 className="step__title">{s.title}</h3>
                  <code className="step__code">{s.code}</code>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="section section--tint">
        <div className="container split">
          <div>
            <h2>Use it</h2>
            <p className="section__body">Create the logger once. Every other file gets the same instance with createLogger().</p>
          </div>
          <div className="split__code">
            <CodeBlock language="ts" title="app.ts">{code}</CodeBlock>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section__head">
            <h2>Why it's worth using</h2>
          </div>
          <div className="features__grid">
            {features.map((f) => (
              <div className="feature" key={f.title}>
                <h3 className="feature__title">{f.title}</h3>
                <p className="feature__body">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="cta">
        <div className="container cta__inner">
          <h2>Start with the docs</h2>
          <div className="hero__actions">
            <Link className="btn btn--primary" to="/docs/intro">Open the docs</Link>
            <a className="btn" href="https://github.com/88khp/logger">View on GitHub</a>
          </div>
        </div>
      </section>
    </Layout>
  );
}
