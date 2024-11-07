import React from "react";
import { MarkdownProps } from "../../../../../components/ui/Markdown/Markdown";
import { View } from "react-native";

type Props = Omit<MarkdownProps, "cssStyle">;

export const MessageMarkdown = ({ onError, onLoadEnd, testID }: Props) => (
  <View {...{ onError, onLoadEnd, testID }}>Mock Message Markdown</View>
);
