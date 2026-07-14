import {
  Alert,
  CheckboxLabel,
  HSpacer,
  IOButton,
  IOColors,
  VSpacer
} from "@io-app/design-system";
import * as O from "fp-ts/lib/Option";
import { useState } from "react";
import { StyleSheet, TextInput, View } from "react-native";

import { WithTestID } from "../../../types/WithTestID";
import { maybeNotNullyString } from "../../../utils/strings";
import { LollipopPlaygroundState } from "./LollipopPlayground";

const styles = StyleSheet.create({
  textInput: {
    textAlignVertical: "top", // Prop supported on Android only
    padding: 12,
    borderWidth: 1,
    height: 120,
    borderRadius: 8,
    borderColor: IOColors["grey-450"]
  },
  column: {
    flexDirection: "column",
    justifyContent: "space-between",
    alignItems: "stretch"
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "stretch"
  },
  rowStart: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "stretch"
  }
});

type Props = WithTestID<{
  onCheckBoxPress: (value: boolean) => void;
  onClearButtonPress: () => void;
  onSignButtonPress: (httpRequestBodyText: string) => void;
  playgroundState: LollipopPlaygroundState;
}>;

const LollipopPlaygroundContent = (props: Props) => {
  const [httpRequestBodyText, setHttpRequestBodyText] = useState<string>("");

  const isMessageBodySet = O.isSome(maybeNotNullyString(httpRequestBodyText));

  return (
    <View style={styles.column}>
      <TextInput
        accessibilityHint={`Paste your body message here`}
        accessibilityLabel="Change HTTP request body"
        multiline={true}
        onChangeText={setHttpRequestBodyText}
        placeholder={"paste your body message here"}
        style={styles.textInput}
        value={httpRequestBodyText}
      />
      <VSpacer size={16} />
      <View style={styles.rowStart}>
        <CheckboxLabel
          checked={props.playgroundState.doSignBody}
          label="Sign body"
          onValueChange={props.onCheckBoxPress}
        />
      </View>
      <VSpacer size={16} />
      <View style={styles.row}>
        <IOButton
          disabled={!isMessageBodySet}
          label={`Sign message${
            props.playgroundState.doSignBody ? " with body" : ""
          }`}
          onPress={() => props.onSignButtonPress(httpRequestBodyText)}
          variant="solid"
        />
        <HSpacer size={16} />
        <IOButton
          disabled={!isMessageBodySet}
          label={"Clear"}
          onPress={() => {
            setHttpRequestBodyText("");
            props.onClearButtonPress();
          }}
          variant="outline"
        />
      </View>
      <VSpacer size={16} />
      {props.playgroundState.isVerificationSuccess !== undefined && (
        <Alert
          content={props.playgroundState.verificationResult ?? ""}
          variant={
            props.playgroundState.isVerificationSuccess ? "success" : "error"
          }
        />
      )}
    </View>
  );
};

export default LollipopPlaygroundContent;
