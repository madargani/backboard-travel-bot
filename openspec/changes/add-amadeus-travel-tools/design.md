## Context

The Backboard Travel-Bot needs real travel data capabilities to be a compelling demo. Amadeus provides Self-Service APIs for flight search, hotel search, and activities/tours. The existing tool registry pattern makes adding new tools straightforward.

**Stakeholders**: Demo users, developers extending the bot

**Constraints**:
- Zero-setup goal: API keys via environment variables only
- Demo focus: Search capabilities prioritized over booking
- Simplicity: Each tool in its own file following existing pattern

## Goals / Non-Goals

**Goals:**
- Enable the AI agent to search real flight offers
- Enable the AI agent to search hotel availability
- Enable the AI agent to discover activities and tours
- Enable the AI agent to resolve city/airport names to IATA codes
- Include direct booking links so users can complete purchases externally
- Follow existing tool registration pattern
- Clean error handling for API failures

**Non-Goals:**
- Booking/purchasing within the bot (requires PCI compliance, payment handling)
- User account management on Amadeus
- Caching of results (keep it simple)
- Rate limiting (Amadeus handles this, we pass through errors)

## Decisions

### Decision 1: Use Official `amadeus` npm Package
- **Why**: Maintained by Amadeus, handles auth, typed responses
- **Alternatives**: Raw REST calls (more code, no type safety), `amadeus-ts` (less maintained)

### Decision 2: Separate File Per Tool
- **Why**: Matches existing pattern (`src/lib/tools/weather.ts`), easy to maintain
- **Structure**:
  ```
  src/lib/
    amadeus.ts         # Shared client initialization
    tools/
      flights.ts       # search_flights tool
      hotels.ts        # search_hotels tool  
      activities.ts    # search_activities tool
      locations.ts     # search_locations tool (autocomplete)
  ```

### Decision 3: Location Autocomplete Tool
- **Why**: AI may receive city names like "Paris" but Amadeus APIs need IATA codes like "PAR"
- **How**: Use Amadeus Airport & City Search API to resolve names to codes
- **Returns**: List of matching cities/airports with IATA codes, names, and country

### Decision 4: Search-Only Tools (No Booking)
- **Why**: Booking requires payment handling, user data, PCI compliance
- **Scope**: Search and display results only - the bot describes options to users

### Decision 5: Sensible Defaults with Override Parameters
- **Why**: AI can call tools with minimal params, users can specify details
- **Examples**:
  - Flights: default 1 adult, economy class
  - Hotels: default 1 room, 2 adults
  - Activities: default 20km radius

### Decision 6: Return Simplified Response Objects with Booking Links
- **Why**: Amadeus responses are verbose; AI needs digestible summaries
- **Format**: Extract key fields (price, carrier, times) into clean objects
- **Booking Links**: Generate deep links to external booking sites (Google Flights, Booking.com, etc.)
  - Flights: Link to Google Flights with pre-filled search params
  - Hotels: Link to hotel's direct booking page or Booking.com/Hotels.com
  - Activities: Link to activity provider's booking page (from Amadeus data)

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| Amadeus API rate limits | Document limits in tool descriptions; errors pass through gracefully |
| API key exposure | Use server-side only; never expose to client |
| Amadeus test environment limitations | Document that some data may be limited in test mode |
| Large response payloads | Limit results (max 5-10 offers per search) |

## Migration Plan

1. Add `amadeus` package
2. Create Amadeus client module
3. Add flight tool
4. Add hotel tool  
5. Add activities tool
6. Update `.env.example` with required variables
7. Test with Amadeus test credentials

**Rollback**: Remove tool files and package; no database changes needed.

## Open Questions

- None at this time
