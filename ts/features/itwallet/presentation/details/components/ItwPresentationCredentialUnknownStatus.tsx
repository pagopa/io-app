import I18n from "i18next";
import { useEffect, useRef, useState } from "react";
import * as O from "fp-ts/lib/Option";
import { OperationResultScreenContent } from "../../../../../components/screens/OperationResultScreenContent.tsx";
import { useHeaderSecondLevel } from "../../../../../hooks/useHeaderSecondLevel.tsx";
import { useIONavigation } from "../../../../../navigation/params/AppParamsList.ts";
import { getCredentialNameFromType } from "../../../common/utils/itwCredentialUtils.ts";
import { StoredCredential } from "../../../common/utils/itwTypesUtils.ts";
import { useIODispatch } from "../../../../../store/hooks.ts";
import { ItwCredentialIssuanceMachineContext } from "../../../machine/credential/provider.tsx";
import {
  selectCredentialTypeOption,
  selectIsLoading
} from "../../../machine/credential/selectors.ts";
import { itwCredentialsRefreshStatusByType } from "../../../credentials/store/actions/index.ts";
import LoadingScreenContent from "../../../../../components/screens/LoadingScreenContent.tsx";

type Props = {
  credential: StoredCredential;
};

/**
 * Rendered when it is not possible to determine the status of a credential,
 * i.e. the API call to fetch the status assertion from the issuer failed.
 */
export const ItwPresentationCredentialUnknownStatus = ({
  credential
}: Props) => {
  const [isRetrying, setIsRetrying] = useState(false);
  const [isRetryComplete, setIsRetryComplete] = useState(false);

  const dispatch = useIODispatch();
  const machineRef = ItwCredentialIssuanceMachineContext.useActorRef();
  const isMachineLoading =
    ItwCredentialIssuanceMachineContext.useSelector(selectIsLoading);
  const credentialType = O.toUndefined(
    ItwCredentialIssuanceMachineContext.useSelector(selectCredentialTypeOption)
  );

  const navigation = useIONavigation();
  const credentialName = getCredentialNameFromType(credential.credentialType);
  const previousAssertionRef = useRef(credential.storedStatusAssertion);

  useHeaderSecondLevel({
    title: "",
    headerShown: false
  });

  useEffect(() => {
    if (
      isRetrying &&
      previousAssertionRef.current !== credential.storedStatusAssertion
    ) {
      setIsRetryComplete(true);
      setIsRetrying(false);
      // eslint-disable-next-line functional/immutable-data
      previousAssertionRef.current = credential.storedStatusAssertion;
    }
  }, [credential.storedStatusAssertion, isRetrying]);

  const isLoaderVisible =
    isRetrying ||
    (isMachineLoading && credentialType === credential.credentialType);

  if (isLoaderVisible) {
    return <LoadingScreenContent title={I18n.t("global.genericWaiting")} />;
  }

  // If the retry is complete and we are in this component,
  // it means the credential is still in an unknown status.
  if (isRetryComplete) {
    return (
      <OperationResultScreenContent
        pictogram="umbrella"
        title={I18n.t(
          "features.itWallet.presentation.statusAssertionUnknown.retryFailure.title"
        )}
        subtitle={I18n.t(
          "features.itWallet.presentation.statusAssertionUnknown.retryFailure.content",
          { credentialName }
        )}
        action={{
          label: I18n.t(
            "features.itWallet.presentation.statusAssertionUnknown.retryFailure.primaryAction"
          ),
          onPress: () => {
            machineRef.send({
              type: "select-credential",
              mode: "issuance",
              credentialType: credential.credentialType
            });
          }
        }}
        secondaryAction={{
          label: I18n.t("global.buttons.close"),
          onPress: () => navigation.goBack()
        }}
      />
    );
  }

  // Try to get a new status assertion.
  return (
    <OperationResultScreenContent
      pictogram="cardIssue"
      title={I18n.t(
        "features.itWallet.presentation.statusAssertionUnknown.title",
        { credentialName }
      )}
      subtitle={I18n.t(
        "features.itWallet.presentation.statusAssertionUnknown.content"
      )}
      action={{
        label: I18n.t("global.genericRetry"),
        onPress: () => {
          setIsRetrying(true);
          dispatch(
            itwCredentialsRefreshStatusByType(credential.credentialType)
          );
        }
      }}
      secondaryAction={{
        label: I18n.t("global.buttons.close"),
        onPress: () => navigation.goBack()
      }}
    />
  );
};
