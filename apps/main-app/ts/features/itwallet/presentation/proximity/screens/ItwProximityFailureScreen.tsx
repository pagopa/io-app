import { Body, VSpacer } from "@pagopa/io-app-design-system";
import I18n from "i18next";

import {
  OperationResultScreenContent,
  OperationResultScreenContentProps
} from "../../../../../components/screens/OperationResultScreenContent.tsx";
import { useDebugInfo } from "../../../../../hooks/useDebugInfo.ts";
import { useIOBottomSheetModal } from "../../../../../utils/hooks/bottomSheet.tsx";
import { useAvoidHardwareBackButton } from "../../../../../utils/useAvoidHardwareBackButton.ts";
import { useItwDisableGestureNavigation } from "../../../common/hooks/useItwDisableGestureNavigation.ts";
import { serializeFailureReason } from "../../../common/utils/itwStoreUtils.ts";
import { ItwPresentationMissingCredentialsFailureContent } from "../../common/components/ItwPresentatioMissingCredentialsFailureContent.tsx";
import { trackItwProximityUnofficialVerifierBottomSheet } from "../analytics/index.ts";
import { useItwProximityEventsTracking } from "../hooks/useItwProximityEventsTracking";
import { ProximityFailure, ProximityFailureType } from "../machine/failure.ts";
import { ItwProximityMachineContext } from "../machine/provider.tsx";
import { selectFailure } from "../machine/selectors.ts";

export const ItwProximityFailureScreen = () => {
  const failure = ItwProximityMachineContext.useSelector(selectFailure);

  useItwDisableGestureNavigation();
  useAvoidHardwareBackButton();

  return !!failure && <ContentView failure={failure} />;
};

type ContentViewProps = { failure: ProximityFailure };

const ContentView = ({ failure }: ContentViewProps) => {
  const machineRef = ItwProximityMachineContext.useActorRef();

  useDebugInfo({
    failure: serializeFailureReason(failure)
  });

  useItwProximityEventsTracking({ failure });

  const { bottomSheet, present } = useIOBottomSheetModal({
    component: (
      <>
        <Body>
          {I18n.t(
            "features.itWallet.presentation.proximity.relyingParty.untrustedRp.bottomSheet.content"
          )}
        </Body>
        <VSpacer size={24} />
      </>
    ),
    title: I18n.t(
      "features.itWallet.presentation.proximity.relyingParty.untrustedRp.bottomSheet.title"
    )
  });

  const getOperationResultScreenContentProps =
    (): OperationResultScreenContentProps => {
      switch (failure.type) {
        case ProximityFailureType.TIMEOUT:
          return {
            title: I18n.t(
              "features.itWallet.presentation.proximity.relyingParty.timeout.title"
            ),
            subtitle: I18n.t(
              "features.itWallet.presentation.proximity.relyingParty.timeout.subtitle"
            ),
            pictogram: "umbrella",
            action: {
              label: I18n.t(
                "features.itWallet.presentation.proximity.relyingParty.timeout.primaryAction"
              ),
              onPress: () => machineRef.send({ type: "close" })
            }
          };
        case ProximityFailureType.UNTRUSTED_RP:
          return {
            title: I18n.t(
              "features.itWallet.presentation.proximity.relyingParty.untrustedRp.title"
            ),
            subtitle: I18n.t(
              "features.itWallet.presentation.proximity.relyingParty.untrustedRp.subtitle"
            ),
            pictogram: "stopSecurity",
            action: {
              label: I18n.t(
                "features.itWallet.presentation.proximity.relyingParty.untrustedRp.primaryAction"
              ),
              onPress: () => machineRef.send({ type: "close" })
            },
            secondaryAction: {
              label: I18n.t(
                "features.itWallet.presentation.proximity.relyingParty.untrustedRp.secondaryAction"
              ),
              onPress: () => {
                trackItwProximityUnofficialVerifierBottomSheet();
                present();
              }
            }
          };
        case ProximityFailureType.UNEXPECTED:
        default:
          return {
            title: I18n.t("features.itWallet.generic.error.title"),
            subtitle: I18n.t("features.itWallet.generic.error.body"),
            pictogram: "workInProgress",
            action: {
              label: I18n.t("global.buttons.close"),
              onPress: () => machineRef.send({ type: "close" })
            }
          };
      }
    };

  const resultScreenProps = getOperationResultScreenContentProps();

  if (failure.type === ProximityFailureType.MISSING_CREDENTIALS) {
    return (
      <ItwPresentationMissingCredentialsFailureContent
        credentialTypes={failure.reason.credentialTypes}
        onClose={() => machineRef.send({ type: "close" })}
      />
    );
  }

  return (
    <>
      <OperationResultScreenContent {...resultScreenProps} />
      {bottomSheet}
    </>
  );
};
