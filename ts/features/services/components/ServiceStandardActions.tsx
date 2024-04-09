import React, { ComponentProps } from "react";
import { StyleSheet, View } from "react-native";
import {
  ButtonLink,
  ButtonOutline,
  ButtonSolid,
  IOStyles,
  VSpacer
} from "@pagopa/io-app-design-system";

const styles = StyleSheet.create({
  actionsContainer: {
    flex: 1,
    justifyContent: "flex-end"
  }
});

export type ServiceStandardActionsProps =
  | {
      type: "SingleCta";
      primaryActionProps: Omit<ComponentProps<typeof ButtonSolid>, "fullWidth">;
      secondaryActionProps?: never;
    }
  | {
      type: "SingleCtaWithCustomFlow";
      primaryActionProps: ComponentProps<typeof ButtonLink>;
      secondaryActionProps?: never;
    }
  | {
      type: "TwoCtas";
      primaryActionProps: Omit<ComponentProps<typeof ButtonSolid>, "fullWidth">;
      secondaryActionProps: ComponentProps<typeof ButtonLink>;
    }
  | {
      type: "TwoCtasWithCustomFlow";
      primaryActionProps: Omit<
        ComponentProps<typeof ButtonOutline>,
        "fullWidth"
      >;
      secondaryActionProps: ComponentProps<typeof ButtonLink>;
    };

export const ServiceStandardActions = (props: ServiceStandardActionsProps) => {
  const BlockCtas = () => {
    switch (props.type) {
      case "SingleCta":
        return <ButtonSolid fullWidth {...props.primaryActionProps} />;
      case "SingleCtaWithCustomFlow":
        return (
          <View style={IOStyles.selfCenter}>
            <ButtonLink {...props.primaryActionProps} />
          </View>
        );
      case "TwoCtas":
        return (
          <>
            <ButtonSolid fullWidth {...props.primaryActionProps} />
            <VSpacer size={24} />
            <View style={IOStyles.selfCenter}>
              <ButtonLink {...props.secondaryActionProps} />
            </View>
          </>
        );
      case "TwoCtasWithCustomFlow":
        return (
          <>
            <ButtonOutline fullWidth {...props.primaryActionProps} />
            <VSpacer size={24} />
            <View style={IOStyles.selfCenter}>
              <ButtonLink {...props.secondaryActionProps} />
            </View>
          </>
        );
    }
  };

  return (
    <View style={styles.actionsContainer}>
      <BlockCtas />
    </View>
  );
};
