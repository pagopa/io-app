import * as O from "fp-ts/lib/Option";
import { constNull, pipe } from "fp-ts/lib/function";
import I18n from "i18next";
import { Body, VSpacer } from "@pagopa/io-app-design-system";
import { ItwProximityMachineContext } from "../machine/provider.tsx";
import { selectFailureOption } from "../machine/selectors.ts";
import { useItwDisableGestureNavigation } from "../../../common/hooks/useItwDisableGestureNavigation.ts";
import { useAvoidHardwareBackButton } from "../../../../../utils/useAvoidHardwareBackButton.ts";
import { ProximityFailure, ProximityFailureType } from "../machine/failure.ts";
import { useDebugInfo } from "../../../../../hooks/useDebugInfo.ts";
import { serializeFailureReason } from "../../../common/utils/itwStoreUtils.ts";
import {
  OperationResultScreenContent,
  OperationResultScreenContentProps
} from "../../../../../components/screens/OperationResultScreenContent.tsx";
import { useIOBottomSheetModal } from "../../../../../utils/hooks/bottomSheet.tsx";
import { useItwProximityEventsTracking } from "../hooks/useItwProximityEventsTracking";
import { trackItwProximityUnofficialVerifierBottomSheet } from "../analytics/index.ts";

export const ItwProximityFailureScreen = () => {
  const failureOption =
    ItwProximityMachineContext.useSelector(selectFailureOption);

  useItwDisableGestureNavigation();
  useAvoidHardwareBackButton();

  return pipe(
    failureOption,
    O.fold(constNull, failure => <ContentView failure={failure} />)
  );
};

type ContentViewProps = { failure: ProximityFailure };

const ContentView = ({ failure }: ContentViewProps) => {
  const machineRef = ItwProximityMachineContext.useActorRef();
  const i18nNs = "features.itWallet.presentation.proximity"; // Common i18n namespace

  useDebugInfo({
    failure: serializeFailureReason(failure)
  });

  const { bottomSheet, present } = useIOBottomSheetModal({
    component: (
      <>
        <Body>
          {I18n.t(`${i18nNs}.relyingParty.untrustedRp.bottomSheet.content`)}
        </Body>
        <VSpacer size={24} />
      </>
    ),
    title: I18n.t(`${i18nNs}.relyingParty.untrustedRp.bottomSheet.title`)
  });

  const getOperationResultScreenContentProps =
    (): OperationResultScreenContentProps => {
      switch (failure.type) {
        case ProximityFailureType.RELYING_PARTY_GENERIC:
          return {
            title: I18n.t(`${i18nNs}.relyingParty.genericError.title`),
            subtitle: I18n.t(`${i18nNs}.relyingParty.genericError.subtitle`),
            pictogram: "umbrella",
            action: {
              label: I18n.t(
                `${i18nNs}.relyingParty.genericError.primaryAction`
              ),
              onPress: () => machineRef.send({ type: "close" })
            }
          };
        case ProximityFailureType.TIMEOUT:
          return {
            title: I18n.t(`${i18nNs}.relyingParty.timeout.title`),
            subtitle: I18n.t(`${i18nNs}.relyingParty.timeout.subtitle`),
            pictogram: "umbrella",
            action: {
              label: I18n.t(`${i18nNs}.relyingParty.timeout.primaryAction`),
              onPress: () => machineRef.send({ type: "close" })
            }
          };
        case ProximityFailureType.UNEXPECTED:
          return {
            title: I18n.t("features.itWallet.generic.error.title"),
            subtitle: I18n.t("features.itWallet.generic.error.body"),
            pictogram: "workInProgress",
            action: {
              label: I18n.t("global.buttons.close"),
              onPress: () => machineRef.send({ type: "close" })
            }
          };
        case ProximityFailureType.UNTRUSTED_RP:
          return {
            title: I18n.t(`${i18nNs}.relyingParty.untrustedRp.title`),
            subtitle: I18n.t(`${i18nNs}.relyingParty.untrustedRp.subtitle`),
            pictogram: "stopSecurity",
            action: {
              label: I18n.t(`${i18nNs}.relyingParty.untrustedRp.primaryAction`),
              onPress: () => machineRef.send({ type: "close" })
            },
            secondaryAction: {
              label: I18n.t(
                `${i18nNs}.relyingParty.untrustedRp.secondaryAction`
              ),
              onPress: () => {
                trackItwProximityUnofficialVerifierBottomSheet();
                present();
              }
            }
          };
      }
    };

  useItwProximityEventsTracking({ failure });

  const resultScreenProps = getOperationResultScreenContentProps();

  return (
    <>
      <OperationResultScreenContent
        {...resultScreenProps}
        subtitleProps={{ textBreakStrategy: "simple" }}
      />
      {bottomSheet}
    </>
  );
};
