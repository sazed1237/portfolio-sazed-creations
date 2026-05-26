import MainHome from "@/Page/Home/Home/MainHome";
import { getPublicProjects, getPublicPosts } from "@/lib/cloudflare-d1";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://sazedulislam.me';

export async function generateMetadata() {
  const description = 'Portfolio of Sazedul Islam — backend software engineer. Browse projects, services, and technical writing.';
  return {
    title: 'Home',
    description,
    openGraph: {
      title: 'Sazedul Islam — Backend Engineer',
      description,
      url: SITE_URL,
      siteName: 'Sazedul Islam',
    },
  };
}

export default async function HomePage() {
  const projects = await getPublicProjects();
  const posts = await getPublicPosts(3);

  return <MainHome initialProjects={projects.items} initialPosts={posts.items} />;
}
