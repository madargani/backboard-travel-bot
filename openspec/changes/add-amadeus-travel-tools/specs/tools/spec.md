## ADDED Requirements

### Requirement: Amadeus Client Initialization
The system SHALL provide a shared Amadeus API client that is initialized from environment variables and can be used by all Amadeus-based tools.

#### Scenario: Client initialized with valid credentials
- **WHEN** the Amadeus client module is loaded
- **AND** `AMADEUS_CLIENT_ID` and `AMADEUS_CLIENT_SECRET` environment variables are set
- **THEN** an Amadeus client instance is created and exported
- **AND** the client is configured for the test environment by default

#### Scenario: Client initialization fails without credentials
- **WHEN** the Amadeus client module is loaded
- **AND** required environment variables are missing
- **THEN** the module throws a clear error indicating which variables are missing
- **AND** the error message includes setup instructions

### Requirement: Flight Search Tool
The system SHALL provide a tool for searching flight offers via the Amadeus Flight Offers Search API.

#### Scenario: Search one-way flights
- **WHEN** the `search_flights` tool is called with origin, destination, departureDate, and adults
- **THEN** the tool queries Amadeus for matching flight offers
- **AND** returns a list of flight offers with price, carrier, departure/arrival times, and duration
- **AND** limits results to a maximum of 10 offers

#### Scenario: Search round-trip flights
- **WHEN** the `search_flights` tool is called with origin, destination, departureDate, returnDate, and adults
- **THEN** the tool queries Amadeus for round-trip flight offers
- **AND** returns offers that include both outbound and return segments

#### Scenario: Flight search with invalid airport code
- **WHEN** the `search_flights` tool is called with an invalid IATA airport code
- **THEN** the tool returns an error message indicating the airport code is invalid
- **AND** the error is returned as tool output (not thrown)

#### Scenario: Flight search with no results
- **WHEN** the `search_flights` tool is called with valid parameters but no flights are available
- **THEN** the tool returns an empty results array
- **AND** includes a message indicating no flights were found for the criteria

### Requirement: Hotel Search Tool
The system SHALL provide a tool for searching hotel offers via the Amadeus Hotel Search API.

#### Scenario: Search hotels by city code
- **WHEN** the `search_hotels` tool is called with cityCode, checkInDate, checkOutDate, and adults
- **THEN** the tool first retrieves hotel IDs for the city
- **AND** then queries Amadeus for available offers at those hotels
- **AND** returns a list of hotel offers with name, price per night, star rating, and key amenities
- **AND** limits results to a maximum of 10 hotels

#### Scenario: Search hotels by coordinates
- **WHEN** the `search_hotels` tool is called with latitude, longitude, checkInDate, checkOutDate, and adults
- **THEN** the tool queries Amadeus for hotels near those coordinates
- **AND** returns hotel offers sorted by distance from the coordinates

#### Scenario: Hotel search with invalid city code
- **WHEN** the `search_hotels` tool is called with an invalid city code
- **THEN** the tool returns an error message indicating the city code is invalid
- **AND** suggests using a valid IATA city code

#### Scenario: Hotel search with no availability
- **WHEN** the `search_hotels` tool is called but no hotels have availability
- **THEN** the tool returns an empty results array
- **AND** includes a message indicating no hotels were available for the dates

### Requirement: Activities Search Tool
The system SHALL provide a tool for searching tours and activities via the Amadeus Tours and Activities API.

#### Scenario: Search activities by location
- **WHEN** the `search_activities` tool is called with latitude and longitude
- **THEN** the tool queries Amadeus for activities near those coordinates
- **AND** returns a list of activities with name, short description, price, and rating
- **AND** uses a default search radius of 20 kilometers
- **AND** limits results to a maximum of 10 activities

#### Scenario: Search activities with custom radius
- **WHEN** the `search_activities` tool is called with latitude, longitude, and radius
- **THEN** the tool uses the specified radius for the search
- **AND** returns activities within that radius

