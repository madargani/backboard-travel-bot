/**
 * Type declarations for the amadeus npm package.
 * @see https://github.com/amadeus4dev/amadeus-node
 */

declare module "amadeus" {
  interface AmadeusConfig {
    clientId: string;
    clientSecret: string;
    hostname?: "test" | "production";
    logLevel?: "debug" | "warn" | "silent";
    customAppId?: string;
    customAppVersion?: string;
  }

  interface AmadeusLocation {
    iataCode: string;
    name: string;
    address?: {
      cityName?: string;
      cityCode?: string;
      countryName?: string;
      countryCode?: string;
    };
    geoCode?: {
      latitude: number;
      longitude: number;
    };
    subType: "AIRPORT" | "CITY";
  }

  interface FlightSegment {
    departure: {
      iataCode: string;
      at: string;
      terminal?: string;
    };
    arrival: {
      iataCode: string;
      at: string;
      terminal?: string;
    };
    carrierCode: string;
    number: string;
    aircraft: {
      code: string;
    };
    duration: string;
    numberOfStops: number;
  }

  interface FlightItinerary {
    duration: string;
    segments: FlightSegment[];
  }

  interface FlightOffer {
    id: string;
    type: string;
    source: string;
    instantTicketingRequired: boolean;
    nonHomogeneous: boolean;
    oneWay: boolean;
    lastTicketingDate: string;
    numberOfBookableSeats: number;
    itineraries: FlightItinerary[];
    price: {
      currency: string;
      total: string;
      base: string;
      grandTotal: string;
    };
    validatingAirlineCodes: string[];
  }

  interface HotelData {
    hotelId: string;
    name?: string;
    chainCode?: string;
    iataCode?: string;
    dupeId?: number;
    geoCode?: {
      latitude: number;
      longitude: number;
    };
  }

  interface HotelOffer {
    type: string;
    hotel: {
      hotelId: string;
      name: string;
      rating?: string;
      cityCode?: string;
      chainCode?: string;
    };
    available: boolean;
    offers: Array<{
      id: string;
      checkInDate: string;
      checkOutDate: string;
      rateCode?: string;
      room: {
        type?: string;
        typeEstimated?: {
          category?: string;
          beds?: number;
          bedType?: string;
        };
        description?: {
          text?: string;
          lang?: string;
        };
      };
      price: {
        currency: string;
        base?: string;
        total: string;
      };
    }>;
  }

  interface Activity {
    id: string;
    type: string;
    name: string;
    shortDescription?: string;
    description?: string;
    geoCode?: {
      latitude: number;
      longitude: number;
    };
    rating?: string;
    pictures?: Array<{ url: string }>;
    bookingLink?: string;
    price?: {
      amount: string;
      currencyCode: string;
    };
    minimumDuration?: string;
  }

  interface AmadeusResponse<T> {
    data: T[];
    meta?: {
      count?: number;
      links?: {
        self?: string;
        next?: string;
        previous?: string;
      };
    };
    result?: {
      status: number;
    };
  }

  interface AmadeusError {
    code: number;
    description: string;
    response?: {
      statusCode?: number;
      result?: {
        errors?: Array<{
          status?: number;
          code?: number;
          title?: string;
          detail?: string;
        }>;
      };
    };
  }

  class ReferenceDataLocations {
    get(params: {
      keyword: string;
      subType?: string;
    }): Promise<AmadeusResponse<AmadeusLocation>>;
  }

  class ReferenceDataLocationsHotelsByCity {
    get(params: { cityCode: string }): Promise<AmadeusResponse<HotelData>>;
  }

  class ReferenceDataLocationsHotelsByGeocode {
    get(params: {
      latitude: number;
      longitude: number;
      radius?: number;
    }): Promise<AmadeusResponse<HotelData>>;
  }

  class ReferenceDataLocationsHotels {
    byCity: ReferenceDataLocationsHotelsByCity;
    byGeocode: ReferenceDataLocationsHotelsByGeocode;
  }

  class ReferenceDataLocationsWrapper {
    hotels: ReferenceDataLocationsHotels;
    get(params: {
      keyword: string;
      subType?: string;
    }): Promise<AmadeusResponse<AmadeusLocation>>;
  }

  class ReferenceData {
    locations: ReferenceDataLocationsWrapper;
  }

  class FlightOffersSearch {
    get(params: {
      originLocationCode: string;
      destinationLocationCode: string;
      departureDate: string;
      returnDate?: string;
      adults: string;
      max?: string;
      currencyCode?: string;
      nonStop?: string;
    }): Promise<AmadeusResponse<FlightOffer>>;
  }

  class HotelOffersSearch {
    get(params: {
      hotelIds: string;
      adults?: string;
      checkInDate: string;
      checkOutDate: string;
      roomQuantity?: string;
      currency?: string;
    }): Promise<AmadeusResponse<HotelOffer>>;
  }

  class ShoppingActivities {
    get(params: {
      latitude: number;
      longitude: number;
      radius?: number;
    }): Promise<AmadeusResponse<Activity>>;
  }

  class Shopping {
    flightOffersSearch: FlightOffersSearch;
    hotelOffersSearch: HotelOffersSearch;
    activities: ShoppingActivities;
  }

  class Amadeus {
    static location: {
      any: string;
      airport: string;
      city: string;
    };

    constructor(config?: AmadeusConfig);
    referenceData: ReferenceData;
    shopping: Shopping;
  }

  export = Amadeus;
}
