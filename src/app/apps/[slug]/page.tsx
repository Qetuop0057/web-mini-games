import Link from "next/link";
import { notFound } from "next/navigation";
import { apps, getApp } from "@/apps/registry";

export function generateStaticParams() { return apps.map(({ slug }) => ({ slug })); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const app = getApp((await params).slug);
  return { title: app?.title ?? "App not found" };
}
export default async function AppPage({ params }: { params: Promise<{ slug: string }> }) {
  const app = getApp((await params).slug);
  if (!app) notFound();
  return <div className="container page-content section-apps">
    <Link href="/apps" className="back-link">← All apps</Link>
    <div className="game-title"><div><h1>{app.title}</h1></div><span className={`title-icon ${app.color}`}>{app.icon}</span></div>
    <div className="game-overview"><section><h2>About the app</h2><p>{app.about}</p>
    </section><aside className="launch-panel"><span className="launch-icon" aria-hidden="true">{app.icon}</span>
      {app.openUrl ? <a className="button start-game" href={app.openUrl}>Open app</a> : <h2>Coming soon</h2>}
    </aside></div>
  </div>;
}
