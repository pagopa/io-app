/**
 * A specialized Markdown component that sets a specific CSS style
 */

import { Omit } from "italia-ts-commons/lib/types";
import React from "react";

import customVariables from "../../theme/variables";
import Markdown, { MarkdownProps } from "../ui/Markdown";

type Props = Omit<MarkdownProps, "cssStyle">;

const MESSAGE_CSS_STYLE = `
body {
  lineHeight: ${customVariables.lineHeightBase}px;
}

h1, h2, h3, h4, h5, h6 {
  margin-bottom: 8px;
  margin-top: 0;
}

h1 {
  font-size: ${customVariables.fontSizeBase * 2.5}px;
  line-height: ${customVariables.lineHeightBase * 2}px;
}

h2 {
  font-size: ${customVariables.fontSizeBase * 2}px;
  line-height: ${customVariables.lineHeightBase * 1.6666}px;
}

h3 {
  font-size: ${customVariables.fontSizeBase * 1.75}px;
  line-height: ${customVariables.lineHeightBase * 1.3333}px;
}

h4 {
  font-size: ${customVariables.fontSizeBase * 1.5}px;
  line-height: ${customVariables.lineHeightBase * 1.1666}px;
}

h5 {
  font-size: ${customVariables.fontSizeBase * 1.25}px;
  line-height: ${customVariables.lineHeightBase}px;
}

h6 {
  font-size: ${customVariables.fontSizeBase}px;
  line-height: ${customVariables.lineHeightBase}px;
}

img {
  max-width: 100%;
}
`;

const MessageMarkdown: React.SFC<Props> = props => (
  <Markdown {...props} cssStyle={MESSAGE_CSS_STYLE} />
);

export default MessageMarkdown;
