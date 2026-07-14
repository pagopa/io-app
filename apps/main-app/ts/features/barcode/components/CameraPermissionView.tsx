import {
  BodySmall,
  H6,
  IOButton,
  IOButtonBlockSpecificProps,
  IOPictograms,
  Pictogram,
  VSpacer
} from "@io-app/design-system";
import { StyleSheet, View } from "react-native";

type Props = {
  action: Pick<
    IOButtonBlockSpecificProps,
    "accessibilityLabel" | "label" | "onPress"
  >;
  body: string;
  pictogram: IOPictograms;
  title: string;
};

const CameraPermissionView = (props: Props) => (
  <View style={styles.container}>
    <Pictogram name={props.pictogram} pictogramStyle="light-content" />
    <VSpacer size={24} />
    <H6 color="white" style={styles.text}>
      {props.title}
    </H6>
    <VSpacer size={8} />
    <BodySmall color="white" style={styles.text} weight="Regular">
      {props.body}
    </BodySmall>
    <VSpacer size={32} />
    <IOButton
      color="contrast"
      fullWidth
      label={props.action.label}
      onPress={props.action.onPress}
      variant="solid"
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
