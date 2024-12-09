import { default as React } from "react";
import { StyleSheet, View } from "react-native";
import {
  ButtonSolid,
  ButtonSolidProps,
  VSpacer,
  Pictogram,
  IOPictograms,
  H6,
  BodySmall
} from "@pagopa/io-app-design-system";

type Props = {
  title: string;
  body: string;
  action: Pick<ButtonSolidProps, "label" | "accessibilityLabel" | "onPress">;
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
    <ButtonSolid
      label={props.action.label}
      accessibilityLabel={props.action.label}
      onPress={props.action.onPress}
      color="contrast"
      fullWidth={true}
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
