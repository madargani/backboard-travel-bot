# Change: Add Amadeus Travel Tools for Flights, Hotels, and Activities

## Why

The travel bot currently only has a mock weather tool. To provide real travel planning capabilities and demonstrate Backboard.io's persistent memory with actual travel data, the bot needs tools to search flights, hotels, and activities via the Amadeus Self-Service APIs.

## What Changes

- Add `amadeus` npm package as a dependency
- Create Amadeus client initialization with API key configuration
- Add **Flight Search Tool** to search for flight offers between destinations
- Add **Hotel Search Tool** to find hotels in a city or by location
- Add **Activities Search Tool** to discover tours and experiences at destinations
- Add **Location Autocomplete Tool** to resolve city/airport names to IATA codes
- Include direct booking links in flight and hotel search results
- Register all new tools with the existing tool registry
- Add environment variables for Amadeus API credentials

## Impact

- Affected specs: `tools`
- Affected code:
  - `package.json` (new dependency)
  - `src/lib/amadeus.ts` (new - client initialization)
  - `src/lib/tools/flights.ts` (new - flight search tool)
  - `src/lib/tools/hotels.ts` (new - hotel search tool)
  - `src/lib/tools/activities.ts` (new - activities search tool)
  - `src/lib/tools/locations.ts` (new - location autocomplete tool)
  - `.env.example` (Amadeus credentials documentation)
