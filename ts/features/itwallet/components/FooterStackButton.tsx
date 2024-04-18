import {
  ButtonOutline,
  ButtonSolid,
  VSpacer
} from "@pagopa/io-app-design-system";
import * as React from "react";
import { ComponentProps } from "react";
import { FooterTopShadow } from "../../../components/FooterTopShadow";

type FooterStackButtonProps = {
  primaryActionProps: Omit<ComponentProps<typeof ButtonSolid>, "fullWidth">;
  secondaryActionProps?: Omit<
    ComponentProps<typeof ButtonOutline>,
    "fullWidth"
  >;
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
