import { FontWeight, IOColors } from "@pagopa/io-app-design-system";
import { Platform } from "react-native";
import * as RNFS from "react-native-fs";

const textColor = IOColors.bluegrey;
const fontSizeBase = 16;
const textLinkWeight = "600" as FontWeight;
const textMessageDetailLinkColor = IOColors.blue;
const toastColor = IOColors.aquaUltraLight;
const brandPrimary = IOColors.blue;

const OLD_DEMO_TAG_MARKDOWN_REGEX = /^\[demo\]([\s\S]+?)\[\/demo\]\s*\n{2,}/;
export const convertOldDemoMarkdownTag = (markdown: string) =>
  markdown.replace(
    OLD_DEMO_TAG_MARKDOWN_REGEX,
    (_, g1: string) => `::div[${g1}]{.io-demo-block}\n`
  );

export const generateHtml = (
  content: string,
  cssStyle?: string,
  useCustomSortedList: boolean = false,
  avoidTextSelection: boolean = false
) => `
  <!DOCTYPE html>
  <html>
    <head>
      <meta name="viewport" content="initial-scale=1.0, width=device-width" />
    </head>
    <body>
    ${GLOBAL_CSS}
    ${cssStyle ? generateInlineCss(cssStyle) : ""}
    ${avoidTextSelection ? avoidTextSelectionCSS : ""}
    ${useCustomSortedList ? generateCustomFontList : ""}
    ${content}
    </body>
  </html>
  `;

const generateInlineCss = (cssStyle: string) => `<style>
  ${cssStyle}
  </style>`;

const TITILLIUM_SANSPRO_FONT_PATH =
  Platform.OS === "android"
    ? "file:///android_asset/fonts/TitilliumSansPro-Regular.otf"
    : `${RNFS.MainBundlePath}/TitilliumSansPro-Regular.otf`;

const TITILLIUM_SANSPRO_BOLD_FONT_PATH =
  Platform.OS === "android"
    ? "file:///android_asset/fonts/TitilliumSansPro-Bold.otf"
    : `${RNFS.MainBundlePath}/TitilliumSansPro-Bold.otf`;

const GLOBAL_CSS = `
<style>
@font-face {
  font-family: 'Titillium SansPro';
  font-style: normal;
  font-weight: normal;
  src: url('${TITILLIUM_SANSPRO_FONT_PATH}');
}
@font-face {
  font-family: 'Titillium SansPro';
  font-style: normal;
  font-weight: bold;
  src: url('${TITILLIUM_SANSPRO_BOLD_FONT_PATH}');
}

body {
  margin: 0;
  padding: 0;
  color: ${textColor};
  font-size: ${fontSizeBase}px;
  font-family: 'Titillium SansPro';
  overflow-wrap: break-word;
  hyphens: auto;
}

h1, h2, h3, h4, h5, h6 {
  line-height: 1.3333em;
}

p {
  margin-block-start: 0;
  font-size: ${fontSizeBase}px;
}

ul, ol {
  padding-left: 32px;
}

a {
  font-weight: ${textLinkWeight};
  color: ${textMessageDetailLinkColor};
}

div.custom-block.io-demo-block {
  background-color: ${toastColor};
  border-radius: 4px;
  margin-bottom: 32px;
  padding: 4px 8px;
}

div.custom-block.io-demo-block .custom-block-body {
  position: relative;
  padding-right: 48px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  font-weight: bold;
}

</style>
`;

const avoidTextSelectionCSS = `<style>
    body {
      -webkit-touch-callout: none;
      -webkit-user-select: none;
      -khtml-user-select: none;
      -moz-user-select: none;
      -ms-user-select: none;
      user-select: none;
    }
  </style>`;

const generateCustomFontList = `<style>
ol {
  list-style: none;
  counter-reset: li;
}
ol li::before {
  content: counter(li);
  counter-increment: li;
  color: ${brandPrimary};
  display: inline-block;
  width: 1em;
  margin-left: -1.5em;
  margin-right: 0.5em;
  text-align: right;
  direction: rtl;
  font-weight: bold;
  font-size: 32px;
  line-height: 18px;
}
</style>`;
