import {
  ContentWrapper,
  ForceScrollDownView,
  H2,
  HeaderSecondLevel,
  IOMarkdownLite,
  VStack
} from "@pagopa/io-app-design-system";
import I18n from "i18next";
import { useLayoutEffect } from "react";
import { useIONavigation } from "../../../../../navigation/params/AppParamsList.ts";
import { useIODispatch, useIOSelector } from "../../../../../store/hooks.ts";
import { generateDynamicUrlSelector } from "../../../../../store/reducers/backendStatus/remoteConfig.ts";
import { ITW_IPZS_PRIVACY_URL_BODY } from "../../../../../urls.ts";
import { usePreventScreenCapture } from "../../../../../utils/hooks/usePreventScreenCapture.ts";
import { useAvoidHardwareBackButton } from "../../../../../utils/useAvoidHardwareBackButton.ts";
import { identificationRequest } from "../../../../identification/store/actions";
import { ItwDataExchangeIcons } from "../../../common/components/ItwDataExchangeIcons.tsx";
import { useItwDisableGestureNavigation } from "../../../common/hooks/useItwDisableGestureNavigation.ts";
import { useItwDismissalDialog } from "../../../common/hooks/useItwDismissalDialog.tsx";
import { ISSUER_MOCK_NAME } from "../../../common/utils/itwMocksUtils.ts";
import { trackItwProximityContinuePresentation } from "../analytics";
import { ITW_PROXIMITY_SCREENVIEW_EVENTS } from "../analytics/enum";
import { ItwProximityConnectionLoadingComponent } from "../components/ItwProximityConnectionLoadingComponent.tsx";
import { ItwProximityPresentationDetails } from "../components/ItwProximityPresentationDetails.tsx";
import { ItwProximitySendLoadingComponent } from "../components/ItwProximitySendLoadingComponent.tsx";
import { ItwProximityMachineContext } from "../machine/provider.tsx";
import {
  selectIsLoading,
  selectIsNfcRetrieval,
  selectIsSending,
  selectProximityDetails
} from "../machine/selectors.ts";
import { ProximityDetails } from "../utils/types.ts";

export const ItwProximityClaimsDisclosureScreen = () => {
  const isLoading = ItwProximityMachineContext.useSelector(selectIsLoading);
  const isSending = ItwProximityMachineContext.useSelector(selectIsSending);

  const proximityDetails = ItwProximityMachineContext.useSelector(
    selectProximityDetails
  );

  usePreventScreenCapture();
  useItwDisableGestureNavigation();
  useAvoidHardwareBackButton();

  if (isSending) {
    return <ItwProximitySendLoadingComponent />;
  }

  if (!proximityDetails || isLoading) {
    return <ItwProximityConnectionLoadingComponent />;
  }

  return <ContentView proximityDetails={proximityDetails} />;
};

type ContentViewProps = {
  proximityDetails: ProximityDetails;
};

const ContentView = ({ proximityDetails }: ContentViewProps) => {
  const navigation = useIONavigation();
  const dispatch = useIODispatch();

  const machineRef = ItwProximityMachineContext.useActorRef();
  const isNfcRetrieval =
    ItwProximityMachineContext.useSelector(selectIsNfcRetrieval);

  const privacyUrl = useIOSelector(state =>
    generateDynamicUrlSelector(state, "io_showcase", ITW_IPZS_PRIVACY_URL_BODY)
  );

  const dismissalDialog = useItwDismissalDialog({
    handleDismiss: () => machineRef.send({ type: "close" }),
    customLabels: {
      body: I18n.t(
        "features.itWallet.presentation.proximity.selectiveDisclosure.alert.message"
      )
    },
    dismissalContext: {
      screen_name: ITW_PROXIMITY_SCREENVIEW_EVENTS.ITW_PROXIMITY_DATA_SHARE,
      itw_flow: "L3"
    }
  });

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: true,
      header: () => (
        <HeaderSecondLevel
          title={""}
          type="singleAction"
          firstAction={{
            icon: "closeLarge",
            accessibilityLabel: I18n.t("global.buttons.close"),
            onPress: dismissalDialog.show
          }}
        />
      )
    });
  }, [navigation, machineRef, dismissalDialog]);

  const handleConfirm = () => {
    trackItwProximityContinuePresentation();

    if (isNfcRetrieval) {
      // For NFC retrieval, identification request is dispatched in the next screen
      machineRef.send({ type: "holder-consent" });
      return;
    }

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
          onSuccess: () => machineRef.send({ type: "holder-consent" })
        }
      )
    );
  };

  return (
    <ForceScrollDownView
      footerActions={{
        actions: {
          type: "SingleButton",
          primary: {
            label: I18n.t("global.buttons.confirm"),
            onPress: handleConfirm
          }
        }
      }}
    >
      <ContentWrapper>
        <VStack space={24}>
          <ItwDataExchangeIcons
            requesterLogoUri={require("../../../../../../img/features/itWallet/issuer/IPZS.png")}
          />
          <VStack space={16}>
            <H2>
              {I18n.t(
                "features.itWallet.presentation.proximity.selectiveDisclosure.title"
              )}
            </H2>
            <IOMarkdownLite
              content={I18n.t(
                "features.itWallet.presentation.proximity.selectiveDisclosure.subtitle",
                { relyingParty: ISSUER_MOCK_NAME }
              )}
            />
          </VStack>
          <ItwProximityPresentationDetails data={proximityDetails} />
          <IOMarkdownLite
            content={I18n.t(
              "features.itWallet.presentation.proximity.selectiveDisclosure.tos",
              { privacyUrl }
            )}
          />
        </VStack>
      </ContentWrapper>
    </ForceScrollDownView>
  );
};
