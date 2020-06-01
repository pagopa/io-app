import { Text, View } from "native-base";
import * as React from "react";
import { Image, ImageSourcePropType, StyleSheet } from "react-native";
import BaseScreenComponent from "../../../components/screens/BaseScreenComponent";
import FooterWithButtons from "../../../components/ui/FooterWithButtons";
import { confirmButtonProps } from "./markdown/ButtonConfigurations";

/**
 * TODO Rename the title prop in the BaseScreenComponent to navigationTitle
 * https://www.pivotaltracker.com/story/show/173056117
 */
type Props = {
  navigationTitle: string;
  image?: ImageSourcePropType;
  body: string;
  confirmText?: string;
  onConfirm: () => void;
};

const styles = StyleSheet.create({
  body: {
    padding: 20,
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
    <BaseScreenComponent goBack={true} headerTitle={props.navigationTitle}>
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
    </BaseScreenComponent>
  );
};
