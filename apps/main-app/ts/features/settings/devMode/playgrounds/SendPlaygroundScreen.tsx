import {
  Body,
  Divider,
  IOButton,
  IOColors,
  ListItemHeader,
  ListItemInfo,
  ListItemInfoCopy,
  ListItemSwitch,
  useIOToast,
  VSpacer
} from "@io-app/design-system";
import I18n from "i18next";
import { useEffect, useState } from "react";
import {
  Appearance,
  TextInput as RNTextInput,
  StyleSheet,
  View
} from "react-native";

import { IOScrollView } from "../../../../components/ui/IOScrollView";
import { useHeaderSecondLevel } from "../../../../hooks/useHeaderSecondLevel";
import { preferencesPnTestEnvironmentSetEnabled } from "../../../../store/actions/persistedPreferences";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { isSendLollipopPlaygroundEnabledSelector } from "../../../../store/reducers/backendStatus/remoteConfig";
import { isPnTestEnabledSelector } from "../../../../store/reducers/persistedPreferences";
import { clipboardSetStringWithFeedback } from "../../../../utils/clipboard";
import { sendLollipopLambdaAction } from "../../../pn/lollipopLambda/store/actions";
import {
  isSendLollipopLambdaLoading,
  sendLollipopLambdaErrorReason,
  sendLollipopLambdaResponseBodyString,
  sendLollipopLambdaResponseStatusCode
} from "../../../pn/lollipopLambda/store/selectors";

const styles = StyleSheet.create({
  textInput: {
    textAlignVertical: "top", // Prop supported on Android only
    padding: 8,
    borderWidth: 1,
    height: 140,
    lineHeight: 20,
    minHeight: 120,
    borderRadius: 8
  }
});

export const SendPlaygroundScreen = () => {
  const dispatch = useIODispatch();
  const toast = useIOToast();

  const [requestBody, setRequestBody] = useState<string>("");

  const darkModeEnabled = Appearance.getColorScheme() === "dark";
  const bodyTextColor = darkModeEnabled ? IOColors.white : IOColors["grey-850"];
  const bodyBorderColor = darkModeEnabled
    ? IOColors["grey-850"]
    : IOColors["grey-200"];
  const placeholderTextColor = darkModeEnabled
    ? IOColors["grey-450"]
    : IOColors["grey-650"];

  const errorReasonOrUndefined = useIOSelector(sendLollipopLambdaErrorReason);
  const isSagaLoading = useIOSelector(isSendLollipopLambdaLoading);
  const lollipopPlaygroundEnabled = useIOSelector(
    isSendLollipopPlaygroundEnabledSelector
  );
  const sendUATEnvironmentEnabled = useIOSelector(isPnTestEnabledSelector);
  const responseBodyStringOrUndefined = useIOSelector(
    sendLollipopLambdaResponseBodyString
  );
  const responseStatusCodeOrUndefined = useIOSelector(
    sendLollipopLambdaResponseStatusCode
  );

  const sendLollipopLambdaRequest = (httpVerb: "Get" | "Post") => {
    dispatch(
      sendLollipopLambdaAction.request({
        httpVerb,
        body: requestBody
      })
    );
  };

  useHeaderSecondLevel({
    title: "",
    supportRequest: false
  });

  useEffect(() => {
    if (errorReasonOrUndefined) {
      toast.error(errorReasonOrUndefined);
    }
  }, [errorReasonOrUndefined, toast]);

  useEffect(
    () => () => {
      dispatch(sendLollipopLambdaAction.cancel());
    },
    [dispatch]
  );
  return (
    <IOScrollView>
      <ListItemHeader
        label={I18n.t("features.pn.lollipopPlayground.environmentTitle")}
      />
      <ListItemSwitch
        description={I18n.t("features.pn.lollipopPlayground.uatDescription")}
        disabled={isSagaLoading}
        label={I18n.t("features.pn.lollipopPlayground.uatLabel")}
        onSwitchValueChange={enabled =>
          dispatch(
            preferencesPnTestEnvironmentSetEnabled({ isPnTestEnabled: enabled })
          )
        }
        value={sendUATEnvironmentEnabled}
      />
      <Divider />
      {lollipopPlaygroundEnabled && (
        <>
          <ListItemHeader
            label={I18n.t("features.pn.lollipopPlayground.playgroundTitle")}
          />
          <View>
            <Body>Post Body</Body>
            <VSpacer size={4} />
            <RNTextInput
              accessibilityLabel={I18n.t(
                "features.pn.lollipopPlayground.postBodyLabel"
              )}
              editable={!isSagaLoading}
              multiline={true}
              onChangeText={value => setRequestBody(value)}
              placeholder={I18n.t(
                "features.pn.lollipopPlayground.postBodyPlaceholder"
              )}
              placeholderTextColor={placeholderTextColor}
              scrollEnabled={false}
              style={{
                ...styles.textInput,
                opacity: isSagaLoading ? 0.5 : 1.0,
                color: bodyTextColor,
                borderColor: bodyBorderColor
              }}
              submitBehavior="newline"
              value={requestBody}
            />
            <VSpacer size={16} />
            <ListItemInfo
              label={I18n.t(
                "features.pn.lollipopPlayground.responseStatusCode"
              )}
              numberOfLines={1}
              value={`${responseStatusCodeOrUndefined ?? ""}`}
            />
            <ListItemInfoCopy
              label={I18n.t("features.pn.lollipopPlayground.responseBody")}
              numberOfLines={1000}
              onPress={() =>
                clipboardSetStringWithFeedback(
                  responseBodyStringOrUndefined ?? ""
                )
              }
              value={responseBodyStringOrUndefined ?? ""}
            />
            <VSpacer size={32} />
            <IOButton
              label={I18n.t("features.pn.lollipopPlayground.requestGet")}
              loading={isSagaLoading}
              onPress={() => sendLollipopLambdaRequest("Get")}
            />
            <VSpacer size={8} />
            <IOButton
              label={I18n.t("features.pn.lollipopPlayground.requestPost")}
              loading={isSagaLoading}
              onPress={() => sendLollipopLambdaRequest("Post")}
            />
          </View>
          <VSpacer size={16} />
          <Divider />
        </>
      )}
      <VSpacer size={16} />
    </IOScrollView>
  );
};
