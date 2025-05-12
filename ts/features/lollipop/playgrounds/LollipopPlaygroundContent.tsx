import {
  Alert,
  CheckboxLabel,
  HSpacer,
  IOButton,
  IOColors,
  VSpacer
} from "@pagopa/io-app-design-system";
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
  playgroundState: LollipopPlaygroundState;
  onSignButtonPress: (httpRequestBodyText: string) => void;
  onClearButtonPress: () => void;
  onCheckBoxPress: (value: boolean) => void;
}>;

const LollipopPlaygroundContent = (props: Props) => {
  const [httpRequestBodyText, setHttpRequestBodyText] = useState<string>("");

  const isMessageBodySet = O.isSome(maybeNotNullyString(httpRequestBodyText));

  return (
    <View style={styles.column}>
      <TextInput
        accessibilityLabel="Change HTTP request body"
        accessibilityHint={`Paste your body message here`}
        multiline={true}
        placeholder={"paste your body message here"}
        style={styles.textInput}
        onChangeText={setHttpRequestBodyText}
        value={httpRequestBodyText}
      />
      <VSpacer size={16} />
      <View style={styles.rowStart}>
        <CheckboxLabel
          checked={props.playgroundState.doSignBody}
          onValueChange={props.onCheckBoxPress}
          label="Sign body"
        />
      </View>
      <VSpacer size={16} />
      <View style={styles.row}>
        <IOButton
          variant="solid"
          label={`Sign message${
            props.playgroundState.doSignBody ? " with body" : ""
          }`}
          disabled={!isMessageBodySet}
          onPress={() => props.onSignButtonPress(httpRequestBodyText)}
        />
        <HSpacer size={16} />
        <IOButton
          variant="outline"
          label={"Clear"}
          disabled={!isMessageBodySet}
          onPress={() => {
            setHttpRequestBodyText("");
            props.onClearButtonPress();
          }}
        />
      </View>
      <VSpacer size={16} />
      {props.playgroundState.isVerificationSuccess !== undefined && (
        <Alert
          variant={
            props.playgroundState.isVerificationSuccess ? "success" : "error"
          }
          content={props.playgroundState.verificationResult ?? ""}
        />
      )}
    </View>
  );
};

export default LollipopPlaygroundContent;
