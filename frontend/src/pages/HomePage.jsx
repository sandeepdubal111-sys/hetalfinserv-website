import Hero from "@/components/sections/Hero";
import Registrations from "@/components/sections/Registrations";
import Regulators from "@/components/sections/Regulators";
import EditorialMarquee from "@/components/sections/EditorialMarquee";
import Manifesto from "@/components/sections/Manifesto";
import Services from "@/components/sections/Services";
import Stats from "@/components/sections/Stats";
import AMCPartners from "@/components/sections/AMCPartners";
import Calculator from "@/components/sections/Calculator";
import Leadership from "@/components/sections/Leadership";
import Testimonials from "@/components/sections/Testimonials";
import FAQ from "@/components/sections/FAQ";
import ContactForm from "@/components/sections/ContactForm";
import SEO from "@/components/SEO";
import StructuredData from "@/components/StructuredData";

export default function HomePage() {
  return (
    <main data-testid="home-page">
      <SEO
        title="Mutual Funds, PMS, Insurance & Real Estate — Pune"
        description="Hetal Finserv Pvt Ltd — One-stop financial partner for Mutual Funds, PMS, Insurance, Loans and Real Estate. AMFI-registered distributor, IRDAI-registered broker, MahaRERA-registered agent. Serving Pune and across India."
        path="/"
      />
      <StructuredData />
      <Hero />
      <Registrations />
      <Manifesto />
      <Services />
      <Stats />
      <Regulators />
      <EditorialMarquee
        words={["Disciplined", "Goal-based", "Boutique", "Personal", "Transparent", "Certified"]}
      />
      <AMCPartners />
      <Calculator />
      <Leadership />
      <Testimonials />
      <FAQ />
      <ContactForm />
    </main>
  );
}
