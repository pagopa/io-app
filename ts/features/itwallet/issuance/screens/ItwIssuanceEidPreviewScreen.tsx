import { ContentWrapper } from "@pagopa/io-app-design-system";
import * as O from "fp-ts/lib/Option";
import { constNull, pipe } from "fp-ts/lib/function";
import React from "react";
import { IOScrollViewWithLargeHeader } from "../../../../components/ui/IOScrollViewWithLargeHeader";
import { useDebugInfo } from "../../../../hooks/useDebugInfo";
import I18n from "../../../../i18n";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { identificationRequest } from "../../../../store/actions/identification";
import { useIODispatch } from "../../../../store/hooks";
import { useAvoidHardwareBackButton } from "../../../../utils/useAvoidHardwareBackButton";
import { ItwCredentialClaimsList } from "../../common/components/ItwCredentialClaimList";
import { useItwDisbleGestureNavigation } from "../../common/hooks/useItwDisbleGestureNavigation";
import { useItwDismissalDialog } from "../../common/hooks/useItwDismissalDialog";
import { StoredCredential } from "../../common/utils/itwTypesUtils";
import { selectEidOption, selectIsLoading } from "../../machine/eid/selectors";
import { ItwEidIssuanceMachineContext } from "../../machine/provider";
import { ItwIssuanceLoadingScreen } from "../components/ItwIssuanceLoadingScreen";

export const ItwIssuanceEidPreviewScreen = () => {
  const isLoading = ItwEidIssuanceMachineContext.useSelector(selectIsLoading);
  const eidOption = ItwEidIssuanceMachineContext.useSelector(selectEidOption);

  useItwDisbleGestureNavigation();
  useAvoidHardwareBackButton();

  if (isLoading) {
    return <ItwIssuanceLoadingScreen />;
  }

  return pipe(
    eidOption,
    O.fold(constNull, eid => <ContentView eid={eid} />)
  );
};

type ContentViewProps = {
  eid: StoredCredential;
};

/**
 * Renders the content of the screen if the PID is decoded.
 * @param eid - the decoded eID
 */
const ContentView = ({ eid }: ContentViewProps) => {
  const machineRef = ItwEidIssuanceMachineContext.useActorRef();
  const dispatch = useIODispatch();
  const navigation = useIONavigation();

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: true
    });
  }, [navigation]);

  useDebugInfo({
    parsedCredential: eid.parsedCredential
  });

  const dismissDialog = useItwDismissalDialog(() =>
    machineRef.send({ type: "close" })
  );

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
