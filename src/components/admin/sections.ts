import type { TextSectionKey } from "@/content/types";

/** Text sections in the order they appear on the site, with admin-facing descriptions. */
export const textSections: { key: TextSectionKey; label: string; description: string }[] = [
  { key: "profile", label: "Name & titles", description: "Name, short name, role, affiliation and tagline." },
  { key: "hero", label: "Hero", description: "Introduction at the top: headline name, summary, tags and card labels." },
  { key: "marquee", label: "Institutions strip", description: "The scrolling list of institutions under the hero." },
  { key: "about", label: "About", description: "Biography paragraphs, the guiding question and key facts." },
  { key: "impact", label: "Impact", description: "Metric labels and the citation dashboard texts." },
  { key: "journey", label: "Experience & education", description: "Career and education timelines." },
  { key: "research", label: "Research areas", description: "The six focus-area cards." },
  { key: "books", label: "Books section", description: "Heading and labels of the books section (books themselves are under Books)." },
  { key: "publications", label: "Publications section", description: "Heading, theme names, filters and labels." },
  { key: "awards", label: "Awards", description: "Awards and distinctions, including the featured award." },
  { key: "gallery", label: "Gallery section", description: "Heading and viewer labels (items are under Gallery)." },
  { key: "network", label: "Network & testimonials", description: "Collaborators heading and testimonials." },
  { key: "contact", label: "Contact", description: "Contact heading, link labels, form labels and messages." },
  { key: "nav", label: "Navigation", description: "Menu labels." },
  { key: "common", label: "Shared labels", description: "Buttons and accessibility labels used across the site." },
  { key: "footer", label: "Footer", description: "Footer headings and notes." },
  { key: "meta", label: "SEO", description: "Page title, description and keywords for search engines." },
  { key: "notFound", label: "404 page", description: "Text of the page-not-found screen." },
];
