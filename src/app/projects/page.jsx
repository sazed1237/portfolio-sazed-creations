import Work from "@/Page/Work/Work";
import { getPublicProjects } from "@/lib/cloudflare-d1";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://sazedulislam.me';

export async function generateMetadata() {
  const description = 'Selected projects showcasing backend and full-stack engineering by Sazedul Islam.';
  return {
    title: 'Projects',
    description,
    openGraph: {
      title: 'Projects — Sazedul Islam',
      description,
      url: `${SITE_URL}/projects`,
    },
  };
}

export default async function ProjectsPage() {
  const projects = await getPublicProjects();

  return <Work initialProjects={projects.items} />;
}
