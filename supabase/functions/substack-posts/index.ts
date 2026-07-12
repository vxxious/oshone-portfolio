import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { XMLParser } from "npm:fast-xml-parser";

const FEED_URL = "https://1oshone.substack.com/feed";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders,
    });
  }

  try {
    const response = await fetch(FEED_URL);

    if (!response.ok) {
      throw new Error("Unable to fetch Substack feed.");
    }

    const xml = await response.text();

    const parser = new XMLParser({
      ignoreAttributes: false,
    });

    const parsed = parser.parse(xml);

    const items = parsed.rss.channel.item ?? [];

    const posts = items.map((item: any) => ({
      title: item.title,
      url: item.link,
      excerpt:
        item.description
          ?.replace(/<[^>]+>/g, "")
          ?.slice(0, 180) ?? "",
      date: item.pubDate,
      cover:
        item["media:content"]?.["@_url"] ??
        item.enclosure?.["@_url"] ??
        null,
    }));

    return new Response(JSON.stringify(posts), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=1800",
      },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({
        error: err instanceof Error ? err.message : "Unknown error",
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
        status: 500,
      }
    );
  }
});