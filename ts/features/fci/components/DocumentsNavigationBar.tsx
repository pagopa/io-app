import * as React from "react";
import { View, StyleSheet } from "react-native";
import ButtonDefaultOpacity from "../../../components/ButtonDefaultOpacity";
import IconFont from "../../../components/ui/IconFont";
import { H4 } from "../../../components/core/typography/H4";
import { IOColors } from "../../../components/core/variables/IOColors";
import { WithTestID } from "../../../types/WithTestID";

const styles = StyleSheet.create({
  container: {
    backgroundColor: IOColors.white,
    flexDirection: "row",
    borderColor: IOColors.bluegreyLight,
    justifyContent: "space-between",
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
    {/* button left */}
    <ButtonDefaultOpacity
      onPress={props.onPrevious}
      transparent={true}
      disabled={props.disabled}
      testID={"DocumentsNavigationBarLeftButtonTestID"}
    >
      <View style={{ flexDirection: "row" }}>
        <IconFont
          name={"io-back"}
          color={props.iconLeftColor ?? IOColors.blue}
          accessible={true}
        />
        <H4
          style={{
            textAlign: "center"
          }}
        >
          {props.titleLeft}
        </H4>
      </View>
    </ButtonDefaultOpacity>

    {/* button right */}
    <ButtonDefaultOpacity
      onPress={props.onNext}
      transparent={true}
      disabled={props.disabled}
      testID={"DocumentsNavigationBarRightButtonTestID"}
    >
      <View style={{ flexDirection: "row" }}>
        <H4
          style={{
            textAlign: "center"
          }}
        >
          {props.titleRight}
        </H4>

        <IconFont
          name={"io-right"}
          color={props.iconRightColor ?? IOColors.blue}
          accessible={true}
        />
      </View>
    </ButtonDefaultOpacity>
  </View>
);

export default DocumentsNavigationBar;
