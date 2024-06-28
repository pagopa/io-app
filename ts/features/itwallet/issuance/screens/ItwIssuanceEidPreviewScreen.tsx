import { ContentWrapper } from "@pagopa/io-app-design-system";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import React from "react";
import { OperationResultScreenContent } from "../../../../components/screens/OperationResultScreenContent";
import { FooterActions } from "../../../../components/ui/FooterActions";
import { IOScrollViewWithLargeHeader } from "../../../../components/ui/IOScrollViewWithLargeHeader";
import I18n from "../../../../i18n";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { identificationRequest } from "../../../../store/actions/identification";
import { useIODispatch } from "../../../../store/hooks";
import { ItwCredentialClaimsList } from "../../common/components/ItwCredentialClaimList";
import { useItwDismissalDialog } from "../../common/hooks/useItwDismissalDialog";
import {
  ItWalletError,
  getItwGenericMappedError
} from "../../common/utils/itwErrorsUtils";
import { ItwCredentialsMocks } from "../../common/utils/itwMocksUtils";
import { StoredCredential } from "../../common/utils/itwTypesUtils";
import { ItwEidIssuanceMachineContext } from "../../machine/provider";

export const ItwIssuanceEidPreviewScreen = () => {
  const navigation = useIONavigation();
  const dispatch = useIODispatch();
  const machineRef = ItwEidIssuanceMachineContext.useActorRef();
  const eidOption = O.some(ItwCredentialsMocks.eid);
  const dismissDialog = useItwDismissalDialog();

  const handleStoreEidSuccess = () => {
    machineRef.send({ type: "add-to-wallet" });
  };

  const handleSaveToWallet = () => {
    dispatch(
      identificationRequest(
        false,
        true,
        undefined,
        {
          label: I18n.t("global.buttons.cancel"),
          onCancel: () => undefined
        },
        {
          onSuccess: handleStoreEidSuccess
        }
      )
    );
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
          label: I18n.t("features.itWallet.issuance.eidPreview.title", {
            credential: eid.displayData.title
          })
        }}
      >
        <ContentWrapper>
          <ItwCredentialClaimsList data={eid} isPreview={true} />
        </ContentWrapper>
        <FooterActions
          fixed={false}
          actions={{
            type: "TwoButtons",
            primary: {
              label: I18n.t(
                "features.itWallet.issuance.eidPreview.actions.primary"
              ),
              onPress: handleSaveToWallet
            },
            secondary: {
              label: I18n.t(
                "features.itWallet.issuance.eidPreview.actions.secondary"
              ),
              onPress: dismissDialog.show
            }
          }}
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
