import { useEffect, useState } from "react";
import {
  StyleSheet,
  TextInput as RNTextInput,
  View,
  Appearance
} from "react-native";
// import I18n from "i18next";
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
} from "@pagopa/io-app-design-system";
import { IOScrollView } from "../../../../components/ui/IOScrollView";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { isPnTestEnabledSelector } from "../../../../store/reducers/persistedPreferences";
import { preferencesPnTestEnvironmentSetEnabled } from "../../../../store/actions/persistedPreferences";
import { useHeaderSecondLevel } from "../../../../hooks/useHeaderSecondLevel";
import {
  isSendLollipopLambdaLoading,
  sendLollipopLambdaErrorReason,
  sendLollipopLambdaResponseBodyString,
  sendLollipopLambdaResponseStatusCode
} from "../../../pn/lollipopLambda/store/selectors";
import { sendLollipopLambdaAction } from "../../../pn/lollipopLambda/store/actions";
import { clipboardSetStringWithFeedback } from "../../../../utils/clipboard";
import { isSendLollipopPlaygroundEnabledSelector } from "../../../../store/reducers/backendStatus/remoteConfig";

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
      <ListItemHeader label="Environment" />
      <ListItemSwitch
        label="Use UAT"
        description="Sends Service Activation and AAR requests to the UAT environment"
        disabled={isSagaLoading}
        value={sendUATEnvironmentEnabled}
        onSwitchValueChange={enabled =>
          dispatch(
            preferencesPnTestEnvironmentSetEnabled({ isPnTestEnabled: enabled })
          )
        }
      />
      <Divider />
      {lollipopPlaygroundEnabled && (
        <>
          <ListItemHeader label="Lollipop Playground" />
          <View>
            <Body>Post Body</Body>
            <VSpacer size={4} />
            <RNTextInput
              accessibilityLabel="Post Body"
              editable={!isSagaLoading}
              submitBehavior="newline"
              multiline={true}
              placeholder={
                '{\n  p1: "a string",\n  p2: {\n    p3: true\n  }\n}'
              }
              style={{
                ...styles.textInput,
                opacity: isSagaLoading ? 0.5 : 1.0,
                color: bodyTextColor,
                borderColor: bodyBorderColor
              }}
              placeholderTextColor={placeholderTextColor}
              onChangeText={value => setRequestBody(value)}
              value={requestBody}
              scrollEnabled={false}
            />
            <VSpacer size={16} />
            <ListItemInfo
              value={`${responseStatusCodeOrUndefined ?? ""}`}
              label="Response Status Code"
              numberOfLines={1}
            />
            <ListItemInfoCopy
              label="Response Body"
              value={responseBodyStringOrUndefined ?? ""}
              numberOfLines={1000}
              onPress={() =>
                clipboardSetStringWithFeedback(
                  responseBodyStringOrUndefined ?? ""
                )
              }
            />
            <VSpacer size={32} />
            <IOButton
              label="GET"
              onPress={() => sendLollipopLambdaRequest("Get")}
              disabled={isSagaLoading}
            />
            <VSpacer size={8} />
            <IOButton
              label="POST"
              onPress={() => sendLollipopLambdaRequest("Post")}
              disabled={isSagaLoading}
            />
          </View>
          <VSpacer size={16} />
          <Divider />
          <VSpacer size={16} />
        </>
      )}
    </IOScrollView>
  );
};
