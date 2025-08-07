import { View, StyleSheet } from "react-native";
import LoadingSpinnerOverlay from "../../../../../components/LoadingSpinnerOverlay";

export const LoadingOverlay = ({ onCancel }: { onCancel: () => void }) => (
  <View style={styles.loader}>
    <LoadingSpinnerOverlay isLoading onCancel={onCancel} />
  </View>
);

const styles = StyleSheet.create({
  loader: { position: "absolute", width: "100%", height: "100%" }
});
