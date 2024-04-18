import { ButtonLink, ButtonSolid, VSpacer } from "@pagopa/io-app-design-system";
import * as React from "react";
import { ComponentProps } from "react";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { FooterTopShadow } from "../../../components/FooterTopShadow";

type FooterStackButtonProps = {
  primaryActionProps: Omit<ComponentProps<typeof ButtonSolid>, "fullWidth">;
  secondaryActionProps?: ComponentProps<typeof ButtonLink>;
};

/**
 * A generic component to render a stack of buttons in the footer
 * @deprecated Use `GradientScrollView` instead to get two stacked buttons
 * @param props
 */
export const FooterStackButton = ({
  primaryActionProps,
  secondaryActionProps
}: FooterStackButtonProps) => {
  const insets = useSafeAreaInsets();
  return (
    <FooterTopShadow>
      <ButtonSolid fullWidth {...primaryActionProps} />
      {secondaryActionProps && (
        <React.Fragment key={`stack_spacer`}>
          <VSpacer size={16} />
          <View style={{ alignSelf: "center", marginBottom: insets.bottom }}>
            <ButtonLink {...secondaryActionProps} />
          </View>
        </React.Fragment>
      )}
    </FooterTopShadow>
  );
};
