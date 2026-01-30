# Backboard Travel Bot

A Next.js-based travel assistant powered by AI with real-time travel data from Amadeus APIs.

## Testing Amadeus Tools

The project includes test scripts for validating the Amadeus travel tools. These scripts can be run independently to test flight search, hotel search, activities search, and location autocomplete functionality.

### Prerequisites

Ensure you have Amadeus API credentials configured in your `.env` file:

```env
AMADEUS_CLIENT_ID=your_amadeus_api_key
AMADEUS_CLIENT_SECRET=your_amadeus_secret
```

Get your credentials at: https://developers.amadeus.com/

### Running Tests

You can run the test scripts using npm:

```bash
# Test flight search
npm run test:flights

# Test hotel search
npm run test:hotels

# Test activities search
npm run test:activities

# Test location autocomplete
npm run test:locations
```

Or run directly with tsx:

```bash
npx tsx scripts/test-flights.ts
npx tsx scripts/test-hotels.ts
npx tsx scripts/test-activities.ts
npx tsx scripts/test-locations.ts
```

### What Each Test Covers

Each test script validates multiple scenarios:

**Flight Tests (`test-flights.ts`)**
- One-way flight search (SFO → LAX)
- Round-trip flight search (NYC → PAR)
- Invalid airport code handling
- Old date handling (no results)

**Hotel Tests (`test-hotels.ts`)**
- City code search (Paris)
- Coordinate-based search
- Invalid city code handling
- Past date handling

**Activity Tests (`test-activities.ts`)**
- Valid coordinate search (Paris)
- Large radius search
- Invalid coordinate handling
- Remote location handling

**Location Tests (`test-locations.ts`)**
- City name search ("Paris")
- Airport search ("Heathrow")
- Type filtering (CITY only, AIRPORT only)
- No matches handling

### Test Output

Results are printed as formatted JSON showing:
- `success`: Boolean indicating if the search succeeded
- `results`: Array of search results (when successful)
- `count`: Number of results found
- `error`: Error message (when failed)

### Notes

- Tests use the Amadeus test environment by default
- Some searches may return limited results in test mode
- API rate limits apply - if you hit limits, wait a few minutes before retrying
