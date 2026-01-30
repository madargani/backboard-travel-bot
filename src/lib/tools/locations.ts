import { registerTool } from "../tools";
import { amadeus, successResponse, errorResponse } from "../amadeus";
import Amadeus from "amadeus";

interface LocationSearchArgs {
  keyword: string;
  subType?: "CITY" | "AIRPORT";
}

interface SimplifiedLocation {
  iataCode: string;
  name: string;
  cityName: string | null;
  countryName: string | null;
  countryCode: string | null;
  type: "CITY" | "AIRPORT";
  latitude: number | null;
  longitude: number | null;
}

async function searchLocations(args: LocationSearchArgs) {
  const { keyword, subType } = args;

  if (!keyword || keyword.length < 1) {
    return errorResponse("Please provide a search keyword (city or airport name).");
  }

  try {
    const subTypeValue = subType
      ? subType === "AIRPORT"
        ? Amadeus.location.airport
        : Amadeus.location.city
      : Amadeus.location.any;

    const response = await amadeus.referenceData.locations.get({
      keyword,
      subType: subTypeValue,
    });

    if (!response.data || response.data.length === 0) {
      return {
        success: true,
        results: [],
        count: 0,
        message: `No locations found for "${keyword}". Try a different spelling or keyword.`,
      };
    }

    const results: SimplifiedLocation[] = response.data
      .slice(0, 10)
      .map((location) => ({
        iataCode: location.iataCode,
        name: location.name,
        cityName: location.address?.cityName || null,
        countryName: location.address?.countryName || null,
        countryCode: location.address?.countryCode || null,
        type: location.subType,
        latitude: location.geoCode?.latitude || null,
        longitude: location.geoCode?.longitude || null,
      }));

    return successResponse(results);
  } catch (error: unknown) {
    const amadeusError = error as { code?: number };

    if (amadeusError.code === 404 || amadeusError.code === 400) {
      return {
        success: true,
        results: [],
        count: 0,
        message: `No locations found for "${keyword}". Try a different spelling.`,
      };
    }

    return errorResponse(
      "Unable to search locations at this time. Please try again later."
    );
  }
}

registerTool(
  "search_locations",
  "Search for cities and airports by name to get IATA codes. Use this to resolve city names like 'Paris' to codes like 'PAR' before searching for flights or hotels.",
  {
    type: "object",
    properties: {
      keyword: {
        type: "string",
        description:
          "City or airport name to search for (e.g., 'Paris', 'New York', 'Heathrow')",
      },
      subType: {
        type: "string",
        enum: ["CITY", "AIRPORT"],
        description:
          "Optional filter: 'CITY' for cities only, 'AIRPORT' for airports only. Omit to search both.",
      },
    },
    required: ["keyword"],
  },
  searchLocations
);
