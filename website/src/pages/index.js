import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';

export default function Home() {
  return (
    <Layout title="Logger" description="Production-grade, platform-independent logging">
      <main className="container margin-vert--xl">
        <h1>Logger</h1>
        <p>Production-grade, platform-independent logging for React Native and the web.</p>
        <Link className="button button--primary button--lg" to="/docs/intro">
          Read the docs
        </Link>
      </main>
    </Layout>
  );
}
