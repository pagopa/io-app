import { H3, VStack, useIOTheme } from "@pagopa/io-app-design-system";
import * as React from "react";
import { View } from "react-native";

type OwnProps = React.PropsWithChildren<{
  title: string;
}>;

const sectionTitleMargin = 24;

export const DesignSystemSection = (props: OwnProps) => {
  const theme = useIOTheme();

  return (
    <VStack space={sectionTitleMargin}>
      <H3 color={theme["textHeading-default"]}>{props.title}</H3>
      <View>{props.children}</View>
    </VStack>
  );
};
