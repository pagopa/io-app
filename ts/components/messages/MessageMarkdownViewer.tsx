import { Omit } from "italia-ts-commons/lib/types";
import React from "react";

import MarkdownViewer, { MarkdownViewerProps } from "../MarkdownViewer";

type Props = Omit<MarkdownViewerProps, "cssStyle">;

const MESSAGE_CSS_STYLE = `
body {
  font-size: 16px;
}
`;

const MessageMarkdownViewer: React.SFC<Props> = props => (
  <MarkdownViewer {...props} cssStyle={MESSAGE_CSS_STYLE} />
);

export default MessageMarkdownViewer;
