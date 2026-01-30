import { registerTool } from "../tools";
import { amadeus, successResponse, errorResponse } from "../amadeus";

interface ActivitiesSearchArgs {
  latitude: number;
  longitude: number;
  radius?: number;
}

interface SimplifiedActivity {
  id: string;
  name: string;
  description: string | null;
  price: string | null;
  currency: string | null;
  rating: string | null;
  duration: string | null;
  bookingLink: string | null;
}

async function searchActivities(args: ActivitiesSearchArgs) {
  const { latitude, longitude, radius = 20 } = args;

  try {
    const response = await amadeus.shopping.activities.get({
      latitude,
      longitude,
      radius,
    });

    if (!response.data || response.data.length === 0) {
      return {
        success: true,
        results: [],
        count: 0,
        message:
          "No activities found in this area. Try a larger search radius or different location.",
      };
    }

    const results: SimplifiedActivity[] = response.data
      .slice(0, 10)
      .map((activity) => ({
        id: activity.id,
        name: activity.name,
        description: activity.shortDescription || activity.description || null,
        price: activity.price?.amount || null,
        currency: activity.price?.currencyCode || null,
        rating: activity.rating || null,
        duration: activity.minimumDuration || null,
        bookingLink: activity.bookingLink || null,
      }));

    return successResponse(results);
  } catch (error: unknown) {
    const amadeusError = error as { code?: number };

    if (amadeusError.code === 404 || amadeusError.code === 400) {
      return {
        success: true,
        results: [],
        count: 0,
        message:
          "No activities found for these coordinates. Try a different location.",
      };
    }

    return errorResponse(
      "Unable to search activities at this time. Please try again later."
    );
  }
}

registerTool(
  "search_activities",
  "Search for tours and activities near a location. Returns activity names, descriptions, prices, and booking links. Requires latitude and longitude coordinates.",
  {
    type: "object",
    properties: {
      latitude: {
        type: "number",
        description: "Latitude of the location to search near",
      },
      longitude: {
        type: "number",
        description: "Longitude of the location to search near",
      },
      radius: {
        type: "number",
        description: "Search radius in kilometers (default: 20)",
      },
    },
    required: ["latitude", "longitude"],
  },
  searchActivities
);
