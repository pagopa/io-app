import {
  ButtonSolid,
  ButtonSolidProps,
  IOStyles
} from "@pagopa/io-app-design-system";
import * as React from "react";
import { View } from "react-native";

export type ItwFooterVerticalButtonsProps = {
  topButtonProps: ButtonSolidProps;
  bottomButtonProps: ButtonSolidProps;
};

/**
 * A component that renders two buttons vertically
 * @param props - a top and a bottom button based on ButtonSolidProps
 * @returns a component with two buttons stacked vertically
 */
const ItwFooterVerticalButtons = (props: ItwFooterVerticalButtonsProps) => {
  const { topButtonProps, bottomButtonProps } = props;
  return (
    <View style={IOStyles.horizontalContentPadding}>
      <ButtonSolid {...topButtonProps} />
      <ButtonSolid {...bottomButtonProps} />
    </View>
  );
};

export default ItwFooterVerticalButtons;
