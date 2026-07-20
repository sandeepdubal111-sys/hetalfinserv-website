import Hero from "@/components/sections/Hero";
import Registrations from "@/components/sections/Registrations";
import EditorialMarquee from "@/components/sections/EditorialMarquee";
import Manifesto from "@/components/sections/Manifesto";
import Services from "@/components/sections/Services";
import Stats from "@/components/sections/Stats";
import AMCPartners from "@/components/sections/AMCPartners";
import Leadership from "@/components/sections/Leadership";
import Testimonials from "@/components/sections/Testimonials";
import FAQ from "@/components/sections/FAQ";
import ContactForm from "@/components/sections/ContactForm";

export default function HomePage() {
  return (
    <main data-testid="home-page">
      <Hero />
      <Registrations />
      <Manifesto />
      <Services />
      <Stats />
      <EditorialMarquee
        words={["Independent", "Fiduciary-minded", "Boutique", "Personal", "Transparent", "Certified"]}
      />
      <AMCPartners />
      <Leadership />
      <Testimonials />
      <FAQ />
      <ContactForm />
    </main>
  );
}
