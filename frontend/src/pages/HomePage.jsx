import Hero from "@/components/sections/Hero";
import EditorialMarquee from "@/components/sections/EditorialMarquee";
import Manifesto from "@/components/sections/Manifesto";
import Services from "@/components/sections/Services";
import Stats from "@/components/sections/Stats";
import AMCPartners from "@/components/sections/AMCPartners";
import Founder from "@/components/sections/Founder";
import Testimonials from "@/components/sections/Testimonials";
import FAQ from "@/components/sections/FAQ";
import ContactForm from "@/components/sections/ContactForm";

export default function HomePage() {
  return (
    <main data-testid="home-page">
      <Hero />
      <EditorialMarquee
        words={["Independent", "Fiduciary-minded", "Boutique", "Multi-decade", "Family-first", "Discreet"]}
      />
      <Manifesto />
      <Services />
      <Stats />
      <AMCPartners />
      <Founder />
      <Testimonials />
      <FAQ />
      <ContactForm />
    </main>
  );
}
