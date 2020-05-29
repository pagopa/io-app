import * as React from "react";
import FooterWithButtons from "../../../../components/ui/FooterWithButtons";
import { cancelButtonProps, confirmButtonProps } from "./ButtonConfigurations";
import { OnCancelProps } from "./FooterSingleButton";

type OnRightProps = {
  onRight: () => void;
  title: string;
};

type MyProps = OnCancelProps & OnRightProps;

/**
 * A preset for {@link MarkdownBaseView} that compose the code used in {@link FooterSingleButton}
 * @param props
 */
export const FooterTwoButtons: React.FunctionComponent<MyProps> = props => {
  return (
    <FooterWithButtons
      type={"TwoButtonsInlineHalf"}
      leftButton={cancelButtonProps(props.onCancel)}
      rightButton={confirmButtonProps(props.title, props.onRight)}
    />
  );
};
