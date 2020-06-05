import * as React from "react";
import FooterWithButtons from "../../../../components/ui/FooterWithButtons";
import { cancelButtonProps } from "../buttons/ButtonConfigurations";

export type OnCancelProps = {
  onCancel: () => void;
};

/**
 * A preset for {@link MarkdownBaseView} with a single cancel button
 * @param props
 */
export const FooterSingleButton: React.FunctionComponent<
  OnCancelProps
> = props => {
  return (
    <FooterWithButtons
      type={"SingleButton"}
      leftButton={cancelButtonProps(props.onCancel)}
    />
  );
};
