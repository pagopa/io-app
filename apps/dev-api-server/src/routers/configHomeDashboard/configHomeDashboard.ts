import { Router } from "express";
import fs from "fs";

import { addHandler } from "../../payloads/response";

export const dashboardHomeRouter = Router();

addHandler(
  dashboardHomeRouter,
  "get",
  "/",
  (_, res) => {
    fs.readFile("assets/html/homeDashboard.html", "utf-8", (error, data) => {
      if (error) {
        return res.status(500).send("Error");
      }

      const filesToInclude = extractPathsFromInclude(data);

      filesToInclude.forEach(file => {
        const fileContent = fs.readFileSync(file, "utf8");
        // eslint-disable-next-line no-param-reassign
        data = data.replace(`<include>${file}</include>`, fileContent);
      });

      res.send(data);
    });
  },
  () => 0,
  { description: "Home dashboard" }
);

function extractPathsFromInclude(data: string): Array<string> {
  const regex = /<include>(.*?)<\/include>/gs;
  const results: Array<string> = [];

  // eslint-disable-next-line functional/no-let
  let match;

  while ((match = regex.exec(data)) != null) {
    // eslint-disable-next-line functional/immutable-data
    results.push(match[1]);
  }

  return results;
}
