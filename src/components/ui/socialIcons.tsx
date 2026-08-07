import {
  FaFacebookF,
  FaTwitter,
  FaLinkedinIn,
  FaYoutube,
  FaInstagram,
} from "react-icons/fa";

/**
 * Single source of truth for social-icon glyphs. TopBar and Footer both render
 * icons through this map, keyed by the `icon` string in `site.socials` / `site.footer.socials`.
 */
export const SOCIAL_ICONS = {
  facebook: FaFacebookF,
  twitter: FaTwitter,
  linkedin: FaLinkedinIn,
  youtube: FaYoutube,
  instagram: FaInstagram,
} as const;

export type SocialIconName = keyof typeof SOCIAL_ICONS;