import WebView from "react-native-webview";
import { MarkdownProps } from "../../../../../components/ui/Markdown/Markdown";

type Props = Omit<MarkdownProps, "cssStyle">;

export const MessageMarkdown = ({
  children,
  onError,
  onLoadEnd,
  testID
}: Props) => (
  <WebView onError={onError} onLoadEnd={onLoadEnd} testID={testID}>
    {children}
  </WebView>
);
