import { Helmet } from "react-helmet-async";

const SITE_URL = "https://hetalfinserv.com";
const DEFAULT_IMAGE = `${SITE_URL}/og-image.jpg`;
const SITE_NAME = "Hetal Finserv Pvt Ltd";

/**
 * Drop this into any page component to control that page's title, meta
 * description, canonical URL, and social-share (Open Graph / Twitter) cards.
 * Falls back to sensible site-wide defaults if a prop is omitted.
 *
 * path should be the route path only, e.g. "/services" or "/blog/my-post" —
 * SITE_URL is prepended automatically.
 */
export default function SEO({
  title,
  description,
  path = "/",
  image = DEFAULT_IMAGE,
  type = "website",
  noindex = false,
}) {
  const fullTitle = title ? `${title} — ${SITE_NAME}` : `${SITE_NAME} — It's Not Just a Strategy. It's Personal.`;
  const url = `${SITE_URL}${path}`;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      {description && <meta name="description" content={description} />}
      <link rel="canonical" href={url} />
      {noindex && <meta name="robots" content="noindex, nofollow" />}

      {/* Open Graph — WhatsApp, Facebook, LinkedIn */}
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title" content={fullTitle} />
      {description && <meta property="og:description" content={description} />}
      <meta property="og:url" content={url} />
      <meta property="og:image" content={image} />
      <meta property="og:locale" content="en_IN" />

      {/* Twitter/X Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      {description && <meta name="twitter:description" content={description} />}
      <meta name="twitter:image" content={image} />
    </Helmet>
  );
}
