import { useState } from "react";
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
  TextInput,
  VSpacer
} from "@pagopa/io-app-design-system";
import { IOScrollView } from "../../../../components/ui/IOScrollView";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { isPnTestEnabledSelector } from "../../../../store/reducers/persistedPreferences";
import { preferencesPnTestEnvironmentSetEnabled } from "../../../../store/actions/persistedPreferences";
import { useHeaderSecondLevel } from "../../../../hooks/useHeaderSecondLevel";

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

export const SendPlayground = () => {
  const dispatch = useIODispatch();
  const [uiDisabled, _setUIDisabled] = useState<boolean>(false);
  const darkModeEnabled = Appearance.getColorScheme() === "dark";
  const bodyTextColor = darkModeEnabled ? IOColors.white : IOColors["grey-850"];
  const bodyBorderColor = darkModeEnabled
    ? IOColors["grey-850"]
    : IOColors["grey-200"];
  const placeholderTextColor = darkModeEnabled
    ? IOColors["grey-450"]
    : IOColors["grey-650"];

  const sendUATEnvironmentEnabled = useIOSelector(isPnTestEnabledSelector);
  useHeaderSecondLevel({
    title: "",
    supportRequest: false
  });
  return (
    <IOScrollView>
      <ListItemHeader label="Environment" />
      <ListItemSwitch
        label="Use UAT"
        description="Sends Service Activation and AAR requests to the UAT environment"
        disabled={uiDisabled}
        value={sendUATEnvironmentEnabled}
        onSwitchValueChange={enabled =>
          dispatch(
            preferencesPnTestEnvironmentSetEnabled({ isPnTestEnabled: enabled })
          )
        }
      />
      <Divider />
      <ListItemHeader label="Lollipop Playground" />
      <View>
        <Body>Query params</Body>
        <VSpacer size={4} />
        <TextInput
          accessibilityLabel="Query params"
          disabled={uiDisabled}
          value={""}
          placeholder={"p1=v1&p2=v2&..."}
          onChangeText={() => undefined}
        />
        <VSpacer size={16} />
        <Body>Post Body</Body>
        <VSpacer size={4} />
        <RNTextInput
          accessibilityLabel="Post Body"
          editable={!uiDisabled}
          submitBehavior="newline"
          multiline={true}
          placeholder={'{\n  p1: "a string",\n  p2: {\n    p3: true\n  }\n}'}
          style={{
            ...styles.textInput,
            opacity: uiDisabled ? 0.5 : 1.0,
            color: bodyTextColor,
            borderColor: bodyBorderColor
          }}
          placeholderTextColor={placeholderTextColor}
          onChangeText={() => undefined}
          value={""}
          scrollEnabled={false}
        />
        <VSpacer size={16} />
        <ListItemInfo value="" label="Response Status Code" numberOfLines={1} />
        <ListItemInfoCopy
          label="Response Body"
          value=""
          numberOfLines={1000}
          onPress={() => undefined}
        />
        <VSpacer size={32} />
        <IOButton label="GET" onPress={() => undefined} disabled={uiDisabled} />
        <VSpacer size={8} />
        <IOButton
          label="POST"
          onPress={() => undefined}
          disabled={uiDisabled}
        />
      </View>
      <VSpacer size={16} />
      <Divider />
      <VSpacer size={16} />
    </IOScrollView>
  );
};
