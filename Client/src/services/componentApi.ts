const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export interface Component {
  id: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  thumbnail: string | null;
  isPremium: boolean;
  order: number;
  createdAt: string;
}

export interface ComponentDetail extends Component {
  code: string;
}

export async function listComponents(category?: string): Promise<{
  success: boolean;
  data?: { components: Component[] };
}> {
  const url = category
    ? `${API_BASE_URL}/components?category=${category}`
    : `${API_BASE_URL}/components`;
  const res = await fetch(url);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to load components');
  return data;
}

/**
 * Fetch all components WITH their code in a single API call.
 * Used by the landing page to render live previews without N+1 fetches.
 */
export async function listComponentsWithCode(category?: string): Promise<{
  success: boolean;
  data?: { components: ComponentDetail[] };
}> {
  const params = new URLSearchParams({ include: 'code' });
  if (category) params.set('category', category);
  const res = await fetch(`${API_BASE_URL}/components?${params.toString()}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to load components');
  return data;
}

export async function getComponent(id: string): Promise<{
  success: boolean;
  data?: { component: ComponentDetail };
}> {
  const res = await fetch(`${API_BASE_URL}/components/${id}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to load component');
  return data;
}