const FIRECRAWL_API = "https://api.firecrawl.dev/v1";
const API_KEY = process.env.FIRECRAWL_API_KEY!;

interface SearchResult {
  title: string;
  url: string;
  description: string;
  markdown?: string;
}

/**
 * Search the web for facts about an object using Firecrawl.
 * Includes retry with backoff and quality filtering.
 */
export async function searchFacts(
  query: string,
  limit = 5
): Promise<string[]> {
  const maxRetries = 2;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const res = await fetch(`${FIRECRAWL_API}/search`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query,
          limit,
          scrapeOptions: {
            formats: ["markdown"],
            onlyMainContent: true,
          },
        }),
      });

      if (res.status === 429) {
        // Rate limited — wait and retry
        if (attempt < maxRetries) {
          await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)));
          continue;
        }
        return [];
      }

      if (!res.ok) {
        console.error(`Firecrawl search failed: ${res.status}`);
        return [];
      }

      const data = await res.json();
      const results: SearchResult[] = data.data ?? [];

      return extractAndFilterFacts(results);
    } catch (err) {
      console.error("Firecrawl error:", err);
      if (attempt < maxRetries) continue;
      return [];
    }
  }

  return [];
}

/**
 * Extract meaningful facts from search results, filter low-quality entries.
 */
function extractAndFilterFacts(results: SearchResult[]): string[] {
  const facts: string[] = [];
  const seen = new Set<string>();

  for (const result of results) {
    const rawContent = result.markdown || result.description || "";

    // Clean markdown artifacts
    const content = rawContent
      .replace(/!\[.*?\]\(.*?\)/g, "") // remove images
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // links → text
      .replace(/[#*_~`>]/g, "")
      .replace(/\|.*?\|/g, "") // remove table rows
      .replace(/\s+/g, " ")
      .trim();

    if (content.length < 30) continue;

    // Extract sentences that contain numbers (statistics are most valuable)
    const sentences = content.match(/[^.!?]+[.!?]+/g) || [content];
    for (const sentence of sentences) {
      const trimmed = sentence.trim();
      if (trimmed.length < 20 || trimmed.length > 400) continue;

      // Deduplicate by rough similarity
      const fingerprint = trimmed.toLowerCase().replace(/\d+/g, "N").slice(0, 60);
      if (seen.has(fingerprint)) continue;
      seen.add(fingerprint);

      // Prioritize sentences with numbers/statistics
      const hasNumbers = /\d/.test(trimmed);
      if (hasNumbers) {
        facts.unshift(trimmed); // stats go first
      } else if (facts.length < 8) {
        facts.push(trimmed);
      }
    }
  }

  return facts.slice(0, 8);
}

/**
 * Build search queries based on object type, material, and environmental category.
 * Includes location-aware queries when available.
 */
export function buildSearchQueries(
  objectType: string,
  material: string,
  environmentalCategory: string | null,
  location?: { lat: number; lng: number } | null
): string[] {
  const queries: string[] = [];

  // General object facts — always query
  queries.push(`${objectType} ${material} interesting facts origin story`);

  // Brand-specific query if a known brand is detected
  if (objectType.split(" ").length > 1) {
    queries.push(`${objectType} history fun facts`);
  }

  // Environmental queries
  if (environmentalCategory) {
    const envQueries: Record<string, string[]> = {
      plastic: [
        "ocean plastic pollution statistics 2025 2026",
        "microplastic in seafood human health data",
      ],
      clothing: [
        "fast fashion water usage environmental impact statistics",
        "cotton farming water footprint Aral Sea data",
      ],
      meat: [
        "beef cattle deforestation amazon statistics 2025",
        "meat industry carbon footprint per kilogram data",
      ],
      electronics: [
        "rare earth cobalt mining environmental human impact",
        "e-waste global statistics recycling rate 2025",
      ],
      paper: [
        "deforestation paper industry statistics global",
        "old growth forest remaining percentage world",
      ],
      fuel: [
        "CO2 emissions parts per million current 2025 2026",
        "fossil fuel air pollution deaths statistics",
      ],
      water: [
        "bottled water vs tap water environmental cost",
        "water scarcity global statistics freshwater",
      ],
      food: [
        "food waste global statistics environmental impact",
        "food miles carbon footprint supply chain data",
      ],
      glass: [
        "glass recycling rate statistics energy savings",
        "glass production environmental impact sand mining",
      ],
    };

    if (envQueries[environmentalCategory]) {
      queries.push(...envQueries[environmentalCategory]);
    }
  }

  return queries;
}
