import * as React from "react";
import { View, SafeAreaView, ScrollView } from "react-native";
import { IOStyles } from "../../../components/core/variables/IOStyles";
import BaseScreenComponent from "../../../components/screens/BaseScreenComponent";

type Props = {
  title: string;
  children: React.ReactNode;
};

export const DesignSystemScreen = ({ title, children }: Props) => (
  <BaseScreenComponent goBack={true} headerTitle={title}>
    <SafeAreaView style={IOStyles.flex}>
      <ScrollView>
        <View style={IOStyles.horizontalContentPadding}>{children}</View>
      </ScrollView>
    </SafeAreaView>
  </BaseScreenComponent>
);
