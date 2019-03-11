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

h1 {
  font-size: ${customVariables.fontSize6}px;
  line-height: 36px;
  margin-bottom: ${customVariables.fontSizeBase * 0.75}px;
  margin-top: ${customVariables.fontSizeBase * 2}px;
}

h2 {
  font-size: ${customVariables.fontSize5}px;
  line-height: 32px;
  margin-bottom: ${customVariables.fontSizeBase * 0.5}px;
  margin-top: ${customVariables.fontSizeBase * 1.75}px;
}

h3 {
  font-size: ${customVariables.fontSize4}px;
  line-height: 24px;
  margin-bottom: ${customVariables.fontSizeBase * 0.5}px;
  margin-top: ${customVariables.fontSizeBase * 1.5}px;
}
`;

const MessageMarkdown: React.SFC<Props> = props => (
  <Markdown {...props} cssStyle={MESSAGE_CSS_STYLE} />
);

export default MessageMarkdown;
