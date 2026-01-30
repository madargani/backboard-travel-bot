#!/usr/bin/env node

// Import to register the tool
import "../src/lib/tools/activities";
import { executeTool } from "../src/lib/tools";

async function testActivities() {
  console.log("=== Testing search_activities ===\n");

  // Test 1: Paris coordinates with default radius
  console.log("Test 1: Paris coordinates (48.8566, 2.3522), default radius");
  try {
    const result1 = await executeTool("search_activities", {
      latitude: 48.8566,
      longitude: 2.3522,
    });
    console.log("Result:", JSON.stringify(JSON.parse(result1), null, 2));
  } catch (error) {
    console.error("Error:", error);
  }
  console.log("\n---\n");

  // Test 2: Same coordinates with 50km radius
  console.log("Test 2: Paris coordinates (48.8566, 2.3522), 50km radius");
  try {
    const result2 = await executeTool("search_activities", {
      latitude: 48.8566,
      longitude: 2.3522,
      radius: 50,
    });
    console.log("Result:", JSON.stringify(JSON.parse(result2), null, 2));
  } catch (error) {
    console.error("Error:", error);
  }
  console.log("\n---\n");

  // Test 3: Invalid coordinates
  console.log("Test 3: Invalid coordinates (999, 999)");
  try {
    const result3 = await executeTool("search_activities", {
      latitude: 999,
      longitude: 999,
    });
    console.log("Result:", JSON.stringify(JSON.parse(result3), null, 2));
  } catch (error) {
    console.error("Error:", error);
  }
  console.log("\n---\n");

  // Test 4: Remote location (middle of ocean)
  console.log("Test 4: Remote location (0, 0 - middle of ocean)");
  try {
    const result4 = await executeTool("search_activities", {
      latitude: 0,
      longitude: 0,
    });
    console.log("Result:", JSON.stringify(JSON.parse(result4), null, 2));
  } catch (error) {
    console.error("Error:", error);
  }
  console.log("\n");
}

testActivities().catch(console.error);
