import * as React from "react";
import { ScrollView, View } from "react-native";
import { ContentWrapper } from "../../../components/core/ContentWrapper";
import { IOThemeContext } from "../../../components/core/variables/IOColors";
import { IOVisualCostants } from "../../../components/core/variables/IOStyles";

type Props = {
  title: string;
  children: React.ReactNode;
  noMargin?: boolean;
};

export const DesignSystemScreen = ({ children, noMargin = false }: Props) => (
  <IOThemeContext.Consumer>
    {theme => (
      <ScrollView
        contentContainerStyle={{
          backgroundColor: theme["appBackground-primary"],
          paddingTop: IOVisualCostants.appMarginDefault
        }}
      >
        {noMargin ? (
          <View>{children}</View>
        ) : (
          <ContentWrapper>{children}</ContentWrapper>
        )}
      </ScrollView>
    )}
  </IOThemeContext.Consumer>
);
