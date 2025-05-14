import { ContentWrapper } from "@pagopa/io-app-design-system";
import * as E from "fp-ts/lib/Either";
import * as O from "fp-ts/lib/Option";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/function";
import { useCallback, useState } from "react";
import { SafeAreaView, ScrollView } from "react-native";
import { ProblemJson } from "../../../../definitions/lollipop/ProblemJson";
import { SignMessageResponse } from "../../../../definitions/lollipop/SignMessageResponse";
import { apiUrlPrefix } from "../../../config";
import { useHeaderSecondLevel } from "../../../hooks/useHeaderSecondLevel";
import { useIOSelector } from "../../../store/hooks";
import { sessionTokenSelector } from "../../authentication/common/store/selectors";
import { createLollipopClient, signMessage } from "../api/backend";
import {
  lollipopKeyTagSelector,
  lollipopPublicKeySelector
} from "../store/reducers/lollipop";
import { toThumbprint } from "../utils/crypto";
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
  const [state, setState] = useState<LollipopPlaygroundState>(INITIAL_STATE);

  const keyTag = useIOSelector(lollipopKeyTagSelector);
  const maybePublicKey = useIOSelector(lollipopPublicKeySelector);
  const maybeSessionToken = O.fromNullable(useIOSelector(sessionTokenSelector));

  useHeaderSecondLevel({
    title: "Lollipop Playground"
  });

  const lollipopClient = useCallback(
    (signBody: boolean) =>
      pipe(
        keyTag,
        O.chain(keyTag =>
          pipe(
            maybePublicKey,
            O.chainNullableK(publicKey =>
              createLollipopClient(
                apiUrlPrefix,
                {
                  keyTag,
                  publicKey,
                  publicKeyThumbprint: toThumbprint(maybePublicKey)
                },
                { nonce: "aNonce", signBody }
              )
            )
          )
        )
      ),
    [keyTag, maybePublicKey]
  );

  const onSignButtonPress = useCallback(
    async (body: string, signBody: boolean) => {
      const bodyMessage = {
        message: body
      };
      pipe(
        maybeSessionToken,
        O.chain(sessionToken =>
          pipe(
            lollipopClient(signBody),
            O.chainNullableK(lollipopClient =>
              pipe(
                TE.tryCatch(
                  () => signMessage(lollipopClient, bodyMessage, sessionToken),
                  e =>
                    setState(s => ({
                      ...s,
                      isVerificationSuccess: false,
                      verificationResult: `${e}`
                    }))
                ),
                TE.map(_ =>
                  pipe(
                    _,
                    E.mapLeft(error =>
                      setState(s => ({
                        ...s,
                        isVerificationSuccess: false,
                        verificationResult: JSON.stringify(error)
                      }))
                    ),
                    E.map(signResponse => {
                      const status = signResponse.status;
                      if (status !== 200) {
                        const response = signResponse.value as ProblemJson;
                        setState(s => ({
                          ...s,
                          isVerificationSuccess: false,
                          verificationResult: `${status} - ${response.title}\n${response.detail}`
                        }));
                      } else {
                        const response =
                          signResponse.value as SignMessageResponse;
                        setState(s => ({
                          ...s,
                          isVerificationSuccess: true,
                          verificationResult: response.response
                        }));
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
    [lollipopClient, maybeSessionToken]
  );

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView>
        <ContentWrapper>
          <LollipopPlaygroundContent
            onSignButtonPress={body =>
              onSignButtonPress(body, state.doSignBody)
            }
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
  );
};

export default LollipopPlayground;
