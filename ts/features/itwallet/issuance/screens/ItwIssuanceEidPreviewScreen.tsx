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
import { ItWalletIssuanceMachineContext } from "../../machine/provider";
import { ItwCredentialPreviewScreenContent } from "../components/ItwCredentialPreviewScreenContent";

export const ItwIssuanceEidPreviewScreen = () => {
  const navigation = useIONavigation();
  const machineRef = ItWalletIssuanceMachineContext.useActorRef();
  const eidOption = O.some(ItwCredentialsMocks.eid);

  const handleStoreCredentialSuccess = () => {
    machineRef.send({ type: "add-to-wallet" });
  };

  /**
   * Renders the content of the screen if the PID is decoded.
   * @param eid - the decoded eID
   */
  const ContentView = ({ eid }: { eid: StoredCredential }) => {
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
            credential: eid.displayData.title
          })
        }}
      >
        <ItwCredentialPreviewScreenContent
          data={eid}
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
    eidOption,
    O.fold(
      () => <ErrorView />,
      eid => <ContentView eid={eid} />
    )
  );
};
