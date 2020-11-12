import { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { View } from "native-base";
import * as React from "react";
import { SafeAreaView } from "react-native";
import { IOStyles } from "../core/variables/IOStyles";

type Props = {
  children: React.ReactNode;
  footer?: React.ReactNode;
};

/**
 * Build the base content of a BottomSheet including a SafeArea, content padding and a ScrollView
 * TODO: rework to avoid to specify footer when builded
 */
export const BottomSheetContent: React.FunctionComponent<Props> = ({
  children,
  footer
}: Props) => (
  <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
    <View style={{ flex: 1, ...IOStyles.horizontalContentPadding }}>
      <BottomSheetScrollView>{children}</BottomSheetScrollView>
    </View>
    {footer}
  </SafeAreaView>
);
