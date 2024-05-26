#!/usr/bin/env node

import fetch from "node-fetch";
import fs from "fs";

const [framework, componentId] = process.argv.slice(2);

interface ComponentMetadata {
  name: string;
  path: string;
  sha: string;
  size: number;
  url: string;
  html_url: string;
  git_url: string;
  download_url: string;
  type: string;
  _links: {
    self: string;
    git: string;
    html: string;
  };
}

if (!framework || !componentId) {
  console.log(
    "Invalid arguments. Usage: blackbladeui <framework> <component-id>",
  );
  process.exit(1);
}

const supportedFrameworks = ["react", "angular", "vue"];

if (!supportedFrameworks.includes(framework)) {
  console.log("Invalid framework. Supported frameworks: react, angular, vue");
  process.exit(1);
}

console.log(`Fetching component for ${framework}`);

const fetchAndSaveComponent = async (metadata: ComponentMetadata[]) => {
  try {
    for (const data of metadata) {
      const componentResponse = await fetch(data.download_url);
      const component = await componentResponse.text();
      fs.writeFileSync(`${process.cwd()}/${data.name}`, component);
    }

    console.log("Component fetched and saved successfully.");
  } catch (error: any) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

const fetchComponentDetails = async (
  framework: string,
  componentId: string,
) => {
  try {
    const metaResponse = await fetch(
      `https://api.github.com/repos/HaroonSaifi17/BlackBladeUI/contents/src/components/${framework}/${componentId}`,
      { headers: { Accept: "application/vnd.github.v3+json" } },
    );

    if (!metaResponse.ok) {
      console.error(
        `Error fetching component metadata: ${metaResponse.statusText}`,
      );
      process.exit(1);
    }

    const metadata: ComponentMetadata[] =
      (await metaResponse.json()) as ComponentMetadata[];
    await fetchAndSaveComponent(metadata);
  } catch (error: any) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

fetchComponentDetails(framework, componentId);
