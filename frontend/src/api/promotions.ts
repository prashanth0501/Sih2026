import { api } from './client';

export type ApiPromoPost = {
  id: string;
  title: string;
  caption: string;
  hashtags: string[];
  media_url: string | null;
  share_count: number;
};

export type ApiPromoShare = {
  id: string;
  promo_post_id: string;
  name: string;
  usn: string;
  platform: string;
  post_url: string;
  is_public_on_wall: boolean;
  submitted_at: string;
  count_for_post: number;
};

export async function getPromoPosts() {
  const { data } = await api.get<ApiPromoPost[]>('/promotions');
  return data;
}

export async function submitPromoShare(
  promoId: string,
  input: { name: string; usn: string; post_url: string; is_public_on_wall?: boolean }
) {
  const { data } = await api.post<ApiPromoShare>(`/promotions/${promoId}/shares`, input);
  return data;
}

export async function getAllPromoShares() {
  const { data } = await api.get<ApiPromoShare[]>('/promotions/shares');
  return data;
}

export async function getPromoWall() {
  const { data } = await api.get<ApiPromoShare[]>('/promotions/wall');
  return data;
}
