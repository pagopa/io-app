import {
  Body,
  ContentWrapper,
  FeatureInfo,
  ForceScrollDownView,
  H2,
  VStack
} from "@pagopa/io-app-design-system";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import { useHeaderSecondLevel } from "../../../../../hooks/useHeaderSecondLevel.tsx";
import I18n from "../../../../../i18n.ts";
import { usePreventScreenCapture } from "../../../../../utils/hooks/usePreventScreenCapture.ts";
import { useAvoidHardwareBackButton } from "../../../../../utils/useAvoidHardwareBackButton.ts";
import { useItwDismissalDialog } from "../../../common/hooks/useItwDismissalDialog.tsx";
import { useItwDisableGestureNavigation } from "../../../common/hooks/useItwDisableGestureNavigation.ts";
import { ItwProximityMachineContext } from "../machine/provider.tsx";
import { selectProximityDetails } from "../machine/selectors.ts";
import { ItwDataExchangeIcons } from "../../../common/components/ItwDataExchangeIcons.tsx";
import IOMarkdown from "../../../../../components/IOMarkdown/index.tsx";
import { useIOSelector } from "../../../../../store/hooks.ts";
import { generateDynamicUrlSelector } from "../../../../../store/reducers/backendStatus/remoteConfig.ts";
import { ITW_IPZS_PRIVACY_URL_BODY } from "../../../../../urls.ts";
import { ItwProximityPresentationDetails } from "../components/ItwProximityPresentationDetails.tsx";
import { ISSUER_MOCK_NAME } from "../../../common/utils/itwMocksUtils.ts";
import LoadingScreenContent from "../../../../../components/screens/LoadingScreenContent.tsx";
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
          contentTitle={I18n.t(
            "features.itWallet.presentation.proximity.loadingScreen.title"
          )}
        >
          <ContentWrapper style={{ alignItems: "center" }}>
            <Body>
              {I18n.t(
                "features.itWallet.presentation.proximity.loadingScreen.subtitle"
              )}
            </Body>
          </ContentWrapper>
        </LoadingScreenContent>
      ),
      proximityDetails => <ContentView proximityDetails={proximityDetails} />
    )
  );
};

type ContentViewProps = {
  proximityDetails: ProximityDetails;
};

const ContentView = ({ proximityDetails }: ContentViewProps) => {
  const machineRef = ItwProximityMachineContext.useActorRef();

  const privacyUrl = useIOSelector(state =>
    generateDynamicUrlSelector(state, "io_showcase", ITW_IPZS_PRIVACY_URL_BODY)
  );

  const dismissalDialog = useItwDismissalDialog({
    handleDismiss: () => machineRef.send({ type: "back" }),
    customBodyMessage: I18n.t(
      "features.itWallet.presentation.proximity.selectiveDisclosure.alert.message"
    )
  });

  useHeaderSecondLevel({ title: "", goBack: dismissalDialog.show });

  return (
    <ForceScrollDownView
      footerActions={{
        actions: {
          type: "TwoButtons",
          primary: {
            label: I18n.t("global.buttons.continue"),
            onPress: () => {
              // TODO: [SIW-2429]
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
