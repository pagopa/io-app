import * as React from "react";
import { View, StyleSheet } from "react-native";
import ButtonDefaultOpacity from "../../../components/ButtonDefaultOpacity";
import IconFont from "../../../components/ui/IconFont";
import { H4 } from "../../../components/core/typography/H4";
import { IOColors } from "../../../components/core/variables/IOColors";
import { WithTestID } from "../../../types/WithTestID";
import { IOStyles } from "../../../components/core/variables/IOStyles";

const styles = StyleSheet.create({
  container: {
    backgroundColor: IOColors.white,
    flexDirection: "row",
    borderColor: IOColors.bluegreyLight,
    alignItems: "center",
    paddingTop: 12,
    paddingBottom: 12
  },
  shadow: {
    // iOS
    shadowColor: IOColors.black,
    shadowOffset: {
      width: 0,
      height: 2
    },
    zIndex: 999,
    shadowOpacity: 0.2,
    shadowRadius: 3,
    // Android
    elevation: 8,
    borderBottomWidth: 0,
    position: "relative"
  }
});

type Props = WithTestID<{
  titleRight: string;
  titleLeft: string;
  iconRightColor?: string;
  iconLeftColor?: string;
  disabled?: boolean;
  onPrevious: () => void;
  onNext: () => void;
}>;

/**
 * A component to render a documents navigation bar with two buttons
 * @param props
 * @returns
 */
const DocumentsNavigationBar = (props: Props) => (
  <View style={[styles.shadow, styles.container]}>
    <H4 style={IOStyles.horizontalContentPadding}>{props.titleLeft}</H4>
    <View style={{ flex: 1 }} />
    {/* button left */}
    <ButtonDefaultOpacity
      onPress={props.onPrevious}
      transparent={true}
      disabled={props.disabled}
      testID={"DocumentsNavigationBarLeftButtonTestID"}
    >
      <IconFont
        name={"io-back"}
        color={props.iconLeftColor ?? IOColors.blue}
        accessible={true}
      />
    </ButtonDefaultOpacity>
    <H4>{props.titleRight}</H4>
    {/* button right */}
    <ButtonDefaultOpacity
      onPress={props.onNext}
      transparent={true}
      disabled={props.disabled}
      testID={"DocumentsNavigationBarRightButtonTestID"}
    >
      <IconFont
        name={"io-right"}
        color={props.iconRightColor ?? IOColors.blue}
        accessible={true}
      />
    </ButtonDefaultOpacity>
  </View>
);

export default DocumentsNavigationBar;
