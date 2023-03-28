import { readFileSync, writeFileSync } from "fs";

// Helper function to read a JSON file and return its contents as an array of objects
export function readJSONFile(filename: string): any[] {
  try {
    const data = readFileSync(filename);
    return JSON.parse(data.toString());
  } catch (error) {
    console.log(`Error reading ${filename} file: ${error}`);
    return [];
  }
}

// Helper function to write an array of objects to a JSON file
export function updateJSONFile(filename: string, data: any[]) {
  try {
    writeFileSync(filename, JSON.stringify(data, null, 2));
  } catch (error) {
    console.log(`Error updating ${filename} file: ${error}`);
  }
}
