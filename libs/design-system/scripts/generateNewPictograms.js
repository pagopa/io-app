/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/restrict-plus-operands */

/**
DRAFT for an AUTOMATIC process to generate new pictogram components 
(`Pictogram....tsx`) from the SVG files exported from Figma.

Prerequisites:
- The pictogram must be exported from the 240 × 240 frame
- The pictogram must be saved with the final name
  - To learn more about naming conventions, please read the local README
*/

// STEPS:

/**
 * 1. Only process the newly added files
 *
 * Suggested path:
 * 1. Files that need to be processed must be in the `svg/originals` folder.
 * 2. Add a new file with the timestamp of the last process run.
 *    The file must be committed along with others.
 * 3. Only files added after that timestamp value will be processed.
 * 4. After the process run, update the new file with the current timestamp.
 */

/**
 * 2. Optimize SVG files with SVGO package (https://github.com/svg/svgo)
 *
 * Suggested path:
 * 1. Add `svgo` to the `package.json` to use it as an executable
 * 2. Configure it with the following parameters:
 *   - removeDimensions
 *   - removeRasterImages
 *   - removeScriptElement
 *   - removeViewBox (disabled)
 * 3. Overwrite the original files
 */

/**
 * 3. Create the relative React component (with .tsx)
 *
 * Suggested path:
 * - For every new SVG file:
 *   1. Copy all the code contained in the `<svg>` tag
 *   2. Use the file `_PictogramTemplate.tsx` as component template
 *      - Replace `PictogramTemplate` with the original SVG name
 *      - Remove all the comments inserted in the component file
 *   3. Replace the `{SVGContent}` placeholder with the code copied
 *      in the step 1, replacing all the tags with the appropriate
 *      React ones. E.g: `path` becomes `Path` and so on…
 *   4. Replace all the color values, set in hexadecimal format, with the
 *      correct `colorValues…` chromatic value.
 *      E.g: fill="#CCCCCC" -> fill="colorValues.hands"
 *   5. Save a new file in the `svg` folder with the same filename
 *      of the relative SVG file and extension `.tsx`.
 *      E.g: svg/originals/PictogramProfile.svg -> svg/PictogramProfile.tsx
 */

const path = require("path");
const join = path.join;
const { optimize } = require("svgo");
const prettier = require("prettier");
const fs = require("fs-extra");
const { transform } = require("@svgr/core");

const svgDir = join(__dirname, "../src/components/pictograms/svg/originals");
const tsxDir = join(__dirname, "../src/components/pictograms/svg");
const templateFilePath = join(
  __dirname,
  "../src/components/pictograms/svg/_PictogramTemplate.tsx"
);
const timestampFilePath = join(__dirname, "pictograms_timestamp.txt");

const colorMapValues = {
  "#0B3EE3": "{colorValues.hands}",
  "#AAEEEF": "{colorValues.main}",
  "#00C5CA": "{colorValues.secondary}"
};

const convertTimestampToReadableFormat = timestamp =>
  new Date(timestamp).toLocaleString("it-IT", {
    timeZone: "Europe/Rome"
  });

fs.readFile(timestampFilePath, "utf8", (err, timestamp) => {
  if (err) {
    console.log("Timestamp file not found.");
    throw err;
  }

  console.log(
    "Last processed timestamp:",
    convertTimestampToReadableFormat(timestamp)
  );
  console.log(`————————————————`);

  fs.readdir(svgDir, (err, files) => {
    if (err) {
      throw err;
    }

    files.forEach(file => {
      const filePath = join(svgDir, file);
      const fileStats = fs.statSync(filePath);

      /* Only process files with a more recent creation
      date later than the timestamp value */
      if (fileStats.mtime > new Date(timestamp)) {
        const data = fs.readFileSync(filePath, "utf8");

        // Check if the file is an SVG
        if (!file.endsWith(".svg")) {
          return;
        }

        // Using SVGO to optimize the SVG
        const result = optimize(data, {
          path: filePath,
          plugins: [
            "removeDimensions",
            "removeRasterImages",
            "removeScriptElement",
            "removeUselessDefs"
          ]
        });
        // Overwrite original SVG file with optimized code
        fs.writeFileSync(filePath, result.data);

        // Convert SVG to JSX using `svgr`
        const jsxCode = transform.sync(result.data, {
          // Optimize SVG code using SVGO
          svgo: true,
          svgoConfig: {
            removeRasterImages: true,
            removeScriptElement: true,
            removeUselessDefs: true
          },
          // Transform tags in Capital Case for React Native
          native: true,
          // Remove `width` and `height` attrs
          dimensions: false,
          /* Replace the hardcoded color value with one
          obtained from `colorMapValues`. */
          replaceAttrValues: colorMapValues,
          /* Prettify the result */
          plugins: ["@svgr/plugin-jsx"]
        });

        // Extract only the Path tags from the JSX code
        const pathTagRegex = /<Path[^>]*\/>/g;
        const pathTags = jsxCode.match(pathTagRegex);
        const jsxCodeWithPathOnly = pathTags.join("");

        const template = fs.readFileSync(templateFilePath, "utf8");
        const componentData = template
          .replace(/PictogramTemplate/g, file.replace(".svg", ""))
          .replace(/\/\/.*\n/g, "") // Remove lines starting with //
          .replace(`{/* SVGContent */}`, jsxCodeWithPathOnly);

        // Save the file with the same filename with `.tsx` extension
        const fileWithTsxExtension = file.replace(".svg", ".tsx");
        const tsxFilePath = join(tsxDir, fileWithTsxExtension);
        fs.writeFileSync(
          tsxFilePath,
          prettier.format(componentData, { parser: "typescript" })
        );

        console.log(`${file} → ${fileWithTsxExtension}`);
      }
    });

    const newTimestamp = new Date();
    const convertedISOTimestamp = newTimestamp.toISOString();
    fs.writeFileSync(timestampFilePath, convertedISOTimestamp);

    const readableUpdatedTimestamp =
      convertTimestampToReadableFormat(newTimestamp);

    console.log(`————————————————`);
    console.log("Updated timestamp:", readableUpdatedTimestamp);
  });
});
