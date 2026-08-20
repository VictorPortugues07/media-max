import "server-only";

export interface Endereco {
  rua: string;
  numero: string;
  bairro: string;
  cidade: string;
  uf: string;
}

const cache = new Map<string, { lat: number; lng: number } | null>();

export async function geocodeAddress(a: Endereco): Promise<{ lat: number; lng: number } | null> {
  const key = `${a.rua} ${a.numero} ${a.bairro} ${a.cidade} ${a.uf}`.toLowerCase();
  const cached = cache.get(key);
  if (cached !== undefined) return cached;

  const q = encodeURIComponent(`${a.rua}, ${a.numero} — ${a.bairro}, ${a.cidade}, ${a.uf}, Brasil`);
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${q}`, {
      headers: {
        "User-Agent": "MediaMaxLanding/0.1 (validacao@mediamax.com.br)",
        Accept: "application/json",
      },
      cache: "no-store",
    });
    if (!res.ok) {
      cache.set(key, null);
      return null;
    }
    const data = (await res.json()) as Array<{ lat: string; lon: string }>;
    if (!data?.[0]) {
      cache.set(key, null);
      return null;
    }
    const result = { lat: Number(data[0].lat), lng: Number(data[0].lon) };
    cache.set(key, result);
    return result;
  } catch {
    cache.set(key, null);
    return null;
  }
}

export async function mapLimit<T, R>(
  items: T[],
  limit: number,
  fn: (item: T) => Promise<R>,
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let i = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (true) {
      const idx = i++;
      if (idx >= items.length) return;
      results[idx] = await fn(items[idx]);
    }
  });
  await Promise.all(workers);
  return results;
}