#!/usr/bin/env node

// Import to register the tool
import "../src/lib/tools/locations";
import { executeTool } from "../src/lib/tools";

async function testLocations() {
  console.log("=== Testing search_locations ===\n");

  // Test 1: Keyword "Paris"
  console.log("Test 1: Keyword 'Paris'");
  try {
    const result1 = await executeTool("search_locations", {
      keyword: "Paris",
    });
    console.log("Result:", JSON.stringify(JSON.parse(result1), null, 2));
  } catch (error) {
    console.error("Error:", error);
  }
  console.log("\n---\n");

  // Test 2: Keyword "Heathrow", subType "AIRPORT"
  console.log("Test 2: Keyword 'Heathrow', subType 'AIRPORT'");
  try {
    const result2 = await executeTool("search_locations", {
      keyword: "Heathrow",
      subType: "AIRPORT",
    });
    console.log("Result:", JSON.stringify(JSON.parse(result2), null, 2));
  } catch (error) {
    console.error("Error:", error);
  }
  console.log("\n---\n");

  // Test 3: Keyword "London", subType "CITY"
  console.log("Test 3: Keyword 'London', subType 'CITY'");
  try {
    const result3 = await executeTool("search_locations", {
      keyword: "London",
      subType: "CITY",
    });
    console.log("Result:", JSON.stringify(JSON.parse(result3), null, 2));
  } catch (error) {
    console.error("Error:", error);
  }
  console.log("\n---\n");

  // Test 4: Keyword "XYZABC" (no matches)
  console.log("Test 4: Keyword 'XYZABC' (no matches expected)");
  try {
    const result4 = await executeTool("search_locations", {
      keyword: "XYZABC",
    });
    console.log("Result:", JSON.stringify(JSON.parse(result4), null, 2));
  } catch (error) {
    console.error("Error:", error);
  }
  console.log("\n");
}

testLocations().catch(console.error);
