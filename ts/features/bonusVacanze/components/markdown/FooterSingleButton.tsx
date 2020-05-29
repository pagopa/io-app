import * as React from "react";
import { BlockButtonProps } from "../../../../components/ui/BlockButtons";
import FooterWithButtons from "../../../../components/ui/FooterWithButtons";
import I18n from "../../../../i18n";

export type OnCancelProps = {
  onCancel: () => void;
};

export const cancelButtonProps = (props: OnCancelProps): BlockButtonProps => {
  return {
    bordered: true,
    title: I18n.t("global.buttons.cancel"),
    onPress: props.onCancel
  };
};

/**
 * A preset for {@link MarkdownBaseView}
 * @param props
 */
export const FooterSingleButton: React.FunctionComponent<
  OnCancelProps
> = props => {
  return (
    <FooterWithButtons
      type={"SingleButton"}
      leftButton={cancelButtonProps(props)}
    />
  );
};
