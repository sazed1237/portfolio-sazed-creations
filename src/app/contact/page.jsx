import Contact from "@/Page/Contact/Contact";

export default function ContactPage() {
  return <Contact />;
}

export async function generateMetadata() {
  const description = 'Contact Sazedul for backend engineering work, consulting, or hiring inquiries.';
  return { title: 'Contact', description };
}
