import Services from "@/Page/Services/Services";

export default function ServicesPage() {
  return <Services />;
}
 
export async function generateMetadata() {
  const description = 'Services offered by Sazedul Islam — backend engineering, API design, and consulting.';
  return { title: 'Services', description };
}
