import { pot } from "@pagopa/ts-commons";
import React from "react";
import { View, Image, StyleSheet } from "react-native";
import { Text as NBText } from "native-base";
import I18n from "i18n-js";
import ButtonDefaultOpacity from "../../components/ButtonDefaultOpacity";
import brokenLinkImage from "../../../img/broken-link.png";

const styles = StyleSheet.create({
  errorContainer: {
    padding: 20,
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },
  errorTitle: {
    fontSize: 20,
    marginTop: 10
  },
  errorBody: {
    marginTop: 10,
    marginBottom: 10,
    textAlign: "center"
  },
  errorButtonsContainer: {
    position: "absolute",
    bottom: 30,
    flex: 1,
    flexDirection: "row"
  },
  cancelButtonStyle: {
    flex: 1,
    marginEnd: 10
  },
  flex2: {
    flex: 2
  }
});

export enum ErrorType {
  "LOADING_ERROR" = "LOADING_ERROR",
  "LOGIN_ERROR" = "LOGIN_ERROR"
}

type IdpAuthErrorScreenType = {
    requestStateError: ErrorType;
  errorCode: string | undefined;
  onCancel: (() => void) | undefined;
  onRetry: (() => void) | undefined;
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
    <View style={styles.errorContainer}>
      <Image source={brokenLinkImage} resizeMode="contain" />
      <NBText style={styles.errorTitle} bold={true}>
        {I18n.t(
          errorType === ErrorType.LOADING_ERROR
            ? "authentication.errors.network.title"
            : "authentication.errors.login.title"
        )}
      </NBText>

      {errorType === ErrorType.LOGIN_ERROR && (
        <NBText style={styles.errorBody}>
          {I18n.t(errorTranslationKey, {
            defaultValue: I18n.t("authentication.errors.spid.unknown")
          })}
        </NBText>
      )}

      {(onCancel || onRetry) && (
        <View style={styles.errorButtonsContainer}>
          {onCancel && (
            <ButtonDefaultOpacity
              onPress={onCancel}
              style={styles.cancelButtonStyle}
              block={true}
              light={true}
              bordered={true}
            >
              <NBText>{I18n.t("global.buttons.cancel")}</NBText>
            </ButtonDefaultOpacity>
          )}
          {onRetry && (
            <ButtonDefaultOpacity
              onPress={onRetry}
              style={styles.flex2}
              block={true}
              primary={true}
            >
              <NBText>{I18n.t("global.buttons.retry")}</NBText>
            </ButtonDefaultOpacity>
          )}
        </View>
      )}
    </View>
  );
};
