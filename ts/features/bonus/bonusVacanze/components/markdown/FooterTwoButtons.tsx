import * as React from "react";
import FooterWithButtons from "../../../../../components/ui/FooterWithButtons";
import {
  cancelButtonProps,
  confirmButtonProps,
  disablePrimaryButtonProps
} from "../buttons/ButtonConfigurations";
import { OnCancelProps } from "./FooterSingleButton";

type OnRightProps = {
  onRight: () => void;
  title: string;
};

type OwnProps = {
  rightDisabled?: boolean;
};

type MyProps = OnCancelProps & OnRightProps & OwnProps;

/**
 * A preset for the screens of bonusVacanze that compose the code used in {@link FooterSingleButton}
 * @param props
 */
export const FooterTwoButtons: React.FunctionComponent<MyProps> = props => (
  <FooterWithButtons
    type={"TwoButtonsInlineThird"}
    leftButton={cancelButtonProps(props.onCancel)}
    rightButton={
      props.rightDisabled ?? false
        ? disablePrimaryButtonProps(props.title)
        : confirmButtonProps(props.onRight, props.title)
    }
  />
);
