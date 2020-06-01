import { Text, View } from "native-base";
import * as React from "react";
import { Image, ImageSourcePropType, StyleSheet } from "react-native";
import FooterWithButtons from "../../../components/ui/FooterWithButtons";
import themeVariables from "../../../theme/variables";
import { confirmButtonProps } from "./markdown/ButtonConfigurations";

type Props = {
  image?: ImageSourcePropType;
  body: string;
  confirmText?: string;
  onConfirm: () => void;
};

const styles = StyleSheet.create({
  body: {
    padding: themeVariables.contentPadding,
    flex: 1,
    alignItems: "center"
  }
});

/**
 * A base screen that displays one image, text, and one bottom button
 * @param props
 * @constructor
 */
export const InfoScreenComponent: React.FunctionComponent<Props> = props => {
  return (
    <>
      <View style={styles.body}>
        <View spacer={true} extralarge={true} />
        {props.image && <Image source={props.image} resizeMode="contain" />}
        <View spacer={true} extralarge={true} />
        <Text>{props.body}</Text>
      </View>
      <FooterWithButtons
        type={"SingleButton"}
        leftButton={confirmButtonProps(props.onConfirm, props.confirmText)}
      />
    </>
  );
};
