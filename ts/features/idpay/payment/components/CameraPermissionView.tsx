import { default as React } from "react";
import { StyleSheet, View } from "react-native";
import { Pictogram } from "../../../../components/core/pictograms";
import { VSpacer } from "../../../../components/core/spacer/Spacer";
import { H3 } from "../../../../components/core/typography/H3";
import { LabelSmall } from "../../../../components/core/typography/LabelSmall";
import ButtonSolid from "../../../../components/ui/ButtonSolid";

type Props = {
  title: string;
  body: string;
  action: Pick<ButtonSolid, "label" | "accessibilityLabel" | "onPress">;
};

const CameraPermissionView = (props: Props) => (
  <View style={styles.container}>
    <Pictogram name="cameraRequest" />
    <VSpacer size={24} />
    <H3 color="white" style={styles.text}>
      {props.title}
    </H3>
    <VSpacer size={8} />
    <LabelSmall weight="Regular" color="white" style={styles.text}>
      {props.body}
    </LabelSmall>
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
