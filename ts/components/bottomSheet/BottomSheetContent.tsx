import { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { View } from "native-base";
import * as React from "react";
import { SafeAreaView } from "react-native";
import { IOStyles } from "../core/variables/IOStyles";

type Props = {
  children: React.ReactNode;
};

export const BottomSheetContent: React.FunctionComponent<Props> = ({
  children
}: Props) => (
  <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
    <View style={{ flex: 1, ...IOStyles.horizontalContentPadding }}>
      <BottomSheetScrollView>{children}</BottomSheetScrollView>
    </View>
  </SafeAreaView>
);
