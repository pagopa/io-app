import { ContentWrapper } from "@pagopa/io-app-design-system";
import * as E from "fp-ts/lib/Either";
import * as O from "fp-ts/lib/Option";
import { useCallback, useState } from "react";
import { ScrollView } from "react-native";
import { ProblemJson } from "../../../../definitions/backend/identity/ProblemJson";
import { SignMessageResponse } from "../../../../definitions/backend/identity/SignMessageResponse";
import { apiUrlPrefix } from "../../../config";
import { useHeaderSecondLevel } from "../../../hooks/useHeaderSecondLevel";
import { useIOSelector } from "../../../store/hooks";
import { sessionTokenSelector } from "../../authentication/common/store/selectors";
import {
  lollipopKeyTagSelector,
  lollipopPublicKeySelector
} from "../store/reducers/lollipop";
import { toThumbprint } from "../utils/crypto";
import { identityClientManager } from "../../../api/IdentityClientManager";
import { LollipopOriginalURL } from "../../../../definitions/backend/identity/LollipopOriginalURL";
import { LollipopContentDigest } from "../../../../definitions/backend/identity/LollipopContentDigest";
import { LollipopSignatureInput } from "../../../../definitions/backend/identity/LollipopSignatureInput";
import { LollipopSignature } from "../../../../definitions/backend/identity/LollipopSignature";
import { LollipopMethodEnum } from "../../../../definitions/backend/identity/LollipopMethod";
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
  const maybeSessionToken = useIOSelector(sessionTokenSelector);

  useHeaderSecondLevel({
    title: "Lollipop Playground"
  });

  const onSignButtonPress = useCallback(
    async (body: string) => {
      const bodyMessage = {
        message: body
      };
      if (maybeSessionToken && O.isSome(maybePublicKey) && O.isSome(keyTag)) {
        const { signMessage } = identityClientManager.getClient(
          apiUrlPrefix,
          maybeSessionToken,
          {
            keyTag: keyTag.value,
            publicKey: maybePublicKey.value,
            publicKeyThumbprint: toThumbprint(maybePublicKey)
          },
          state.doSignBody
        );

        signMessage({
          body: bodyMessage,
          "x-pagopa-lollipop-original-method": LollipopMethodEnum.POST,
          "x-pagopa-lollipop-original-url": "" as LollipopOriginalURL,
          "content-digest": "" as LollipopContentDigest,
          "signature-input": "" as LollipopSignatureInput,
          signature: "" as LollipopSignature
        })
          .then(signResponse => {
            if (E.isRight(signResponse)) {
              const res = signResponse.right;
              const status = res.status;
              if (status !== 200) {
                const response = res.value as ProblemJson;
                setState(s => ({
                  ...s,
                  isVerificationSuccess: false,
                  verificationResult: `${status} - ${response.title}\n${response.detail}`
                }));
              } else {
                const response =
                  res.value as SignMessageResponse;
                setState(s => ({
                  ...s,
                  isVerificationSuccess: true,
                  verificationResult: response.response
                }));
              }
            } else {
              setState(s => ({
                ...s,
                isVerificationSuccess: false,
                verificationResult: JSON.stringify(signResponse.left)
              }));
            }
          }).catch(e =>
            setState(s => ({
              ...s,
              isVerificationSuccess: false,
              verificationResult: `${e}`
            })));
      }
    },
    [maybeSessionToken, maybePublicKey, keyTag, state.doSignBody]
  );

  return (
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
  );
};

export default LollipopPlayground;
