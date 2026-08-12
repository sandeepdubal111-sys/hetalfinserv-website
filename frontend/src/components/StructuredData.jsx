import { Helmet } from "react-helmet-async";

/**
 * Site-wide Organization/FinancialService schema.org structured data.
 * Rendered once on the homepage — search engines associate it with the
 * whole site via the sitewide sameAs/url fields, so it doesn't need to be
 * repeated on every page.
 */
export default function StructuredData() {
  const data = {
    "@context": "https://schema.org",
    "@type": "FinancialService",
    name: "Hetal Finserv Pvt Ltd",
    alternateName: "Hetal Finserv",
    url: "https://hetalfinserv.com",
    logo: "https://hetalfinserv.com/logo.png",
    image: "https://hetalfinserv.com/og-image.jpg",
    description:
      "One-stop financial partner for Mutual Funds, PMS, Insurance, Loans and Real Estate. AMFI-registered Mutual Fund Distributor, IRDAI-registered Insurance Broker, MahaRERA-registered agent, serving Pune and across India.",
    telephone: "+91-87670-95307",
    email: "info@hetalfinserv.com",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Wadgaon Sheri",
      addressLocality: "Pune",
      addressRegion: "Maharashtra",
      postalCode: "411014",
      addressCountry: "IN",
    },
    areaServed: {
      "@type": "Country",
      name: "India",
    },
    sameAs: [
      "https://www.facebook.com/hetalfinservpvtltd",
      "https://www.instagram.com/hetalfinservpvtltd",
    ],
  };

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(data)}</script>
    </Helmet>
  );
}
