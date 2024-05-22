#!/usr/bin/env node

import * as fs from "fs";
import * as path from "path";
import fetch from "node-fetch";

interface FileData {
  name: string;
  content: string;
}

const args = process.argv.slice(2);

if (args.length === 0 || args.length > 2) {
  console.log(
    "Invalid arguments \nUsage: \n   blackbladeui <framework> <component-id>",
  );
  process.exit(1);
}

const supportedFrameworks = ["react", "angular", "vue"];

if (!supportedFrameworks.includes(args[0])) {
  console.log("Invalid framework \nSupported frameworks: react, angular, vue");
  process.exit(1);
}

console.log("Fetching component for " + args[0]);

const fetchComponent = async (framework: string, componentId: string) => {
  try {
    const response = await fetch(
      `https://api.github.com/repos/HaroonSaifi17/BlackBladeUI/src/components/${framework}/${componentId}/contents`,
      { headers: { Accept: "application/vnd.github.v3.raw+json" } },
    );

    if (!response.ok) {
      console.error(`Error fetching component: ${response.statusText}`);
      process.exit(1);
    }

    const data: FileData[] = (await response.json()) as FileData[];
    const componentPath = path.join(process.cwd(), framework, componentId);

    if (!fs.existsSync(componentPath)) {
      fs.mkdirSync(componentPath, { recursive: true });
    }

    data.forEach((file) => {
      const filePath = path.join(componentPath, file.name);
      fs.writeFileSync(filePath, Buffer.from(file.content, "base64"));
      console.log(`Saved ${filePath}`);
    });

    console.log("Component fetched and saved successfully.");
  } catch (error: any) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};
let hh;

fetchComponent(args[0], args[1]);
