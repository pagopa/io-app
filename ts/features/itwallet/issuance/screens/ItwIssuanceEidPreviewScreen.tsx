import { ContentWrapper } from "@pagopa/io-app-design-system";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import React from "react";
import { IOScrollViewWithLargeHeader } from "../../../../components/ui/IOScrollViewWithLargeHeader";
import { useDebugInfo } from "../../../../hooks/useDebugInfo";
import I18n from "../../../../i18n";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { identificationRequest } from "../../../../store/actions/identification";
import { useIODispatch } from "../../../../store/hooks";
import { useAvoidHardwareBackButton } from "../../../../utils/useAvoidHardwareBackButton";
import { ItwCredentialClaimsList } from "../../common/components/ItwCredentialClaimList";
import { ItwGenericErrorContent } from "../../common/components/ItwGenericErrorContent";
import { useItwDismissalDialog } from "../../common/hooks/useItwDismissalDialog";
import { StoredCredential } from "../../common/utils/itwTypesUtils";
import { selectEidOption } from "../../machine/eid/selectors";
import { ItwEidIssuanceMachineContext } from "../../machine/provider";

export const ItwIssuanceEidPreviewScreen = () => {
  const machineRef = ItwEidIssuanceMachineContext.useActorRef();
  const navigation = useIONavigation();
  const dispatch = useIODispatch();
  const eidOption = ItwEidIssuanceMachineContext.useSelector(selectEidOption);
  const dismissDialog = useItwDismissalDialog(() =>
    machineRef.send({ type: "close" })
  );

  useAvoidHardwareBackButton();

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

    useDebugInfo({
      parsedCredential: eid.parsedCredential
    });

    return (
      <IOScrollViewWithLargeHeader
        canGoback={false}
        title={{
          label: I18n.t("features.itWallet.issuance.eidPreview.title")
        }}
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
      >
        <ContentWrapper>
          <ItwCredentialClaimsList data={eid} isPreview={true} />
        </ContentWrapper>
      </IOScrollViewWithLargeHeader>
    );
  };

  return pipe(
    eidOption,
    O.fold(
      () => <ItwGenericErrorContent />,
      eid => <ContentView eid={eid} />
    )
  );
};
