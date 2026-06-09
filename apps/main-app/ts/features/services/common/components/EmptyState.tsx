import {
  Body,
  H6,
  IOPictograms,
  Pictogram,
  VSpacer,
  VStack,
  WithTestID
} from "@pagopa/io-app-design-system";
import { StyleSheet, View } from "react-native";

const styles = StyleSheet.create({
  text: {
    textAlign: "center"
  }
});

export type EmptyStateProps = WithTestID<{
  pictogram: IOPictograms;
  title: string;
  subtitle?: string;
}>;

export const EmptyState = ({
  pictogram,
  title,
  subtitle,
  testID
}: EmptyStateProps) => (
  <View testID={testID}>
    <VStack style={{ alignItems: "center" }} space={24}>
      <Pictogram name={pictogram} size={120} />
      <H6 accessibilityRole="header" style={styles.text}>
        {title}
      </H6>
    </VStack>
    {subtitle && (
      <>
        <VSpacer size={8} />
        <Body style={styles.text}>{subtitle}</Body>
      </>
    )}
  </View>
);
