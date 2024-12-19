import {
  Body,
  H6,
  IOPictograms,
  IOStyles,
  Pictogram,
  VSpacer,
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
    <View style={IOStyles.alignCenter}>
      <Pictogram name={pictogram} size={120} />
      <VSpacer size={24} />
    </View>
    <H6 style={styles.text}>{title}</H6>
    {subtitle && (
      <>
        <VSpacer size={8} />
        <Body style={styles.text}>{subtitle}</Body>
      </>
    )}
  </View>
);
