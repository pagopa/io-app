import * as O from "fp-ts/lib/Option";
import * as E from "fp-ts/lib/Either";
import React, { useCallback } from "react";
import {
  View,
  SafeAreaView,
  StyleSheet,
  TextInput,
  ScrollView
} from "react-native";
import { HSpacer, VSpacer } from "../../../components/core/spacer/Spacer";
import BaseScreenComponent from "../../../components/screens/BaseScreenComponent";
import { maybeNotNullyString } from "../../../utils/strings";
import { IOStyles } from "../../../components/core/variables/IOStyles";
import { ContentWrapper } from "../../../components/core/ContentWrapper";
import ButtonSolid from "../../../components/ui/ButtonSolid";
import ButtonOutline from "../../../components/ui/ButtonOutline";
import { sessionTokenSelector } from "../../../store/reducers/authentication";
import { LollipopClient, createLollipopClient } from "../api/backend";
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
import { SignMessageResponse } from "../../../../definitions/lollipop/SignMessageResponse";
import { LollipopOriginalURL } from "../../../../definitions/lollipop/LollipopOriginalURL";
import { LollipopContentDigest } from "../../../../definitions/lollipop/LollipopContentDigest";
import { LollipopSignatureInput } from "../../../../definitions/lollipop/LollipopSignatureInput";
import { LollipopSignature } from "../../../../definitions/lollipop/LollipopSignature";
import { LollipopMethodEnum } from "../../../../definitions/lollipop/LollipopMethod";
import { ProblemJson } from "../../../../definitions/lollipop/ProblemJson";

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

type LollipopSignRequestBody = {
  message: string;
};
const signMessage = async (
  lollipopClient: LollipopClient,
  body: LollipopSignRequestBody,
  sessionToken: string
) =>
  await lollipopClient.signMessage({
    body,
    Bearer: `Bearer ${sessionToken}`,
    "x-pagopa-lollipop-original-method": LollipopMethodEnum.POST,
    "x-pagopa-lollipop-original-url": "" as LollipopOriginalURL,
    "content-digest": "" as LollipopContentDigest,
    "signature-input": "" as LollipopSignatureInput,
    signature: "" as LollipopSignature
  });

const LollipopPlayground = () => {
  const viewRef = React.createRef<View>();
  const [httpRequestBodyText, setHttpRequestBodyText] =
    React.useState<string>("");
  const [doSignBody, setDoSignBody] = React.useState<boolean>(true);
  const [isVerificationSuccess, setIsVerificationSuccess] = React.useState<
    boolean | undefined
  >(undefined);
  const [signResponse, setSignResponse] = React.useState<string>();

  const keyTag = useIOSelector(lollipopKeyTagSelector);
  const maybePublicKey = useIOSelector(lollipopPublicKeySelector);
  const maybeSessionToken = O.fromNullable(useIOSelector(sessionTokenSelector));

  const lollipopClient =
    O.isSome(keyTag) && O.isSome(maybePublicKey)
      ? createLollipopClient(
          apiUrlPrefix,
          {
            keyTag: keyTag.value,
            publicKey: maybePublicKey.value,
            publicKeyThumbprint: `${DEFAULT_LOLLIPOP_HASH_ALGORITHM_SERVER}-${toThumbprint(
              maybePublicKey
            )}`
          },
          { nonce: "aNonce", signBody: doSignBody }
        )
      : undefined;

  const onSignButtonPress = useCallback(
    async (body: string) => {
      if (O.isSome(maybeSessionToken) && lollipopClient) {
        const bodyMessage = {
          message: body
        };
        try {
          const signResponse = await signMessage(
            lollipopClient,
            bodyMessage,
            maybeSessionToken.value
          );
          if (E.isRight(signResponse)) {
            const status = signResponse.right.status;
            if (status !== 200) {
              const response = signResponse.right.value as ProblemJson;
              setIsVerificationSuccess(false);
              setSignResponse(
                `${status} - ${response.title}${
                  response.detail ? "\n" + response.detail : ""
                }`
              );
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
    [lollipopClient, maybeSessionToken]
  );

  const isMessageBodySet = O.isSome(maybeNotNullyString(httpRequestBodyText));
  return (
    <BaseScreenComponent goBack={true} headerTitle={"Lollipop Playground"}>
      <SafeAreaView style={IOStyles.flex}>
        <ScrollView>
          <ContentWrapper>
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
                  label={`Sign message${doSignBody ? " with body" : ""}`}
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
                  content={signResponse ?? ""}
                />
              )}
            </View>
          </ContentWrapper>
        </ScrollView>
      </SafeAreaView>
    </BaseScreenComponent>
  );
};

export default LollipopPlayground;
