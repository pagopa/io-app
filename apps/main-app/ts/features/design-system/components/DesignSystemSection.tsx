import { H3, VStack } from "@io-app/design-system";
import { PropsWithChildren } from "react";
import { View } from "react-native";

type OwnProps = PropsWithChildren<{
  title: string;
}>;

const sectionTitleMargin = 24;

export const DesignSystemSection = (props: OwnProps) => (
  <VStack space={sectionTitleMargin}>
    <H3>{props.title}</H3>
    <View>{props.children}</View>
  </VStack>
);
