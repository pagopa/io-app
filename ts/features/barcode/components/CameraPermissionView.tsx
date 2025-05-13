import {
  BodySmall,
  H6,
  IOButton,
  IOButtonBlockSpecificProps,
  IOPictograms,
  Pictogram,
  VSpacer
} from "@pagopa/io-app-design-system";
import { StyleSheet, View } from "react-native";

type Props = {
  title: string;
  body: string;
  action: Pick<
    IOButtonBlockSpecificProps,
    "label" | "accessibilityLabel" | "onPress"
  >;
  pictogram: IOPictograms;
};

const CameraPermissionView = (props: Props) => (
  <View style={styles.container}>
    <Pictogram name={props.pictogram} pictogramStyle="light-content" />
    <VSpacer size={24} />
    <H6 color="white" style={styles.text}>
      {props.title}
    </H6>
    <VSpacer size={8} />
    <BodySmall weight="Regular" color="white" style={styles.text}>
      {props.body}
    </BodySmall>
    <VSpacer size={32} />
    <IOButton
      fullWidth
      variant="solid"
      color="contrast"
      label={props.action.label}
      onPress={props.action.onPress}
    />
  </View>
);

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 32,
    alignItems: "center"
  },
  text: {
    textAlign: "center"
  }
});

export { CameraPermissionView };
