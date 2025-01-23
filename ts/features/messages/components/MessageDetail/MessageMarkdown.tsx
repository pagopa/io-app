import customVariables from "../../../../theme/variables";
import {
  Markdown,
  MarkdownProps
} from "../../../../components/ui/Markdown/Markdown";

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
  font-size: 24px;
  line-height: 1.1;
  margin-bottom: 16px;
}

h2 {
  font-size: 20px;
  line-height: 1.1;
}

h3 {
  font-size: 18px;
  line-height: 1.2;
}

h4 {
  font-size: 16px;
  line-height: 1.25;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  
}

h5 {
  font-size: 14px;
  line-height: 1.35;
}

h6 {
  font-size: 12px;
  line-height: 1.35;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

img {
  max-width: 100%;
}
`;

export const MessageMarkdown = (props: Props) => (
  <Markdown {...props} cssStyle={MESSAGE_CSS_STYLE} />
);
