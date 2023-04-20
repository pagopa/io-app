import * as O from "fp-ts/lib/Option";
import * as E from "fp-ts/lib/Either";
import React, { useCallback } from "react";
import { SafeAreaView, ScrollView } from "react-native";
import BaseScreenComponent from "../../../components/screens/BaseScreenComponent";
import { IOStyles } from "../../../components/core/variables/IOStyles";
import { ContentWrapper } from "../../../components/core/ContentWrapper";
import { sessionTokenSelector } from "../../../store/reducers/authentication";
import { createLollipopClient, signMessage } from "../api/backend";
import { useIOSelector } from "../../../store/hooks";
import {
  lollipopKeyTagSelector,
  lollipopPublicKeySelector
} from "../store/reducers/lollipop";
import { toThumbprint } from "../utils/crypto";
import { DEFAULT_LOLLIPOP_HASH_ALGORITHM_SERVER } from "../utils/login";
import { apiUrlPrefix } from "../../../config";
import { SignMessageResponse } from "../../../../definitions/lollipop/SignMessageResponse";
import { ProblemJson } from "../../../../definitions/lollipop/ProblemJson";
import LollipopPlaygroundContent from "./LollipopPlaygroundContent";

export type LollipopPlaygroundState = {
  doSignBody: boolean;
  isVerificationSuccess: boolean | undefined;
  signResponse: string | undefined;
};
const INITIAL_STATE = {
  doSignBody: true,
  isVerificationSuccess: undefined,
  signResponse: undefined
};

const LollipopPlayground = () => {
  const [state, setState] =
    React.useState<LollipopPlaygroundState>(INITIAL_STATE);

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
          { nonce: "aNonce", signBody: state.doSignBody }
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
              setState({
                ...state,
                isVerificationSuccess: false,
                signResponse: `${status} - ${response.title}${
                  response.detail ? "\n" + response.detail : ""
                }`
              });
            } else {
              const response = signResponse.right.value as SignMessageResponse;
              setState({
                ...state,
                isVerificationSuccess: true,
                signResponse: response.response
              });
            }
          } else {
            setState({
              ...state,
              isVerificationSuccess: false,
              signResponse: JSON.stringify(signResponse.left)
            });
          }
        } catch (e) {
          setState({
            ...state,
            isVerificationSuccess: false,
            signResponse: JSON.stringify(e)
          });
        }
      }
    },
    [lollipopClient, maybeSessionToken, state]
  );

  return (
    <BaseScreenComponent goBack={true} headerTitle={"Lollipop Playground"}>
      <SafeAreaView style={IOStyles.flex}>
        <ScrollView>
          <ContentWrapper>
            <LollipopPlaygroundContent
              onSignButtonPress={onSignButtonPress}
              onCheckBoxPress={v => {
                setState({
                  ...state,
                  doSignBody: v
                });
              }}
              onClearButtonPress={() => {
                setState(INITIAL_STATE);
              }}
              playgroundState={state}
            />
          </ContentWrapper>
        </ScrollView>
      </SafeAreaView>
    </BaseScreenComponent>
  );
};

export default LollipopPlayground;
