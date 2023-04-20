import * as O from "fp-ts/lib/Option";
import React from "react";
import { View, StyleSheet, TextInput } from "react-native";
import ButtonSolid from "../../../components/ui/ButtonSolid";
import ButtonOutline from "../../../components/ui/ButtonOutline";
import { CheckBox } from "../../../components/core/selection/checkbox/CheckBox";
import { Label } from "../../../components/core/typography/Label";
import { Alert } from "../../../components/Alert";
import { HSpacer, VSpacer } from "../../../components/core/spacer/Spacer";
import { maybeNotNullyString } from "../../../utils/strings";
import { WithTestID } from "../../../types/WithTestID";
import { LollipopPlaygroundState } from "./LollipopPlayground";

const styles = StyleSheet.create({
  textInput: {
    textAlignVertical: "top",
    padding: 10,
    borderWidth: 1,
    height: 120,
    borderRadius: 4
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
  const viewRef = React.createRef<View>();
  const [httpRequestBodyText, setHttpRequestBodyText] =
    React.useState<string>("");

  const isMessageBodySet = O.isSome(maybeNotNullyString(httpRequestBodyText));

  return (
    <View style={styles.column}>
      <TextInput
        multiline={true}
        placeholder={"paste here your body message"}
        style={styles.textInput}
        onChangeText={setHttpRequestBodyText}
        value={httpRequestBodyText}
      />
      <VSpacer size={16} />
      <View style={styles.rowStart}>
        <CheckBox
          checked={props.playgroundState.doSignBody}
          onValueChange={props.onCheckBoxPress}
        />
        <HSpacer />
        <Label>{"Sign body"}</Label>
      </View>
      <VSpacer size={16} />
      <View style={styles.row}>
        <ButtonSolid
          accessibilityLabel="Sign body message"
          label={`Sign message${
            props.playgroundState.doSignBody ? " with body" : ""
          }`}
          disabled={!isMessageBodySet}
          onPress={() => props.onSignButtonPress(httpRequestBodyText)}
        />
        <HSpacer size={16} />
        <ButtonOutline
          accessibilityLabel="Clear"
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
          viewRef={viewRef}
          variant={
            props.playgroundState.isVerificationSuccess ? "success" : "error"
          }
          content={props.playgroundState.signResponse ?? ""}
        />
      )}
    </View>
  );
};

export default LollipopPlaygroundContent;
