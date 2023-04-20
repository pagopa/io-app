import * as O from "fp-ts/lib/Option";
import * as E from "fp-ts/lib/Either";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/function";
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
  verificationResult: string | undefined;
};
const INITIAL_STATE = {
  doSignBody: true,
  isVerificationSuccess: undefined,
  verificationResult: undefined
};

const LollipopPlayground = () => {
  const [state, setState] =
    React.useState<LollipopPlaygroundState>(INITIAL_STATE);

  const keyTag = useIOSelector(lollipopKeyTagSelector);
  const maybePublicKey = useIOSelector(lollipopPublicKeySelector);
  const maybeSessionToken = O.fromNullable(useIOSelector(sessionTokenSelector));

  const lollipopClient = pipe(
    keyTag,
    O.fold(
      () => {
        setState({
          ...state,
          isVerificationSuccess: false,
          verificationResult: "No key tag"
        });
        return undefined;
      },
      keyTag =>
        pipe(
          maybePublicKey,
          O.fold(
            () => {
              setState({
                ...state,
                isVerificationSuccess: false,
                verificationResult: "No public key"
              });
              return undefined;
            },
            publicKey =>
              createLollipopClient(
                apiUrlPrefix,
                {
                  keyTag,
                  publicKey,
                  publicKeyThumbprint: `${DEFAULT_LOLLIPOP_HASH_ALGORITHM_SERVER}-${toThumbprint(
                    maybePublicKey
                  )}`
                },
                { nonce: "aNonce", signBody: state.doSignBody }
              )
          )
        )
    )
  );

  const onSignButtonPress = useCallback(
    async (body: string) => {
      const bodyMessage = {
        message: body
      };
      pipe(
        maybeSessionToken,
        O.fold(
          () =>
            setState({
              ...state,
              isVerificationSuccess: false,
              verificationResult: "No session token"
            }),
          sessionToken =>
            pipe(
              lollipopClient,
              O.fromNullable,
              O.fold(
                () =>
                  setState({
                    ...state,
                    isVerificationSuccess: false,
                    verificationResult: "Lollipop client non available"
                  }),
                lollipopClient =>
                  pipe(
                    TE.tryCatch(
                      () =>
                        signMessage(lollipopClient, bodyMessage, sessionToken),
                      _ => _ as Error
                    ),
                    TE.mapLeft(e =>
                      setState({
                        ...state,
                        isVerificationSuccess: false,
                        verificationResult: JSON.stringify(e)
                      })
                    ),
                    TE.map(_ =>
                      pipe(
                        _,
                        E.mapLeft(error =>
                          setState({
                            ...state,
                            isVerificationSuccess: false,
                            verificationResult: JSON.stringify(error)
                          })
                        ),
                        E.map(signResponse => {
                          const status = signResponse.status;
                          if (status !== 200) {
                            const response = signResponse.value as ProblemJson;
                            setState({
                              ...state,
                              isVerificationSuccess: false,
                              verificationResult: `${status} - ${response.title}\n${response.detail}`
                            });
                          } else {
                            const response =
                              signResponse.value as SignMessageResponse;
                            setState({
                              ...state,
                              isVerificationSuccess: true,
                              verificationResult: response.response
                            });
                          }
                        })
                      )
                    )
                  )()
              )
            )
        )
      );
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
