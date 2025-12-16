import {
  ContentWrapper,
  FeatureInfo,
  ForceScrollDownView,
  H2,
  VStack
} from "@pagopa/io-app-design-system";
import { useFocusEffect } from "@react-navigation/native";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import I18n from "i18next";
import IOMarkdown from "../../../../../components/IOMarkdown/index.tsx";
import LoadingScreenContent from "../../../../../components/screens/LoadingScreenContent.tsx";
import { useHeaderSecondLevel } from "../../../../../hooks/useHeaderSecondLevel.tsx";
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
import {
  trackItwProximityContinuePresentation,
  trackItwProximityDataShare
} from "../analytics";
import { ITW_PROXIMITY_SCREENVIEW_EVENTS } from "../analytics/enum";
import { ItwProximityPresentationDetails } from "../components/ItwProximityPresentationDetails.tsx";
import { ItwProximityMachineContext } from "../machine/provider.tsx";
import { selectProximityDetails } from "../machine/selectors.ts";
import { ProximityDetails } from "../utils/itwProximityTypeUtils.ts";

export const ItwProximityClaimsDisclosureScreen = () => {
  const proximityDetails = ItwProximityMachineContext.useSelector(
    selectProximityDetails
  );

  usePreventScreenCapture();
  useItwDisableGestureNavigation();
  useAvoidHardwareBackButton();

  return pipe(
    proximityDetails,
    O.fromNullable,
    O.fold(
      // If proximityDetails is not present in the context, we can safely assume that the loading phase is still in progress.
      // An undefined proximityDetails cannot be stored in the context, as any failure causes the machine to transition
      // to the Failure state.
      () => (
        <LoadingScreenContent
          title={I18n.t(
            "features.itWallet.presentation.proximity.loadingScreen.title"
          )}
          subtitle={I18n.t(
            "features.itWallet.presentation.proximity.loadingScreen.subtitle"
          )}
        />
      ),
      details => <ContentView proximityDetails={details} />
    )
  );
};

type ContentViewProps = {
  proximityDetails: ProximityDetails;
};

const ContentView = ({ proximityDetails }: ContentViewProps) => {
  const machineRef = ItwProximityMachineContext.useActorRef();
  const dispatch = useIODispatch();

  const privacyUrl = useIOSelector(state =>
    generateDynamicUrlSelector(state, "io_showcase", ITW_IPZS_PRIVACY_URL_BODY)
  );

  useFocusEffect(trackItwProximityDataShare);

  const dismissalDialog = useItwDismissalDialog({
    handleDismiss: () => machineRef.send({ type: "back" }),
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

  useHeaderSecondLevel({ title: "", goBack: dismissalDialog.show });

  const confirmVerifiablePresentation = () =>
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

  return (
    <ForceScrollDownView
      footerActions={{
        actions: {
          type: "TwoButtons",
          primary: {
            label: I18n.t("global.buttons.continue"),
            onPress: () => {
              trackItwProximityContinuePresentation();
              confirmVerifiablePresentation();
            }
          },
          secondary: {
            label: I18n.t("global.buttons.cancel"),
            onPress: dismissalDialog.show
          }
        }
      }}
    >
      <ContentWrapper>
        <VStack space={24}>
          <ItwDataExchangeIcons
            requesterLogoUri={require("../../../../../../img/features/itWallet/issuer/IPZS.png")}
          />
          <VStack space={8}>
            <H2>
              {I18n.t(
                "features.itWallet.presentation.proximity.selectiveDisclosure.title"
              )}
            </H2>
            <IOMarkdown
              content={I18n.t(
                "features.itWallet.presentation.proximity.selectiveDisclosure.subtitle",
                { relyingParty: ISSUER_MOCK_NAME }
              )}
            />
          </VStack>
          <ItwProximityPresentationDetails data={proximityDetails} />
          <FeatureInfo
            iconName="fornitori"
            body={I18n.t(
              "features.itWallet.presentation.proximity.selectiveDisclosure.disclaimer.0"
            )}
          />
          <FeatureInfo
            iconName="trashcan"
            body={I18n.t(
              "features.itWallet.presentation.proximity.selectiveDisclosure.disclaimer.1"
            )}
          />
          <IOMarkdown
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
