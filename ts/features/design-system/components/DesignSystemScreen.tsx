import { ContentWrapper, IOVisualCostants } from "@pagopa/io-app-design-system";

import { ReactNode } from "react";
import { ScrollView, View } from "react-native";
import { useScreenEndMargin } from "../../../hooks/useScreenEndMargin";

type Props = {
  title: string;
  children: ReactNode;
  noMargin?: boolean;
};

export const DesignSystemScreen = ({ children, noMargin = false }: Props) => {
  const { screenEndMargin } = useScreenEndMargin();

  return (
    <ScrollView
      contentContainerStyle={{
        paddingTop: IOVisualCostants.appMarginDefault,
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
