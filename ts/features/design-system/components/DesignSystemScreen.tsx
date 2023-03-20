import * as React from "react";
import { ScrollView, View } from "react-native";
import { ContentWrapper } from "../../../components/core/ContentWrapper";
import { IOThemeContext } from "../../../components/core/variables/IOColors";
import BaseScreenComponent from "../../../components/screens/BaseScreenComponent";

type Props = {
  title: string;
  children: React.ReactNode;
  noMargin?: boolean;
};

export const DesignSystemScreen = ({
  title,
  children,
  noMargin = false
}: Props) => (
  <BaseScreenComponent goBack={true} headerTitle={title}>
    <IOThemeContext.Consumer>
      {theme => (
        <ScrollView
          style={{
            backgroundColor: theme["appBackground-primary"]
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
  </BaseScreenComponent>
);
