import React from "react";
import { View, Image, StyleSheet } from "react-native";
import {
  Body,
  FooterWithButtons,
  H4,
  IOStyles
} from "@pagopa/io-app-design-system";
import { SafeAreaView } from "react-native-safe-area-context";
import I18n from "../../i18n";
import brokenLinkImage from "../../../img/broken-link.png";

const styles = StyleSheet.create({
  errorContainer: {
    padding: 20,
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  }
});

export enum ErrorType {
  "LOADING_ERROR" = "LOADING_ERROR",
  "LOGIN_ERROR" = "LOGIN_ERROR"
}

export type IdpAuthErrorScreenType = {
  requestStateError: ErrorType;
  errorCode: string | undefined;
  onCancel: () => void;
  onRetry: () => void;
};

export const IdpAuthErrorScreen = ({
  requestStateError,
  errorCode,
  onCancel,
  onRetry
}: IdpAuthErrorScreenType) => {
  const errorType = requestStateError;
  const errorTranslationKey = `authentication.errors.spid.error_${errorCode}`;

  return (
    <>
      <SafeAreaView edges={["top"]} style={IOStyles.flex}>
        <View style={styles.errorContainer}>
          <Image source={brokenLinkImage} resizeMode="contain" />
          <H4>
            {I18n.t(
              errorType === ErrorType.LOADING_ERROR
                ? "authentication.errors.network.title"
                : "authentication.errors.login.title"
            )}
          </H4>

          {errorType === ErrorType.LOGIN_ERROR && (
            <Body>
              {I18n.t(errorTranslationKey, {
                defaultValue: I18n.t("authentication.errors.spid.unknown")
              })}
            </Body>
          )}
        </View>
      </SafeAreaView>
      <FooterWithButtons
        type={"TwoButtonsInlineThird"}
        primary={{
          type: "Outline",
          buttonProps: {
            label: I18n.t("global.buttons.cancel"),
            accessibilityLabel: I18n.t("global.buttons.cancel"),
            onPress: onCancel
          }
        }}
        secondary={{
          type: "Solid",
          buttonProps: {
            label: I18n.t("global.buttons.retry"),
            accessibilityLabel: I18n.t("global.buttons.retry"),
            onPress: onRetry
          }
        }}
      />
    </>
  );
};
