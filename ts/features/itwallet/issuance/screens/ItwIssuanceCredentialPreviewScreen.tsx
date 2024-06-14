import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import React from "react";
import { OperationResultScreenContent } from "../../../../components/screens/OperationResultScreenContent";
import { IOScrollViewWithLargeHeader } from "../../../../components/ui/IOScrollViewWithLargeHeader";
import I18n from "../../../../i18n";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import {
  ItWalletError,
  getItwGenericMappedError
} from "../../common/utils/itwErrorsUtils";
import { ItwCredentialsMocks } from "../../common/utils/itwMocksUtils";
import { StoredCredential } from "../../common/utils/itwTypesUtils";
import { ITW_ROUTES } from "../../navigation/routes";
import { ItwCredentialPreviewScreenContent } from "../components/ItwCredentialPreviewScreenContent";

export const ItwIssuanceCredentialPreviewScreen = () => {
  const navigation = useIONavigation();
  const credentialOption = O.some(ItwCredentialsMocks.mdl);

  const handleStoreCredentialSuccess = () => {
    navigation.navigate(ITW_ROUTES.MAIN, {
      screen: ITW_ROUTES.ISSUANCE.RESULT
    });
  };

  /**
   * Renders the content of the screen if the credential is decoded.
   * @param credential - the decoded credential
   */
  const ContentView = ({ credential }: { credential: StoredCredential }) => {
    React.useLayoutEffect(() => {
      navigation.setOptions({
        headerShown: true
      });
    }, []);

    return (
      <IOScrollViewWithLargeHeader
        excludeEndContentMargin
        title={{
          label: I18n.t("features.itWallet.issuance.credentialPreview.title", {
            credential: credential.displayData.title
          })
        }}
      >
        <ItwCredentialPreviewScreenContent
          data={credential}
          onStoreSuccess={handleStoreCredentialSuccess}
        />
      </IOScrollViewWithLargeHeader>
    );
  };

  /**
   * Error view component which currently displays a generic error.
   * @param error - optional ItWalletError to be displayed.
   */
  const ErrorView = ({ error: _ }: { error?: ItWalletError }) => {
    const mappedError = getItwGenericMappedError(() => navigation.goBack());
    return <OperationResultScreenContent {...mappedError} />;
  };

  return pipe(
    credentialOption,
    O.fold(
      () => <ErrorView />,
      cred => <ContentView credential={cred} />
    )
  );
};
