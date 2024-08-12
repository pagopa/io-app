import React from "react";
import { Body, VSpacer } from "@pagopa/io-app-design-system";
import { View } from "react-native";

type ParagraphWithTitleProps = {
  title: string;
  body: string | React.ReactNode;
};

export const ParagraphWithTitle = ({
  title,
  body
}: ParagraphWithTitleProps) => (
  <View>
    <Body weight="Semibold" color="black">
      {title}
    </Body>
    <VSpacer size={8} />
    <Body>{body}</Body>
  </View>
);
