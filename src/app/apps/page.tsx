import type { Metadata } from "next";
import { CatalogCard } from "@/components/catalog-card";
import { apps } from "@/apps/registry";
export const metadata: Metadata = { title: "Life apps" };
export default function Apps() { return <div className="container page-content section-apps"><h1>Life apps</h1><div className="tile-grid">{apps.map(app => <CatalogCard key={app.slug} href={app.openUrl ?? `/apps/${app.slug}`} item={app} />)}</div></div>; }
