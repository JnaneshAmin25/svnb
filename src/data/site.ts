export const site = {
  name: "Sri Veera Vinayaka",
  phone: "+91 8123834047",
  email: "amijnanesh@gmail.com",
  socials: [
    { name: "Facebook", href: "#", icon: "facebook" },
    { name: "YouTube", href: "#", icon: "youtube" },
    { name: "Instagram", href: "#", icon: "instagram" },
  ],
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
};

export type SiteData = typeof site;