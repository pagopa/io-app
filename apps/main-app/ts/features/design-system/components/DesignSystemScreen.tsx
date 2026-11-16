import { ContentWrapper, IODimensions } from "@io-app/design-system";
import { ReactNode } from "react";
import { ScrollView, View } from "react-native";

import { useScreenEndMargin } from "../../../hooks/useScreenEndMargin";

type Props = {
  children: ReactNode;
  noMargin?: boolean;
  title: string;
};

export const DesignSystemScreen = ({ children, noMargin = false }: Props) => {
  const { screenEndMargin } = useScreenEndMargin();

  return (
    <ScrollView
      contentContainerStyle={{
        paddingTop: IODimensions.padding.screen.default,
        paddingBottom: screenEndMargin
      }}
    >
      {noMargin ? (
        <View>{children}</View>
      ) : (
        <ContentWrapper>{children}</ContentWrapper>
      )}
    </ScrollView>
  );
};
