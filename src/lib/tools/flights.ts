import { registerTool } from "../tools";
import { amadeus, successResponse, errorResponse } from "../amadeus";

interface FlightSearchArgs {
  origin: string;
  destination: string;
  departureDate: string;
  returnDate?: string;
  adults?: number;
}

interface SimplifiedFlightOffer {
  id: string;
  price: string;
  currency: string;
  carrier: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  stops: number;
  returnDepartureTime?: string;
  returnArrivalTime?: string;
  returnDuration?: string;
  returnStops?: number;
  bookingLink: string;
}

function generateGoogleFlightsLink(
  origin: string,
  destination: string,
  departureDate: string,
  returnDate?: string,
  adults: number = 1,
): string {
  const baseUrl = "https://www.google.com/travel/flights";
  const params = new URLSearchParams({
    q: `flights from ${origin} to ${destination}`,
    curr: "USD",
  });

  const formattedDeparture = departureDate.replace(/-/g, "");
  let flightPath = `?q=Flights%20to%20${destination}%20from%20${origin}%20on%20${formattedDeparture}`;

  if (returnDate) {
    const formattedReturn = returnDate.replace(/-/g, "");
    flightPath += `%20returning%20${formattedReturn}`;
  }

  if (adults > 1) {
    flightPath += `%20${adults}%20passengers`;
  }

  return baseUrl + flightPath;
}

async function searchFlights(args: FlightSearchArgs) {
  const { origin, destination, departureDate, returnDate, adults = 1 } = args;

  try {
    const response = await amadeus.shopping.flightOffersSearch.get({
      originLocationCode: origin.toUpperCase(),
      destinationLocationCode: destination.toUpperCase(),
      departureDate,
      returnDate,
      adults: String(adults),
      max: "10",
      currencyCode: "USD",
    });

    if (!response.data || response.data.length === 0) {
      return successResponse([]);
    }

    const bookingLink = generateGoogleFlightsLink(
      origin,
      destination,
      departureDate,
      returnDate,
      adults,
    );

    const results: SimplifiedFlightOffer[] = response.data.map((offer) => {
      const outbound = offer.itineraries[0];
      const firstSegment = outbound.segments[0];
      const lastSegment = outbound.segments[outbound.segments.length - 1];

      const result: SimplifiedFlightOffer = {
        id: offer.id,
        price: offer.price.grandTotal || offer.price.total,
        currency: offer.price.currency,
        carrier: offer.validatingAirlineCodes?.[0] || firstSegment.carrierCode,
        departureTime: firstSegment.departure.at,
        arrivalTime: lastSegment.arrival.at,
        duration: outbound.duration,
        stops: outbound.segments.length - 1,
        bookingLink,
      };

      if (offer.itineraries.length > 1) {
        const returnFlight = offer.itineraries[1];
        const returnFirstSegment = returnFlight.segments[0];
        const returnLastSegment =
          returnFlight.segments[returnFlight.segments.length - 1];

        result.returnDepartureTime = returnFirstSegment.departure.at;
        result.returnArrivalTime = returnLastSegment.arrival.at;
        result.returnDuration = returnFlight.duration;
        result.returnStops = returnFlight.segments.length - 1;
      }

      return result;
    });

    return successResponse(results);
  } catch (error: unknown) {
    const amadeusError = error as { code?: number; description?: string };

    if (amadeusError.code === 404 || amadeusError.code === 400) {
      return errorResponse(
        "Invalid airport code. Please use valid IATA codes (e.g., SFO, JFK, LAX).",
      );
    }

    return errorResponse(
      "Unable to search flights at this time. Please try again later.",
    );
  }
}

registerTool(
  "search_flights",
  "Search for flight offers between two airports. Returns prices, carriers, times, and booking links. Use IATA airport codes (e.g., SFO, JFK, LAX).",
  {
    type: "object",
    properties: {
      origin: {
        type: "string",
        description:
          "Origin airport IATA code (e.g., SFO, JFK, LAX). Use search_locations tool to find codes.",
      },
      destination: {
        type: "string",
        description:
          "Destination airport IATA code (e.g., SFO, JFK, LAX). Use search_locations tool to find codes.",
      },
      departureDate: {
        type: "string",
        description: "Departure date in YYYY-MM-DD format",
      },
      returnDate: {
        type: "string",
        description:
          "Optional return date for round-trip flights in YYYY-MM-DD format",
      },
      adults: {
        type: "number",
        description: "Number of adult passengers (default: 1)",
      },
    },
    required: ["origin", "destination", "departureDate"],
  },
  searchFlights,
);
