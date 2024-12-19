import {
  ContentWrapper,
  IOVisualCostants,
  useIOTheme
} from "@pagopa/io-app-design-system";

import { ReactNode } from "react";
import { ScrollView, StatusBar, View, useColorScheme } from "react-native";
import { useScreenEndMargin } from "../../../hooks/useScreenEndMargin";

type Props = {
  title: string;
  children: ReactNode;
  noMargin?: boolean;
};

export const DesignSystemScreen = ({ children, noMargin = false }: Props) => {
  const colorScheme = useColorScheme();
  const theme = useIOTheme();

  const { screenEndMargin } = useScreenEndMargin();

  return (
    <>
      <StatusBar
        barStyle={colorScheme === "dark" ? "light-content" : "default"}
        backgroundColor={theme["appBackground-primary"]}
      />
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
    </>
  );
};
