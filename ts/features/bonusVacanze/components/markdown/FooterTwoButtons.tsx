import * as React from "react";
import { BlockButtonProps } from "../../../../components/ui/BlockButtons";
import FooterWithButtons from "../../../../components/ui/FooterWithButtons";
import { cancelButtonProps, OnCancelProps } from "./FooterSingleButton";

type OnRightProps = {
  onRight: () => void;
  title: string;
};

export const rightButtonProps = (props: OnRightProps): BlockButtonProps => {
  return {
    primary: true,
    title: props.title,
    onPress: props.onRight
  };
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
      leftButton={cancelButtonProps(props)}
      rightButton={rightButtonProps(props)}
    />
  );
};
