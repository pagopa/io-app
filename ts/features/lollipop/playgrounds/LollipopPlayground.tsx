import * as O from "fp-ts/lib/Option";
import * as E from "fp-ts/lib/Either";
import { Content } from "native-base";
import React, { useCallback } from "react";
import { ProblemJson } from "@pagopa/ts-commons/lib/responses";
import { View, SafeAreaView, StyleSheet, TextInput } from "react-native";
import { HSpacer, VSpacer } from "../../../components/core/spacer/Spacer";
import BaseScreenComponent from "../../../components/screens/BaseScreenComponent";
import { maybeNotNullyString } from "../../../utils/strings";
import { IOStyles } from "../../../components/core/variables/IOStyles";
import ButtonSolid from "../../../components/ui/ButtonSolid";
import ButtonOutline from "../../../components/ui/ButtonOutline";
import { sessionTokenSelector } from "../../../store/reducers/authentication";
import { LollipopBackendClient, SignMessageResponse } from "../api/backend";
import { useIOSelector } from "../../../store/hooks";
import {
  lollipopKeyTagSelector,
  lollipopPublicKeySelector
} from "../store/reducers/lollipop";
import { toThumbprint } from "../utils/crypto";
import { DEFAULT_LOLLIPOP_HASH_ALGORITHM_SERVER } from "../utils/login";
import { apiUrlPrefix } from "../../../config";
import { CheckBox } from "../../../components/core/selection/checkbox/CheckBox";
import { Label } from "../../../components/core/typography/Label";
import { Alert } from "../../../components/Alert";

const styles = StyleSheet.create({
  textInput: {
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

const viewRef = React.createRef<View>();
const LollipopPlayground = () => {
  const [httpRequestBodyText, setHttpRequestBodyText] =
    React.useState<string>("");
  const [doSignBody, setDoSignBody] = React.useState<boolean>(true);
  const [isVerificationSuccess, setIsVerificationSuccess] = React.useState<
    boolean | undefined
  >(undefined);
  const [signResponse, setSignResponse] = React.useState<string>("");

  const keyTag = useIOSelector(lollipopKeyTagSelector);
  const maybePublicKey = useIOSelector(lollipopPublicKeySelector);
  const maybeSessionToken = O.fromNullable(useIOSelector(sessionTokenSelector));

  const lollipopClient =
    O.isSome(maybeSessionToken) && O.isSome(keyTag) && O.isSome(maybePublicKey)
      ? LollipopBackendClient(apiUrlPrefix, maybeSessionToken.value, {
          keyTag: keyTag.value,
          publicKey: maybePublicKey.value,
          publicKeyThumbprint: `${DEFAULT_LOLLIPOP_HASH_ALGORITHM_SERVER}-${toThumbprint(
            maybePublicKey
          )}`
        })
      : undefined;

  const onSignButtonPress = useCallback(
    async (body: string) => {
      if (lollipopClient) {
        const bodyMessage = {
          message: body
        };
        try {
          const signResponse = await lollipopClient.postSignMessage({
            nonce: "aNonce",
            signBody: doSignBody
          })(bodyMessage);
          if (E.isRight(signResponse)) {
            const status = signResponse.right.status;
            if (status !== 200) {
              const response = signResponse.right.value as ProblemJson;
              setIsVerificationSuccess(false);
              setSignResponse(`${status} - ${response.title}`);
            } else {
              const response = signResponse.right.value as SignMessageResponse;
              setIsVerificationSuccess(true);
              setSignResponse(response.response);
            }
          } else {
            setIsVerificationSuccess(false);
            setSignResponse(JSON.stringify(signResponse.left));
          }
        } catch (e) {
          setIsVerificationSuccess(false);
          setSignResponse(JSON.stringify(e));
        }
      }
    },
    [doSignBody, lollipopClient]
  );

  const isMessageBodySet = O.isSome(maybeNotNullyString(httpRequestBodyText));
  return (
    <BaseScreenComponent goBack={true} headerTitle={"Lollipop Playground"}>
      <SafeAreaView style={IOStyles.flex}>
        <Content contentContainerStyle={IOStyles.flex}>
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
              <CheckBox checked={doSignBody} onValueChange={setDoSignBody} />
              <HSpacer />
              <Label>{"Sign body"}</Label>
            </View>
            <VSpacer size={16} />
            <View style={styles.row}>
              <ButtonSolid
                accessibilityLabel="Sign body message"
                label={"Sign body message"}
                disabled={!isMessageBodySet}
                onPress={() => onSignButtonPress(httpRequestBodyText)}
              />
              <HSpacer size={16} />
              <ButtonOutline
                accessibilityLabel="Clear"
                label={"Clear"}
                disabled={!isMessageBodySet}
                onPress={() => {
                  setIsVerificationSuccess(undefined);
                  setHttpRequestBodyText("");
                }}
              />
            </View>
            <VSpacer size={16} />
            {isVerificationSuccess !== undefined && (
              <Alert
                viewRef={viewRef}
                variant={isVerificationSuccess ? "success" : "error"}
                content={signResponse}
              />
            )}
          </View>
        </Content>
      </SafeAreaView>
    </BaseScreenComponent>
  );
};

export default LollipopPlayground;
