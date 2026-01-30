#!/usr/bin/env node

// Import to register the tool
import "../src/lib/tools/flights";
import { executeTool } from "../src/lib/tools";

// Helper function to format date as YYYY-MM-DD
function formatDate(date: Date): string {
  return date.toISOString().split("T")[0];
}

// Calculate dates one month from today
const today = new Date();
const oneMonthFromNow = new Date(today);
oneMonthFromNow.setMonth(today.getMonth() + 1);

const departureDate1 = formatDate(oneMonthFromNow);

const departureDate2 = new Date(oneMonthFromNow);
departureDate2.setDate(oneMonthFromNow.getDate() + 5);

const returnDate = new Date(oneMonthFromNow);
returnDate.setDate(oneMonthFromNow.getDate() + 12);

async function testFlights() {
  console.log("=== Testing search_flights ===\n");

  // Test 1: One-way flight SFO -> LAX
  console.log(`Test 1: One-way flight SFO -> LAX on ${departureDate1}`);
  try {
    const result1 = await executeTool("search_flights", {
      origin: "SFO",
      destination: "LAX",
      departureDate: departureDate1,
      adults: 1,
    });
    console.log("Result:", JSON.stringify(JSON.parse(result1), null, 2));
  } catch (error) {
    console.error("Error:", error);
  }
  console.log("\n---\n");

  // Test 2: Round-trip NYC -> PAR
  console.log(`Test 2: Round-trip NYC -> PAR (${formatDate(departureDate2)} to ${formatDate(returnDate)}), 2 adults`);
  try {
    const result2 = await executeTool("search_flights", {
      origin: "NYC",
      destination: "PAR",
      departureDate: formatDate(departureDate2),
      returnDate: formatDate(returnDate),
      adults: 2,
    });
    console.log("Result:", JSON.stringify(JSON.parse(result2), null, 2));
  } catch (error) {
    console.error("Error:", error);
  }
  console.log("\n---\n");

  // Test 3: Invalid airport codes
  console.log("Test 3: Invalid airport codes (INVALID -> XYZ)");
  try {
    const result3 = await executeTool("search_flights", {
      origin: "INVALID",
      destination: "XYZ",
      departureDate: departureDate1,
    });
    console.log("Result:", JSON.stringify(JSON.parse(result3), null, 2));
  } catch (error) {
    console.error("Error:", error);
  }
  console.log("\n---\n");

  // Test 4: Old date (no results expected)
  console.log("Test 4: Old date 2023-01-01 (no results expected)");
  try {
    const result4 = await executeTool("search_flights", {
      origin: "SFO",
      destination: "LAX",
      departureDate: "2023-01-01",
    });
    console.log("Result:", JSON.stringify(JSON.parse(result4), null, 2));
  } catch (error) {
    console.error("Error:", error);
  }
  console.log("\n");
}

testFlights().catch(console.error);
