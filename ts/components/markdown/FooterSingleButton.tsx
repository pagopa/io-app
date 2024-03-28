import { FooterWithButtons } from "@pagopa/io-app-design-system";
import I18n from "i18n-js";
import * as React from "react";

export type OnCancelProps = {
  onCancel: () => void;
};

/**
 * A preset for {@link MarkdownBaseView} with a single cancel button
 * @param props
 */
export const FooterSingleButton: React.FunctionComponent<
  OnCancelProps
> = props => (
  <FooterWithButtons
    type="SingleButton"
    primary={{
      type: "Outline",
      buttonProps: {
        label: I18n.t("global.buttons.cancel"),
        accessibilityLabel: I18n.t("global.buttons.cancel"),
        onPress: props.onCancel
      }
    }}
  />
);
