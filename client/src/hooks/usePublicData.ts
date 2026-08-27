import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

// Thin typed wrappers around the public read endpoints. Each stays a plain
// TanStack Query hook so components get caching/retries for free without
// duplicating fetch logic.

export interface PublicService {
  _id: string;
  title: string;
  slug: string;
  category: string;
  summary: string;
  description: string;
  heroImage: { url: string; alt: string };
  icon?: string;
  displayOrder: number;
  status: string;
}

export interface PublicEquipment {
  _id: string;
  name: string;
  slug: string;
  category: string;
  image: { url: string; alt: string };
  shortDescription: string;
  useCase: string;
  specifications: Array<{ label: string; value: string }>;
  availability: string;
}

export interface PublicProject {
  _id: string;
  title: string;
  slug: string;
  category: string;
  location: string;
  summary: string;
  coverImage?: { url: string; alt: string };
}

export interface SiteSettings {
  companyName: string;
  contact: { email?: string; phone?: string; address?: string };
  social: Record<string, string>;
  footerDescription?: string;
}

export interface NavigationConfig {
  primary: Array<{ label: string; href: string }>;
  cta: { label: string; href: string };
}

export function useServices() {
  return useQuery({ queryKey: ["public", "services"], queryFn: () => api.get<PublicService[]>("/public/services") });
}

export function useService(slug: string) {
  return useQuery({
    queryKey: ["public", "services", slug],
    queryFn: () => api.get<PublicService>(`/public/services/${slug}`),
    enabled: Boolean(slug),
  });
}

export function useEquipmentList() {
  return useQuery({ queryKey: ["public", "equipment"], queryFn: () => api.get<PublicEquipment[]>("/public/equipment") });
}

export function useEquipment(slug: string) {
  return useQuery({
    queryKey: ["public", "equipment", slug],
    queryFn: () => api.get<PublicEquipment>(`/public/equipment/${slug}`),
    enabled: Boolean(slug),
  });
}

export function useProjects(category?: string) {
  return useQuery({
    queryKey: ["public", "projects", category],
    queryFn: () => api.get<PublicProject[]>(`/public/projects${category ? `?category=${category}` : ""}`),
  });
}

export function useProject(slug: string) {
  return useQuery({
    queryKey: ["public", "projects", "detail", slug],
    queryFn: () => api.get<PublicProject & { description?: string; summary: string }>(`/public/projects/${slug}`),
    enabled: Boolean(slug),
  });
}

export function useSiteSettings() {
  return useQuery({ queryKey: ["public", "settings"], queryFn: () => api.get<SiteSettings>("/public/settings") });
}

export function useNavigation() {
  return useQuery({ queryKey: ["public", "navigation"], queryFn: () => api.get<NavigationConfig>("/public/navigation") });
}
