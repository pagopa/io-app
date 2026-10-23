import { StyleSheet, View } from "react-native";

import LoadingSpinnerOverlay from "../../../../../components/LoadingSpinnerOverlay";

export const LoadingOverlay = ({
  loadingCaption,
  loadingOpacity,
  onCancel
}: {
  loadingCaption?: string;
  loadingOpacity?: number;
  onCancel?: () => void;
}) => (
  <View style={StyleSheet.absoluteFill}>
    <LoadingSpinnerOverlay
      isLoading
      loadingCaption={loadingCaption}
      loadingOpacity={loadingOpacity}
      onCancel={onCancel}
    />
  </View>
);
