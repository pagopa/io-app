import { View } from "react-native";
import { MarkdownProps } from "../../../../../components/ui/Markdown/Markdown";

type Props = Omit<MarkdownProps, "cssStyle">;

export const MessageMarkdown = ({ onError, onLoadEnd, testID }: Props) => (
  <View {...{ onError, onLoadEnd, testID }}>Mock Message Markdown</View>
);
