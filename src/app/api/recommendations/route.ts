import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const { selectedFavorites, filters, language, turkishOnly, excludeTitles } = await req.json();

    const favoritesStr = selectedFavorites.map((fav: any) => {
      if (fav.isCreator) {
        // Format creator entries specially
        const typeStr = fav.type ? ` (${fav.type})` : '';
        const noteStr = fav.note ? ` — Note: ${fav.note}` : '';
        return `[Creator] ${fav.title}${typeStr}${noteStr}`;
      } else {
        // Format regular title-based entries
        return `Title: ${fav.title}, Type: ${fav.type}, Note: ${fav.note}, Tags: ${fav.tags.join(', ')}`;
      }
    }).join('\n');

    const isOtherSelected = filters.includes('Other');
    let filtersStr = filters.length > 0 ? `Limit recommendations to these formats: ${filters.join(', ')}` : 'Any format is okay.';
    
    if (isOtherSelected) {
      filtersStr += "\n      The user has filtered for 'Other' format content. Do not recommend anything that fits the standard categories of Book, Movie, TV Show, Podcast, Music, Game, Article, or YouTube. Only recommend content from alternative or niche formats such as newsletters, graphic novels, stand-up specials, audiobooks, tabletop RPGs, stage plays, short films, or interactive fiction.";
    }

    const langStr = language?.toUpperCase() === 'TR' 
  ? 'Return the response in Turkish. ALL fields (description, why, tags) must be in Turkish.' 
  : 'Return the response in English.';
    const excludeStr = excludeTitles && excludeTitles.length > 0 ? `Do NOT recommend these titles: ${excludeTitles.join(', ')}` : '';
    const turkishOnlyStr = turkishOnly ? 'IMPORTANT: Recommend ONLY Turkish content created by Turkish creators. All recommended items must be in Turkish or from Turkish artists/creators/authors. Do not recommend international content, content in other languages, or content from non-Turkish creators.' : '';

    const diversityStr = filters.length === 0 
      ? "Your recommendations must be diverse across formats. Include at least one Book, one Movie, one TV Show, one Podcast, one Music recommendation, one Game, one Article or essay, and one YouTube channel or video. Do not cluster recommendations in a single format even if the user's favorites are all from the same format."
      : "Ensure recommendations are balanced across the selected formats.";

    const prompt = `You are ContentCompass, an expert content recommendation engine.
      The user has selected the following favorites:
      ${favoritesStr}
      
      When a favorite is marked with [Creator], it indicates the user appreciates that person's body of work and general creative output, not a specific title. For creator entries, recommend works created by them or by similar creators in the same field. For other entries, find the common themes, tones, and stylistic threads across ALL selected items.
      
      Find the intersection of interests across all selected items (both titles and creators combined), and recommend content that sits at that thematic intersection. Do not recommend content that only matches one of the selected items individually.
      
      ${filtersStr}
      ${turkishOnlyStr}
      ${diversityStr}
      ${excludeStr}
      ${langStr}
      
      Provide EXACTLY 8 personalized recommendations.
      
      Return the result ONLY as a JSON array with this exact structure:
      [
        {
          "type": "format type",
          "title": "content title",
          "creator": "author or creator",
          "year": "release year",
          "description": "short description",
          "why": "explanation directly referencing the intersection of user's favorites",
          "tags": ["tag1", "tag2", "tag3"]
        }
      ]`;

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}`, 
        "X-Title": "ContentCompass",
      },
      body: JSON.stringify({
        "model": "google/gemini-2.0-flash-001",
        "messages": [
          {
            "role": "system",
            "content": "You are a professional content recommendation engine. Respond only with JSON."
          },
          {
            "role": "user",
            "content": prompt
          }
        ],
        "response_format": { "type": "json_object" }
      })
    });

    let data;
    try {
      data = await response.json();
    } catch (e) {
      console.error('Failed to parse OpenRouter response:', e);
      return NextResponse.json({ error: 'AI service returned invalid JSON' }, { status: 500 });
    }

    if (!response.ok || !data.choices) {
      console.error('OpenRouter API error:', JSON.stringify(data));
      return NextResponse.json({ error: 'AI service error', details: data }, { status: 500 });
    }

    const text = data.choices[0]?.message?.content?.trim() || "[]";
    try {
      // OpenRouter sometimes returns the array directly or wrapped in an object
      let parsed = JSON.parse(text);
      
      // Handle the case where the LLM might have wrapped the array in a "recommendations" field
      if (!Array.isArray(parsed) && parsed.recommendations) {
        parsed = parsed.recommendations;
      }
      
      const recommendations = Array.isArray(parsed) ? parsed : [];
      
      // Fetch photos for each recommendation
      const recommendationsWithPhotos = await Promise.all(
        recommendations.map(async (rec: any) => {
          let photoUrl = '';
          try {
            // Search for the content in Wikidata
            const searchRes = await fetch(
              `https://www.wikidata.org/w/api.php?action=wbsearchentities&search=${encodeURIComponent(
                rec.title
              )}&language=en&format=json&origin=*&limit=1`
            );
            const searchData = await searchRes.json();
            const result = searchData.search?.[0];
            
            if (result) {
              // Get Wikipedia title
              const entityRes = await fetch(
                `https://www.wikidata.org/w/api.php?action=wbgetentities&ids=${result.id}&props=sitelinks&sitefilter=enwiki&format=json&origin=*`
              );
              const entityData = await entityRes.json();
              const wikiTitle = entityData.entities?.[result.id]?.sitelinks?.enwiki?.title;

              if (wikiTitle) {
                // Get all images from the page
                const imagesRes = await fetch(
                  `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(
                    wikiTitle
                  )}&prop=images&imlimit=50&format=json&origin=*`
                );
                const imagesData = await imagesRes.json();
                const pages = imagesData.query?.pages || {};
                const pageId = Object.keys(pages)[0];
                const images = pages[pageId]?.images || [];
                
                // Filter out common non-infobox images
                const infoboxImage = images.find((img: any) => {
                  const title = img.title.toLowerCase();
                  const isMediaFile = title.endsWith('.jpg') || title.endsWith('.jpeg') || title.endsWith('.png');
                  return !title.includes('icon') && 
                         !title.includes('logo') && 
                         !title.includes('stamp') && 
                         !title.includes('flag') &&
                         !title.includes('commons') &&
                         isMediaFile;
                });

                if (infoboxImage) {
                  // Get the image info to get the URL
                  const imageInfoRes = await fetch(
                    `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(
                      infoboxImage.title
                    )}&prop=imageinfo&iiprop=url&iiurlwidth=400&format=json&origin=*`
                  );
                  const imageInfoData = await imageInfoRes.json();
                  const imagePages = imageInfoData.query?.pages || {};
                  const imagePageId = Object.keys(imagePages)[0];
                  photoUrl = imagePages[imagePageId]?.imageinfo?.[0]?.thumburl || 
                            imagePages[imagePageId]?.imageinfo?.[0]?.url || '';
                }
              }
            }
          } catch (err) {
            console.error('Failed to fetch photo for recommendation:', err);
          }
          
          return { ...rec, photo: photoUrl || null };
        })
      );
      
      return NextResponse.json(recommendationsWithPhotos);
    } catch (parseError) {
      console.error('Parse error:', parseError, text);
      return NextResponse.json({ error: 'Failed to parse AI response' }, { status: 500 });
    }
  } catch (error) {
    console.error('AI recommendation error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
