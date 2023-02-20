import * as React from "react";
import { ScrollView, View } from "react-native";
import { ContentWrapper } from "../../../components/core/ContentWrapper";
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
    <ScrollView>
      {noMargin ? (
        <View>{children}</View>
      ) : (
        <ContentWrapper>{children}</ContentWrapper>
      )}
    </ScrollView>
  </BaseScreenComponent>
);