#### Scenario: Activities search with no results
- **WHEN** the `search_activities` tool is called but no activities are found in the area
- **THEN** the tool returns an empty results array
- **AND** includes a message suggesting a larger search radius or different location

### Requirement: Location Autocomplete Tool
The system SHALL provide a tool for searching cities and airports via the Amadeus Airport & City Search API to help resolve location names to IATA codes.

#### Scenario: Search locations by keyword
- **WHEN** the `search_locations` tool is called with a keyword like "Paris"
- **THEN** the tool queries Amadeus for matching cities and airports
- **AND** returns a list of locations with IATA code, name, country, and type (CITY or AIRPORT)
- **AND** limits results to a maximum of 10 locations

#### Scenario: Search locations filtered by type
- **WHEN** the `search_locations` tool is called with a keyword and subType of "AIRPORT"
- **THEN** the tool returns only airports matching the keyword
- **AND** excludes cities from the results

#### Scenario: Search locations with no matches
- **WHEN** the `search_locations` tool is called with a keyword that has no matches
- **THEN** the tool returns an empty results array
- **AND** includes a message suggesting alternative spellings or keywords

### Requirement: Booking Links
All search tools SHALL include direct booking links in their results to enable users to complete purchases on external sites.

#### Scenario: Flight results include Google Flights link
- **WHEN** the `search_flights` tool returns flight offers
- **THEN** each offer includes a `bookingLink` field
- **AND** the link points to Google Flights with pre-filled origin, destination, dates, and passengers

#### Scenario: Hotel results include booking link
- **WHEN** the `search_hotels` tool returns hotel offers
- **THEN** each offer includes a `bookingLink` field
- **AND** the link points to the hotel's direct booking page or a booking aggregator (Booking.com, Hotels.com)

#### Scenario: Activity results include booking link
- **WHEN** the `search_activities` tool returns activities
- **THEN** each activity includes a `bookingLink` field
- **AND** the link points to the activity provider's booking page (from Amadeus data)

### Requirement: Tool Response Format
All Amadeus-based tools SHALL return responses in a consistent, simplified format suitable for AI consumption.

#### Scenario: Successful search returns structured data
- **WHEN** any Amadeus tool completes a successful search
- **THEN** the response includes a `success: true` flag
- **AND** includes a `results` array with simplified, relevant fields
- **AND** includes a `count` field with the number of results

#### Scenario: Failed search returns error details
- **WHEN** any Amadeus tool encounters an error
- **THEN** the response includes a `success: false` flag
- **AND** includes an `error` field with a human-readable message
- **AND** does not expose raw API error details to prevent information leakage

### Requirement: Tool Registration
All Amadeus tools SHALL self-register with the tool registry when their modules are imported.

#### Scenario: Flight tool auto-registers
- **GIVEN** the `src/lib/tools/flights.ts` module
- **WHEN** the module is imported
- **THEN** the `search_flights` tool is registered with the global tool registry
- **AND** includes a description explaining it searches for flight offers
- **AND** includes parameter definitions for origin, destination, departureDate, returnDate, and adults

#### Scenario: Hotel tool auto-registers
- **GIVEN** the `src/lib/tools/hotels.ts` module
- **WHEN** the module is imported
- **THEN** the `search_hotels` tool is registered with the global tool registry
- **AND** includes a description explaining it searches for hotel availability
- **AND** includes parameter definitions for cityCode, latitude, longitude, checkInDate, checkOutDate, and adults

#### Scenario: Activities tool auto-registers
- **GIVEN** the `src/lib/tools/activities.ts` module
- **WHEN** the module is imported
- **THEN** the `search_activities` tool is registered with the global tool registry
- **AND** includes a description explaining it searches for tours and activities
- **AND** includes parameter definitions for latitude, longitude, and radius

#### Scenario: Locations tool auto-registers
- **GIVEN** the `src/lib/tools/locations.ts` module
- **WHEN** the module is imported
- **THEN** the `search_locations` tool is registered with the global tool registry
- **AND** includes a description explaining it searches for cities and airports by name
- **AND** includes parameter definitions for keyword and subType
