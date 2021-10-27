import { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { View } from "native-base";
import * as React from "react";
import { SafeAreaView } from "react-native";
import { IOStyles } from "../core/variables/IOStyles";
import { TestID } from "../../types/WithTestID";

type Props = {
  children: React.ReactNode;
  footer?: React.ReactNode;
} & TestID;

/**
 * Build the base content of a BottomSheet including a SafeArea, content padding and a ScrollView
 * TODO: rework to avoid to specify footer when built
 */
export const BottomSheetContent: React.FunctionComponent<Props> = ({
  children,
  footer,
  testID
}: Props) => (
  <SafeAreaView style={{ flex: 1, backgroundColor: "white" }} testID={testID}>
    <View style={{ flex: 1, ...IOStyles.horizontalContentPadding }}>
      <BottomSheetScrollView>{children}</BottomSheetScrollView>
    </View>
    {footer}
  </SafeAreaView>
);
