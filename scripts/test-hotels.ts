#!/usr/bin/env node

// Import to register the tool
import "../src/lib/tools/hotels";
import { executeTool } from "../src/lib/tools";

// Helper function to format date as YYYY-MM-DD
function formatDate(date: Date): string {
  return date.toISOString().split("T")[0];
}

// Calculate dates one month from today
const today = new Date();
const oneMonthFromNow = new Date(today);
oneMonthFromNow.setMonth(today.getMonth() + 1);

const checkInDate = formatDate(oneMonthFromNow);

const checkOutDate = new Date(oneMonthFromNow);
checkOutDate.setDate(oneMonthFromNow.getDate() + 2);

async function testHotels() {
  console.log("=== Testing search_hotels ===\n");

  // Test 1: City code PAR
  console.log(`Test 1: City code PAR, check-in ${checkInDate}, check-out ${formatDate(checkOutDate)}`);
  try {
    const result1 = await executeTool("search_hotels", {
      cityCode: "PAR",
      checkInDate: checkInDate,
      checkOutDate: formatDate(checkOutDate),
    });
    console.log("Result:", JSON.stringify(JSON.parse(result1), null, 2));
  } catch (error) {
    console.error("Error:", error);
  }
  console.log("\n---\n");

  // Test 2: Coordinates (Paris)
  console.log(`Test 2: Coordinates (48.8566, 2.3522 - Paris), check-in ${checkInDate}, check-out ${formatDate(checkOutDate)}`);
  try {
    const result2 = await executeTool("search_hotels", {
      latitude: 48.8566,
      longitude: 2.3522,
      checkInDate: checkInDate,
      checkOutDate: formatDate(checkOutDate),
    });
    console.log("Result:", JSON.stringify(JSON.parse(result2), null, 2));
  } catch (error) {
    console.error("Error:", error);
  }
  console.log("\n---\n");

  // Test 3: Invalid city code
  console.log("Test 3: Invalid city code XYZ");
  try {
    const result3 = await executeTool("search_hotels", {
      cityCode: "XYZ",
      checkInDate: checkInDate,
      checkOutDate: formatDate(checkOutDate),
    });
    console.log("Result:", JSON.stringify(JSON.parse(result3), null, 2));
  } catch (error) {
    console.error("Error:", error);
  }
  console.log("\n---\n");

  // Test 4: Past dates
  console.log("Test 4: Past dates 2023-01-01 to 2023-01-03");
  try {
    const result4 = await executeTool("search_hotels", {
      cityCode: "PAR",
      checkInDate: "2023-01-01",
      checkOutDate: "2023-01-03",
    });
    console.log("Result:", JSON.stringify(JSON.parse(result4), null, 2));
  } catch (error) {
    console.error("Error:", error);
  }
  console.log("\n");
}

testHotels().catch(console.error);
