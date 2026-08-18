import { type GalleryCategoryDbKey } from "@/data/galleryCategories";

export type BookingStatus = "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED";
export type ReviewStatus = "PENDING" | "APPROVED" | "REJECTED";
export type ContactStatus = "NEW" | "CONTACTED" | "CLOSED";
export type GalleryKind = "IMAGE" | "VIDEO";

export type AdminUser = {
  id: string;
  role: "USER" | "ADMIN";
  username: string | null;
  phone: string;
  fullName: string | null;
  email: string | null;
  isActive: boolean;
  createdAt: string;
  lastLoginAt: string | null;
  bookings: number;
  reviews: number;
};

export type AdminBooking = {
  id: string;
  status: BookingStatus;
  eventType: string;
  eventDate: string;
  location: string;
  specialRequest?: string | null;
  createdAt: string;
  user: {
    phone: string;
    fullName: string | null;
    email: string | null;
  };
};

export type AdminReview = {
  id: string;
  status: ReviewStatus;
  rating: number;
  message: string;
  adminReply: string | null;
  createdAt: string;
  user: {
    name: string | null;
    email: string | null;
    phone: string | null;
  };
};

export type AdminContact = {
  id: string;
  status: ContactStatus;
  eventType: string;
  eventDate: string;
  location: string;
  specialRequest: string | null;
  name: string | null;
  phone: string | null;
  email: string | null;
  createdAt: string;
};

export type AdminTeamMember = {
  id: string;
  fullName: string | null;
  phone: string | null;
  roleName: string;
  isActive: boolean;
  displayOrder: number;
};

export type AdminGalleryItem = {
  id: string;
  kind: GalleryKind;
  category: GalleryCategoryDbKey;
  title?: string | null;
  src: string;
  poster: string;
  orientation: string;
  isPublished: boolean;
  displayOrder: number;
  createdAt: string;
};
