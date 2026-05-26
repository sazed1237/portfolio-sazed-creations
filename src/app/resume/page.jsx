import Resume from "@/Page/Resume/Resume";

export default function ResumePage() {
  return <Resume />;
}
export async function generateMetadata() {
  const description = 'Resume and experience summary for Sazedul Islam — backend software engineer.';
  return { title: 'Resume', description };
}
