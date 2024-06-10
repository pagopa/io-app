import {
  ButtonOutline,
  ButtonSolid,
  VSpacer
} from "@pagopa/io-app-design-system";
import * as React from "react";
import { ComponentProps } from "react";
import { FooterTopShadow } from "../FooterTopShadow";

type FooterStackButtonProps = {
  primaryActionProps: Omit<ComponentProps<typeof ButtonSolid>, "fullWidth">;
  secondaryActionProps?: Omit<
    ComponentProps<typeof ButtonOutline>,
    "fullWidth"
  >;
};

/**
 * A generic component to render a stack of buttons in the footer
 * @deprecated As a replacement, you have two options:
 * - Use `IOScrollView` if you need a pleasant gradient effect
 * - Use `FooterActions` if you need to set a custom `scrollHandler` to `ScrollView`
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
