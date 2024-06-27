import { ContentWrapper } from "@pagopa/io-app-design-system";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import React from "react";
import { OperationResultScreenContent } from "../../../../components/screens/OperationResultScreenContent";
import { FooterActions } from "../../../../components/ui/FooterActions";
import { IOScrollViewWithLargeHeader } from "../../../../components/ui/IOScrollViewWithLargeHeader";
import I18n from "../../../../i18n";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import ROUTES from "../../../../navigation/routes";
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

export const ItwIssuanceCredentialPreviewScreen = () => {
  const navigation = useIONavigation();
  const dispatch = useIODispatch();
  const credentialOption = O.some(ItwCredentialsMocks.mdl);
  const dismissDialog = useItwDismissalDialog();

  const handleStoreCredentialSuccess = () => {
    navigation.reset({
      index: 1,
      routes: [
        {
          name: ROUTES.MAIN,
          params: {
            screen: ROUTES.WALLET_HOME
          }
        }
      ]
    });
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
          onSuccess: handleStoreCredentialSuccess
        }
      )
    );
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
        <ContentWrapper>
          <ItwCredentialClaimsList data={credential} isPreview={true} />
        </ContentWrapper>
        <FooterActions
          fixed={false}
          actions={{
            type: "TwoButtons",
            primary: {
              icon: "add",
              iconPosition: "end",
              label: I18n.t(
                "features.itWallet.issuance.credentialPreview.actions.primary"
              ),
              onPress: handleSaveToWallet
            },
            secondary: {
              label: I18n.t(
                "features.itWallet.issuance.credentialPreview.actions.secondary"
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
    credentialOption,
    O.fold(
      () => <ErrorView />,
      cred => <ContentView credential={cred} />
    )
  );
};
