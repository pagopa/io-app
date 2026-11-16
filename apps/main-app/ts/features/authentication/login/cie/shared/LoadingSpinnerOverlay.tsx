import { ComponentProps } from "react";
import { StyleSheet, View } from "react-native";

import LoadingSpinnerOverlay from "../../../../../components/LoadingSpinnerOverlay";

type LoadingOverlayProps = Omit<
  ComponentProps<typeof LoadingSpinnerOverlay>,
  "children" | "isLoading"
>;

export const LoadingOverlay = (props: LoadingOverlayProps) => (
  <View style={StyleSheet.absoluteFill}>
    <LoadingSpinnerOverlay isLoading {...props} />
  </View>
);
