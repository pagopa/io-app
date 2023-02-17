import * as React from "react";
import { View, StyleSheet } from "react-native";
import ButtonDefaultOpacity from "../../../components/ButtonDefaultOpacity";
import IconFont from "../../../components/ui/IconFont";
import { H4 } from "../../../components/core/typography/H4";
import { IOColors } from "../../../components/core/variables/IOColors";
import { WithTestID } from "../../../types/WithTestID";
import { IOStyles } from "../../../components/core/variables/IOStyles";
import { HSpacer } from "../../../components/core/spacer/Spacer";

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

export type IndicatorPositionEnum = "left" | "right";

type Props = WithTestID<{
  titleRight: string;
  titleLeft: string;
  iconRightColor?: string;
  iconLeftColor?: string;
  disabled?: boolean;
  indicatorPosition: IndicatorPositionEnum;
  onPrevious: () => void;
  onNext: () => void;
}>;

const renderNavigationComponent = (
  { onPrevious, onNext, disabled, iconLeftColor, iconRightColor }: Props,
  title: string
) => (
  <>
    {/* button left */}
    <ButtonDefaultOpacity
      onPress={onPrevious}
      style={{
        flex: 1
      }}
      transparent={true}
      disabled={disabled}
      testID={"DocumentsNavigationBarLeftButtonTestID"}
    >
      <IconFont
        name={"io-back"}
        color={iconLeftColor ?? IOColors.blue}
        accessible={true}
      />
    </ButtonDefaultOpacity>
    <H4>{title}</H4>
    {/* button right */}
    <ButtonDefaultOpacity
      onPress={onNext}
      style={{ flex: 1 }}
      transparent={true}
      disabled={disabled}
      testID={"DocumentsNavigationBarRightButtonTestID"}
    >
      <IconFont
        name={"io-right"}
        color={iconRightColor ?? IOColors.blue}
        accessible={true}
      />
    </ButtonDefaultOpacity>
  </>
);

/**
 * A component to render a documents navigation bar with two buttons
 * @param props
 * @returns
 */
const DocumentsNavigationBar = (props: Props) => (
  <View style={[styles.shadow, styles.container]}>
    {props.indicatorPosition === "left" && (
      <>
        {renderNavigationComponent(props, props.titleLeft)}
        <View style={{ flex: 1 }} />
        <H4 style={IOStyles.horizontalContentPadding}>{props.titleRight}</H4>
      </>
    )}
    {props.indicatorPosition === "right" && (
      <>
        <HSpacer />
        <H4>{props.titleLeft}</H4>
        <View style={{ flex: 1 }} />
        {renderNavigationComponent(props, props.titleRight)}
      </>
    )}
  </View>
);

export default DocumentsNavigationBar;
