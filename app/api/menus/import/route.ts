import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";

// Domain mappers - each domain has its own parsing logic
const domainMappers = {
  'example.com': parseExampleRecipe,
  'chefkoch.de': parseChefkochRecipe,
  // Add more domains as needed
};

// Example mapper for demonstration
async function parseExampleRecipe(html: string, url: string) {
  // This is a basic example - in reality, you'd parse the HTML structure
  // specific to each website
  return {
    name: "Imported Recipe",
    description: "Recipe imported from " + url,
    ingredients: [
      { name: "Sample Ingredient", amount: 1, unit: "cup" }
    ],
    image: null,
    rating: null,
  };
}

// Chefkoch.de mapper (German recipe site)
async function parseChefkochRecipe(html: string, url: string) {
  try {
    // Look for JSON-LD structured data which many recipe sites use
    const jsonLdMatch = html.match(/<script[^>]*type=["\']application\/ld\+json["\'][^>]*>(.*?)<\/script>/gs);
    
    if (jsonLdMatch) {
      for (const match of jsonLdMatch) {
        const jsonContent = match.replace(/<script[^>]*>/i, '').replace(/<\/script>/i, '');
        try {
          const data = JSON.parse(jsonContent);
          
          // Handle array of structured data
          const recipes = Array.isArray(data) ? data : [data];
          
          for (const item of recipes) {
            if (item['@type'] === 'Recipe') {
              const ingredients = Array.isArray(item.recipeIngredient) 
                ? item.recipeIngredient.map((ing: string) => parseIngredientString(ing))
                : [];

              return {
                name: item.name || "Imported Recipe",
                description: item.description || "",
                ingredients: ingredients.filter(ing => ing !== null),
                image: item.image ? (Array.isArray(item.image) ? item.image[0] : item.image) : null,
                rating: item.aggregateRating?.ratingValue ? parseFloat(item.aggregateRating.ratingValue) : null,
              };
            }
          }
        } catch (e) {
          console.error('Error parsing JSON-LD:', e);
        }
      }
    }

    // Fallback: try to parse HTML structure manually
    // This would need to be customized for each site's HTML structure
    const titleMatch = html.match(/<title[^>]*>([^<]+)</i);
    const name = titleMatch ? titleMatch[1].replace(/\s*-\s*.*$/, '').trim() : "Imported Recipe";

    return {
      name,
      description: `Recipe imported from ${url}`,
      ingredients: [],
      image: null,
      rating: null,
    };

  } catch (error) {
    console.error('Error parsing Chefkoch recipe:', error);
    throw new Error('Failed to parse recipe data');
  }
}

// Helper function to parse ingredient strings like "200g flour" or "1 cup sugar"
function parseIngredientString(ingredientStr: string) {
  // Simple regex to extract amount, unit, and ingredient name
  // This is a basic implementation and might need refinement
  const match = ingredientStr.match(/^(\d+(?:[.,]\d+)?)\s*([a-zA-Z]*)\s+(.+)$/);
  
  if (match) {
    const [, amountStr, unit, name] = match;
    const amount = parseFloat(amountStr.replace(',', '.'));
    
    return {
      name: name.trim(),
      amount: amount,
      unit: unit || 'piece'
    };
  }

  // If no amount/unit found, treat as a simple ingredient
  return {
    name: ingredientStr.trim(),
    amount: 1,
    unit: 'piece'
  };
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { url } = await request.json();

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    // Parse the domain from the URL
    let domain: string;
    try {
      const urlObj = new URL(url);
      domain = urlObj.hostname.replace(/^www\./, '');
    } catch {
      return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
    }

    // Check if we have a mapper for this domain
    const mapper = domainMappers[domain as keyof typeof domainMappers];
    if (!mapper) {
      const supportedDomains = Object.keys(domainMappers).join(', ');
      return NextResponse.json({ 
        error: `Unsupported domain. Currently supported: ${supportedDomains}` 
      }, { status: 400 });
    }

    // Fetch the webpage content
    let html: string;
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; PlanYMeal Recipe Importer)',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      html = await response.text();
    } catch (error) {
      console.error('Error fetching URL:', error);
      return NextResponse.json({ 
        error: "Failed to fetch recipe from URL" 
      }, { status: 400 });
    }

    // Parse the recipe using the appropriate mapper
    let recipeData;
    try {
      recipeData = await mapper(html, url);
    } catch (error) {
      console.error('Error parsing recipe:', error);
      return NextResponse.json({ 
        error: "Failed to parse recipe data from the webpage" 
      }, { status: 400 });
    }

    console.log(`Successfully parsed recipe: ${recipeData.name} from ${domain}`);

    // Return the parsed data without creating the menu yet
    return NextResponse.json({ 
      success: true, 
      recipeData: {
        name: recipeData.name,
        description: recipeData.description,
        image: recipeData.image,
        rating: recipeData.rating,
        ingredients: recipeData.ingredients,
      }
    });

  } catch (error) {
    console.error("Error importing menu:", error);
    return NextResponse.json(
      { error: "Failed to import menu" },
      { status: 500 }
    );
  }
}