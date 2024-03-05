import {
  ButtonOutline,
  ButtonSolid,
  ButtonSolidProps,
  VSpacer
} from "@pagopa/io-app-design-system";
import * as React from "react";
import { FooterTopShadow } from "../FooterTopShadow";

type FooterStackButtonProps = {
  primaryActionProps: Omit<ButtonSolidProps, "fullWidth">;
  // It should be `ButtonOutlineProps` but it hasn't exported yet
  secondaryActionProps?: Omit<ButtonSolidProps, "fullWidth">;
};

/**
 * A generic component to render a stack of buttons in the footer
 * @deprecated Use `GradientScrollView` instead to get two stacked buttons
 * @param props
 */
export const FooterStackButton = ({
  primaryActionProps,
  secondaryActionProps
}: FooterStackButtonProps) => (
  <FooterTopShadow>
    <ButtonSolid fullWidth {...primaryActionProps} />
    {secondaryActionProps && (
      <React.Fragment key={`stack_spacer`}>
        <VSpacer size={16} />
        <ButtonOutline fullWidth {...secondaryActionProps} />
      </React.Fragment>
    )}
  </FooterTopShadow>
);
