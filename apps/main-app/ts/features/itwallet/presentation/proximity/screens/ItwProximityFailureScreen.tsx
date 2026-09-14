import { Body, FooterActions, VSpacer } from "@io-app/design-system";
import I18n from "i18next";

import {
  OperationResultScreenContent,
  OperationResultScreenContentProps
} from "../../../../../components/screens/OperationResultScreenContent.tsx";
import { useDebugInfo } from "../../../../../hooks/useDebugInfo.ts";
import { useIOSelector } from "../../../../../store/hooks.ts";
import { generateDynamicUrlSelector } from "../../../../../store/reducers/backendStatus/remoteConfig.ts";
import { DOCUMENTS_ON_IO_FAQ_12_URL_BODY } from "../../../../../urls.ts";
import { isDefined } from "../../../../../utils/guards.ts";
import { useIOBottomSheetModal } from "../../../../../utils/hooks/bottomSheet.tsx";
import { openWebUrl } from "../../../../../utils/url.ts";
import { useAvoidHardwareBackButton } from "../../../../../utils/useAvoidHardwareBackButton.ts";
import { useItwDisableGestureNavigation } from "../../../common/hooks/useItwDisableGestureNavigation.ts";
import { serializeFailureReason } from "../../../common/utils/itwStoreUtils.ts";
import { itwCredentialTypeFromDocTypeSelector } from "../../../credentialsCatalogue/store/selectors/index.ts";
import { ItwPresentationMissingCredentialsFailureContent } from "../../common/components/ItwPresentationMissingCredentialsFailureContent.tsx";
import { trackItwProximityRpNotTrustedBottomSheet } from "../analytics/index.ts";
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
  const getCredentialTypeFromDocType = useIOSelector(
    itwCredentialTypeFromDocTypeSelector
  );
  const faqUrl = useIOSelector(state =>
    generateDynamicUrlSelector(
      state,
      "io_showcase",
      DOCUMENTS_ON_IO_FAQ_12_URL_BODY
    )
  );

  useDebugInfo({
    failure: serializeFailureReason(failure)
  });

  useItwProximityEventsTracking({
    failure,
    getCredentialTypeFromDocType
  });

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
    ),
    footer: (
      <FooterActions
        actions={{
          type: "SingleButton",
          primary: {
            label: I18n.t("global.buttons.findOutMore"),
            onPress: () => openWebUrl(faqUrl)
          }
        }}
      />
    )
  });

  const getOperationResultScreenContentProps =
    (): OperationResultScreenContentProps => {
      switch (failure.type) {
        case ProximityFailureType.CONSENT_DENIED:
          return {
            title: I18n.t(
              "features.itWallet.presentation.proximity.consentDenied.title"
            ),
            subtitle: I18n.t(
              "features.itWallet.presentation.proximity.consentDenied.subtitle"
            ),
            pictogram: "accessDenied",
            action: {
              label: I18n.t("global.buttons.close"),
              onPress: () => machineRef.send({ type: "close" })
            }
          };
        case ProximityFailureType.RELYING_PARTY_GENERIC:
          return {
            title: I18n.t(
              "features.itWallet.presentation.proximity.relyingParty.genericError.title"
            ),
            subtitle: I18n.t(
              "features.itWallet.presentation.proximity.relyingParty.genericError.subtitle"
            ),
            pictogram: "umbrella",
            action: {
              label: I18n.t(
                "features.itWallet.presentation.proximity.relyingParty.genericError.primaryAction"
              ),
              onPress: () => machineRef.send({ type: "close" })
            }
          };
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
                trackItwProximityRpNotTrustedBottomSheet();
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
        missingCredentials={failure.reason.credentialsDocType
          .map(getCredentialTypeFromDocType)
          .filter(isDefined)}
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
