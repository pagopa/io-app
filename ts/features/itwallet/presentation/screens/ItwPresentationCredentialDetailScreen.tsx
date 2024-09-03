import * as O from "fp-ts/Option";
import { pipe } from "fp-ts/lib/function";
import React from "react";
import { OperationResultScreenContent } from "../../../../components/screens/OperationResultScreenContent";
import {
  IOStackNavigationRouteProps,
  useIONavigation
} from "../../../../navigation/params/AppParamsList";
import { useIOSelector } from "../../../../store/hooks";
import {
  ItWalletError,
  getItwGenericMappedError
} from "../../common/utils/itwErrorsUtils";
import { itwCredentialByTypeSelector } from "../../credentials/store/selectors";
import { ItwParamsList } from "../../navigation/ItwParamsList";
import { ItwPresentationScreenContent } from "../components/ItwPresentationScreenContent";

export type ItwPresentationCredentialDetailNavigationParams = {
  credentialType: string;
};

type Props = IOStackNavigationRouteProps<
  ItwParamsList,
  "ITW_PRESENTATION_CREDENTIAL_DETAIL"
>;

export const ItwPresentationCredentialDetailScreen = ({ route }: Props) => {
  const { credentialType } = route.params;
  const credentialOption = useIOSelector(
    itwCredentialByTypeSelector(credentialType)
  );

  return pipe(
    credentialOption,
    O.fold(
      () => <ErrorView />,
      credential => <ItwPresentationScreenContent credential={credential} />
    )
  );
};

/**
 * Error view component which currently displays a generic error.
 * @param error - optional ItWalletError to be displayed.
 */
const ErrorView = ({ error: _ }: { error?: ItWalletError }) => {
  const navigation = useIONavigation();
  const mappedError = getItwGenericMappedError(() => navigation.goBack());
  return <OperationResultScreenContent {...mappedError} />;
};
