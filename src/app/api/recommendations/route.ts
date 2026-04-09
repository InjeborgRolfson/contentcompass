import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { createSupabase } from "@/lib/supabase";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

async function saveToContentLibrary(rec: any): Promise<void> {
  const supabase = createSupabase();
  try {
    const baseSlug = slugify(rec.title);
    
    const { data: existingBySlug } = await supabase
      .from('content_entries')
      .select('title, type')
      .eq('slug', baseSlug)
      .single();

    const slug =
      existingBySlug &&
      !(
        existingBySlug.title.toLowerCase() === rec.title.toLowerCase() &&
        existingBySlug.type.toLowerCase() === rec.type.toLowerCase()
      )
        ? `${baseSlug}-${slugify(rec.type)}`
        : baseSlug;

    await supabase
      .from('content_entries')
      .upsert({
        title: rec.title,
        type: rec.type,
        slug,
        creator: rec.creator || "",
        year: rec.year || "",
        description_en: rec.description_en || rec.description || "",
        description_tr: rec.description_tr || "",
        tags: rec.tags || [],
        ...(rec.photo ? { photo: rec.photo } : {}),
      }, { onConflict: 'title,type' });

  } catch (err: any) {
    console.error(" ContentLibrary save error:", err);
  }
}

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const supabase = createSupabase();

    const { data: userFavorites, error: favError } = await supabase
      .from('favorites')
      .select('title')
      .eq('user_id', session.user.id);


    if (favError) {
      console.error(' Supabase fetch favorites error:', favError);
      return NextResponse.json({ error: 'Failed to fetch favorites', details: favError }, { status: 500 });
    }

    const favoriteTitles: string[] = (userFavorites || []).map((f) => f.title);
    const favoriteWikidataIds: string[] = [];


    const isLocalhost = req.headers.get("host")?.includes("localhost");
    const now = new Date();
    const SIXTY_MINUTES = 60 * 60 * 1000;
    const LIMIT = 10;

    if (!isLocalhost) {
      const { data: rateLimit, error: rateError } = await supabase
        .from('rate_limits')
        .select('*')
        .eq('user_id', session.user.id)
        .single();

      if (!rateLimit || rateError) {
        await supabase
          .from('rate_limits')
          .insert({
            user_id: session.user.id,
            count: 1,
            reset_at: new Date(now.getTime() + SIXTY_MINUTES).toISOString(),
          });
      } else {
        const resetAt = new Date(rateLimit.reset_at);
        if (now > resetAt) {
          await supabase
            .from('rate_limits')
            .update({
              count: 1,
              reset_at: new Date(now.getTime() + SIXTY_MINUTES).toISOString(),
            })
            .eq('user_id', session.user.id);
        } else if (rateLimit.count >= LIMIT) {
          const diffMs = resetAt.getTime() - now.getTime();
          const diffMins = Math.ceil(diffMs / 60000);
          return NextResponse.json(
            {
              error: "Too many requests. Please try again later.",
              minutesLeft: diffMins,
            },
            { status: 429 },
          );
        } else {
          await supabase
            .from('rate_limits')
            .update({ count: rateLimit.count + 1 })
            .eq('user_id', session.user.id);
        }
      }
    }

    let body;
    try {
      body = await req.json();
    } catch (e) {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const {
      selectedFavorites,
      filters,
      lengthFilter,
      yearFilter,
      language,
      turkishOnly,
      excludeTitles,
    } = body;

    if (
      !selectedFavorites ||
      !Array.isArray(selectedFavorites) ||
      selectedFavorites.length === 0
    ) {
      return NextResponse.json(
        { error: "No favorites selected" },
        { status: 400 },
      );
    }

    const favoritesStr = selectedFavorites
      .map((fav: any) => {
        if (fav.isCreator) {
          const typeStr = fav.type ? ` (${fav.type})` : "";
          const noteStr = fav.note ? ` — Note: ${fav.note}` : "";
          return `[Creator] ${fav.title}${typeStr}${noteStr}`;
        } else {
          return `Title: ${fav.title}, Type: ${fav.type}, Note: ${fav.note}, Tags: ${fav.tags.join(", ")}`;
        }
      })
      .join("\n");

    const isOtherSelected = filters.includes("Other");
    let filtersStr =
      filters.length > 0
        ? `Limit recommendations to these formats: ${filters.join(", ")}`
        : "Any format is okay.";

    if (isOtherSelected) {
      filtersStr +=
        "\n      The user has filtered for 'Other' format content. Do not recommend anything that fits the standard categories of Book, Movie, TV Show, Podcast, Music, Game, Article, or YouTube. Only recommend content from alternative or niche formats such as newsletters, graphic novels, stand-up specials, audiobooks, tabletop RPGs, stage plays, short films, or interactive fiction.";
    }

    const langStr =
      language?.toUpperCase() === "TR"
        ? "The user interface is in Turkish. You MUST fill both why_tr and description_tr fields in Turkish, AND why_en and description_en fields in English. The why_tr and description_tr fields are the most important — they must be complete, natural Turkish sentences."
        : "The user interface is in English. You MUST fill both why_en and description_en fields in English, AND why_tr and description_tr fields in Turkish. The why_en and description_en fields are the most important.";
    const allExcludeTitles = [
      ...(excludeTitles || []),
      ...favoriteTitles,
    ];
    const excludeStr =
      allExcludeTitles.length > 0
        ? `Do NOT recommend these titles: ${allExcludeTitles.join(", ")}`
        : "";
    const turkishOnlyStr = turkishOnly
      ? "IMPORTANT: Recommend ONLY Turkish content created by Turkish creators. All recommended items must be in Turkish or from Turkish artists/creators/authors. Do not recommend international content, content in other languages, or content from non-Turkish creators."
      : "";

    const diversityStr =
      filters.length === 0
        ? "Your recommendations must be diverse across formats. Include at least one Book, one Movie, one TV Show, one Podcast, one Music recommendation, one Game, one Article or essay, and one YouTube channel or video. Do not cluster recommendations in a single format even if the user's favorites are all from the same format."
        : "Ensure recommendations are balanced across the selected formats.";

    const lengthStr = lengthFilter
      ? `Prefer ${lengthFilter === "short" ? "short, concise content (short films, novellas, mini-series, short podcasts under 30 min, short games under 10 hours)" : lengthFilter === "medium" ? "medium-length content (90-150 min films, 3-5 season series, 200-400 page books, games 10-50 hours)" : "long, epic content (films over 150 min, long-running series, books over 400 pages, games over 50 hours, extensive podcast archives)"}`
      : "";

    const yearStr = yearFilter
      ? `Prioritize content from ${yearFilter === "classic" ? "before 1980 (classic era)" : yearFilter === "retro" ? "1980 to 2000 (retro era)" : yearFilter === "modern" ? "2000 to 2015 (modern era)" : "2015 to present (recent releases)"}`
      : "";

    const prompt = `You are ContentCompass, an expert content recommendation engine.
      The user has selected the following favorites:
      ${favoritesStr}
      
      When a favorite is marked with [Creator], it indicates the user appreciates that person's body of work and general creative output, not a specific title. For creator entries, recommend works created by them or by similar creators in the same field. For other entries, find the common themes, tones, and stylistic threads across ALL selected items.
      
      Find the intersection of interests across all selected items (both titles and creators combined), and recommend content that sits at that thematic intersection. Do not recommend content that only matches one of the selected items individually.
      
      ${filtersStr}
      ${turkishOnlyStr}
      ${diversityStr}
      ${lengthStr}
      ${yearStr}
      ${excludeStr}
      ${langStr}
      
      Provide EXACTLY 8 personalized recommendations.
      
      WILDCARD REQUIREMENT: Among the 8 recommendations, EXACTLY ONE must be a "wildcard" — a genuine recommendation that comes from a completely different genre, time period, or cultural context than the user's favorites, but has a subtle, meaningful thematic or emotional connection to their taste profile. This wildcard should be surprising yet satisfying.
      
      Return the result ONLY as a JSON array with this exact structure:
      [
        {
          "type": "format type",
          "title": "content title",
          "creator": "author or creator",
          "year": "release year",
          "description": "short description",
          "description_en": "short description in English",
          "description_tr": "short description in Turkish",
          "why": "explanation directly referencing the intersection of user's favorites",
          "why_en": "explanation in English directly referencing the intersection of user's favorites",
          "why_tr": "explanation in Turkish directly referencing the intersection of user's favorites",
          "tags": ["tag1", "tag2", "tag3"],
          "isWildcard": false
        }
      ]
      
      For your wildcard recommendation, set "isWildcard": true instead of false.`;

    const openRouterResponse = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}`,
          "X-Title": "ContentCompass",
        },
        body: JSON.stringify({
          model: process.env.OPENROUTER_MODEL,
          messages: [
            {
              role: "system",
              content:
                "You are a professional content recommendation engine. Respond only with JSON.",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
          response_format: { type: "json_object" },
        }),
      },
    );

    let aiData;
    try {
      aiData = await openRouterResponse.json();
    } catch (e) {
      console.error(" Failed to parse OpenRouter response:", e);
      return NextResponse.json({ error: "AI service returned invalid JSON" }, { status: 500 });
    }

    if (!openRouterResponse.ok || !aiData.choices) {
      console.error(" OpenRouter API error:", JSON.stringify(aiData));
      return NextResponse.json({ error: "AI service error", details: aiData }, { status: 500 });
    }

    const text = aiData.choices[0]?.message?.content?.trim() || "[]";
    try {
      let parsed = JSON.parse(text);
      if (!Array.isArray(parsed) && parsed.recommendations) {
        parsed = parsed.recommendations;
      }

      const recommendations = Array.isArray(parsed) ? parsed : [];
      const recommendationsWithWildcard = recommendations.map((rec: any) => ({
        ...rec,
        isWildcard: rec.isWildcard === true ? true : false,
      }));

      const wildcardCount = recommendationsWithWildcard.filter(
        (rec: any) => rec.isWildcard,
      ).length;

      if (wildcardCount === 0 && recommendationsWithWildcard.length > 0) {
        const randomIndex = Math.floor(
          Math.random() * recommendationsWithWildcard.length,
        );
        recommendationsWithWildcard[randomIndex].isWildcard = true;
      }

      let foundWildcard = false;
      for (let i = 0; i < recommendationsWithWildcard.length; i++) {
        if (recommendationsWithWildcard[i].isWildcard) {
          if (foundWildcard) {
            recommendationsWithWildcard[i].isWildcard = false;
          } else {
            foundWildcard = true;
          }
        }
      }

      const recommendationsWithPhotos = await Promise.all(
        recommendationsWithWildcard.map(async (rec: any) => {
          let photoUrl = "";
          try {
            const searchRes = await fetch(
              `https://www.wikidata.org/w/api.php?action=wbsearchentities&search=${encodeURIComponent(
                rec.title,
              )}&language=en&format=json&origin=*&limit=1`,
            );
            const searchData = await searchRes.json();
            const result = searchData.search?.[0];

            if (result) {
              const entityRes = await fetch(
                `https://www.wikidata.org/w/api.php?action=wbgetentities&ids=${result.id}&props=sitelinks&sitefilter=enwiki&format=json&origin=*`,
              );
              const entityData = await entityRes.json();
              const wikiTitle =
                entityData.entities?.[result.id]?.sitelinks?.enwiki?.title;

              if (wikiTitle) {
                const imagesRes = await fetch(
                  `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(
                    wikiTitle,
                  )}&prop=images&imlimit=50&format=json&origin=*`,
                );
                const imagesData = await imagesRes.json();
                const pages = imagesData.query?.pages || {};
                const pageId = Object.keys(pages)[0];
                const images = pages[pageId]?.images || [];

                const infoboxImage = images.find((img: any) => {
                  const title = img.title.toLowerCase();
                  const isMediaFile =
                    title.endsWith(".jpg") ||
                    title.endsWith(".jpeg") ||
                    title.endsWith(".png");
                  return (
                    !title.includes("icon") &&
                    !title.includes("logo") &&
                    !title.includes("stamp") &&
                    !title.includes("flag") &&
                    !title.includes("commons") &&
                    isMediaFile
                  );
                });

                if (infoboxImage) {
                  const imageInfoRes = await fetch(
                    `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(
                      infoboxImage.title,
                    )}&prop=imageinfo&iiprop=url&iiurlwidth=400&format=json&origin=*`,
                  );
                  const imageInfoData = await imageInfoRes.json();
                  const imagePages = imageInfoData.query?.pages || {};
                  const imagePageId = Object.keys(imagePages)[0];
                  photoUrl =
                    imagePages[imagePageId]?.imageinfo?.[0]?.thumburl ||
                    imagePages[imagePageId]?.imageinfo?.[0]?.url ||
                    "";
                }
              }
            }
          } catch (err) {
            console.error(" Failed to fetch photo for recommendation:", err);
          }

          return { ...rec, photo: photoUrl || null };
        }),
      );

      const favTitlesLower = new Set(favoriteTitles.map((t) => t.toLowerCase()));
      const favWikidataIdSet = new Set(favoriteWikidataIds);
      const filteredRecommendations = recommendationsWithPhotos.filter((rec: any) => {
        if (favTitlesLower.has(rec.title?.toLowerCase())) return false;
        if (rec.wikidata_id && favWikidataIdSet.has(rec.wikidata_id)) return false;
        return true;
      });

      Promise.allSettled(
        filteredRecommendations.map((rec: any) => saveToContentLibrary(rec)),
      ).catch(() => {});

      return NextResponse.json(filteredRecommendations);
    } catch (parseError: any) {
      console.error(" AI response parse error:", parseError);
      return NextResponse.json({ error: "Failed to parse AI response", message: parseError?.message }, { status: 500 });
    }
  } catch (error: any) {
    console.error(" CRITICAL error in recommendations API:", error);
    return NextResponse.json({ error: "Unexpected Server Error", message: error?.message || String(error) }, { status: 500 });
  }
}


