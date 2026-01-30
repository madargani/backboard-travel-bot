## 1. Setup

- [x] 1.1 Add `amadeus` npm package to dependencies
- [x] 1.2 Add Amadeus environment variables to `.env.example` (`AMADEUS_CLIENT_ID`, `AMADEUS_CLIENT_SECRET`)
- [x] 1.3 Create `src/lib/amadeus.ts` with client initialization and environment validation

## 2. Flight Search Tool

- [x] 2.1 Create `src/lib/tools/flights.ts` with `search_flights` tool
- [x] 2.2 Implement parameters: origin, destination, departureDate, returnDate (optional), adults (default 1)
- [x] 2.3 Return simplified flight offers with price, carrier, departure/arrival times, duration, and booking link (Google Flights)
- [x] 2.4 Handle errors gracefully (invalid airports, no results, API errors)

## 3. Hotel Search Tool

- [x] 3.1 Create `src/lib/tools/hotels.ts` with `search_hotels` tool
- [x] 3.2 Implement parameters: cityCode OR (latitude, longitude), checkInDate, checkOutDate, adults (default 2)
- [x] 3.3 Return simplified hotel offers with name, price, rating, amenities, and booking link
- [x] 3.4 Handle errors gracefully (invalid city, no availability, API errors)

## 4. Activities Search Tool

- [x] 4.1 Create `src/lib/tools/activities.ts` with `search_activities` tool
- [x] 4.2 Implement parameters: latitude, longitude, radius (default 20km)
- [x] 4.3 Return simplified activity list with name, description, price, rating, and booking link
- [x] 4.4 Handle errors gracefully (no activities found, API errors)

## 5. Location Autocomplete Tool

- [x] 5.1 Create `src/lib/tools/locations.ts` with `search_locations` tool
- [x] 5.2 Implement parameters: keyword (required), subType (optional: CITY, AIRPORT, or any)
- [x] 5.3 Return list of matching locations with IATA code, name, country, and type
- [x] 5.4 Handle errors gracefully (no matches, API errors)

## 6. Integration

- [x] 6.1 Import all tool modules in the chat API route to ensure registration
- [ ] 6.2 Verify tools appear in assistant tool list via Backboard

## 7. Validation

- [ ] 7.1 Test flight search with valid IATA codes (e.g., SFO -> NYC)
- [ ] 7.2 Test hotel search with valid city code (e.g., PAR)
- [ ] 7.3 Test activities search with valid coordinates (e.g., Paris)
- [ ] 7.4 Test location autocomplete (e.g., "Paris", "New York")
- [ ] 7.5 Verify booking links are generated and functional
- [ ] 7.6 Test error cases (invalid inputs, missing API keys)
