import type { SocialIconName } from "@/components/ui/socialIcons";

type SocialEntry = { name: string; href: string; icon: SocialIconName };

export const site = {
  name: "Sri Veera Vinayaka",
  phone: "+91 8123834047",
  email: "amijnanesh@gmail.com",
  socials: [
    { name: "Facebook", href: "#", icon: "facebook" },
    { name: "YouTube", href: "#", icon: "youtube" },
    { name: "Instagram", href: "#", icon: "instagram" },
  ] satisfies readonly SocialEntry[],
  navItems: [
    { label: "Home", href: "/" },
    { label: "Our Journey", href: "/our-journey" },
    { label: "Gallery", href: "/gallery" },
    { label: "Services", href: "/services" },
    { label: "Contact Us", href: "/contact" },
  ],
  legalLinks: [
    { label: "Terms & Conditions", href: "/terms" },
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Copyright", href: "/copyright" },
    { label: "Refund Policy", href: "/refund" },
  ],
  footer: {
    contact: {
      address: "Indrali, Udupi. ",
    },
    quickLinks: [
      { label: "Home", href: "/" },
      { label: "Our Journey", href: "/our-journey" },
      { label: "Gallery", href: "/gallery" },
      { label: "Services", href: "/services" },
      { label: "Contact Us", href: "/contact" },
    ],
    usefulLinks: [
      { label: "FAQ", href: "/faq" },
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms & Conditions", href: "/terms" },
      { label: "Login", href: "/login" },
    ],
  },
};

export type SiteData = typeof site;