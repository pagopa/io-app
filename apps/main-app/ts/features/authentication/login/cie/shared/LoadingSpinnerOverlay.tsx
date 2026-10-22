import { StyleSheet, View } from "react-native";

import LoadingSpinnerOverlay from "../../../../../components/LoadingSpinnerOverlay";

export const LoadingOverlay = ({ onCancel }: { onCancel?: () => void }) => (
  <View style={StyleSheet.absoluteFill}>
    <LoadingSpinnerOverlay isLoading onCancel={onCancel} />
  </View>
);
