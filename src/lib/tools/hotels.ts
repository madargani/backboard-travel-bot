import { registerTool } from "../tools";
import { amadeus, successResponse, errorResponse } from "../amadeus";

interface HotelSearchArgs {
  cityCode?: string;
  latitude?: number;
  longitude?: number;
  checkInDate: string;
  checkOutDate: string;
  adults?: number;
}

interface SimplifiedHotelOffer {
  hotelId: string;
  name: string;
  rating: string | null;
  pricePerNight: string;
  totalPrice: string;
  currency: string;
  roomType: string | null;
  bookingLink: string;
}

function generateHotelBookingLink(
  hotelName: string,
  cityCode: string,
  checkInDate: string,
  checkOutDate: string
): string {
  const encodedName = encodeURIComponent(hotelName);
  const encodedCity = encodeURIComponent(cityCode);
  return `https://www.booking.com/searchresults.html?ss=${encodedName}+${encodedCity}&checkin=${checkInDate}&checkout=${checkOutDate}`;
}

async function searchHotels(args: HotelSearchArgs) {
  const {
    cityCode,
    latitude,
    longitude,
    checkInDate,
    checkOutDate,
    adults = 2,
  } = args;

  if (!cityCode && (!latitude || !longitude)) {
    return errorResponse(
      "Please provide either a cityCode (e.g., PAR, NYC) or both latitude and longitude."
    );
  }

  try {
    let hotelIds: string[] = [];

    if (cityCode) {
      const hotelListResponse =
        await amadeus.referenceData.locations.hotels.byCity.get({
          cityCode: cityCode.toUpperCase(),
        });

      if (!hotelListResponse.data || hotelListResponse.data.length === 0) {
        return successResponse([]);
      }

      hotelIds = hotelListResponse.data.slice(0, 20).map((h) => h.hotelId);
    } else if (latitude && longitude) {
      const hotelListResponse =
        await amadeus.referenceData.locations.hotels.byGeocode.get({
          latitude,
          longitude,
          radius: 20,
        });

      if (!hotelListResponse.data || hotelListResponse.data.length === 0) {
        return successResponse([]);
      }

      hotelIds = hotelListResponse.data.slice(0, 20).map((h) => h.hotelId);
    }

    const offersResponse = await amadeus.shopping.hotelOffersSearch.get({
      hotelIds: hotelIds.join(","),
      adults: String(adults),
      checkInDate,
      checkOutDate,
    });

    if (!offersResponse.data || offersResponse.data.length === 0) {
      return {
        success: true,
        results: [],
        count: 0,
        message: "No hotels have availability for the selected dates.",
      };
    }

    const results: SimplifiedHotelOffer[] = offersResponse.data
      .filter((hotel) => hotel.available && hotel.offers?.length > 0)
      .slice(0, 10)
      .map((hotel) => {
        const offer = hotel.offers[0];
        const locationCode = cityCode || hotel.hotel.cityCode || "";

        return {
          hotelId: hotel.hotel.hotelId,
          name: hotel.hotel.name,
          rating: hotel.hotel.rating || null,
          pricePerNight: offer.price.base || offer.price.total,
          totalPrice: offer.price.total,
          currency: offer.price.currency,
          roomType: offer.room.typeEstimated?.category || null,
          bookingLink: generateHotelBookingLink(
            hotel.hotel.name,
            locationCode,
            checkInDate,
            checkOutDate
          ),
        };
      });

    return successResponse(results);
  } catch (error: unknown) {
    const amadeusError = error as { code?: number };

    if (amadeusError.code === 404 || amadeusError.code === 400) {
      return errorResponse(
        "Invalid city code. Please use a valid IATA city code (e.g., PAR, NYC, LON). Use search_locations tool to find codes."
      );
    }

    return errorResponse(
      "Unable to search hotels at this time. Please try again later."
    );
  }
}

registerTool(
  "search_hotels",
  "Search for hotel availability in a city or near coordinates. Returns hotel names, prices, ratings, and booking links. Use IATA city codes (e.g., PAR, NYC, LON).",
  {
    type: "object",
    properties: {
      cityCode: {
        type: "string",
        description:
          "IATA city code (e.g., PAR, NYC, LON). Use search_locations tool to find codes.",
      },
      latitude: {
        type: "number",
        description:
          "Latitude for location-based search (use with longitude instead of cityCode)",
      },
      longitude: {
        type: "number",
        description:
          "Longitude for location-based search (use with latitude instead of cityCode)",
      },
      checkInDate: {
        type: "string",
        description: "Check-in date in YYYY-MM-DD format",
      },
      checkOutDate: {
        type: "string",
        description: "Check-out date in YYYY-MM-DD format",
      },
      adults: {
        type: "number",
        description: "Number of adult guests (default: 2)",
      },
    },
    required: ["checkInDate", "checkOutDate"],
  },
  searchHotels
);
