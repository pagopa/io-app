import {
  ContentWrapper,
  FeatureInfo,
  ForceScrollDownView,
  H2,
  VStack
} from "@pagopa/io-app-design-system";
import IOMarkdown from "../../../../../components/IOMarkdown/index.tsx";
import { useHeaderSecondLevel } from "../../../../../hooks/useHeaderSecondLevel.tsx";
import I18n from "../../../../../i18n";
import { usePreventScreenCapture } from "../../../../../utils/hooks/usePreventScreenCapture.ts";
import { useAvoidHardwareBackButton } from "../../../../../utils/useAvoidHardwareBackButton.ts";
import { ItwDataExchangeIcons } from "../../../common/components/ItwDataExchangeIcons.tsx";
import { useItwDisableGestureNavigation } from "../../../common/hooks/useItwDisableGestureNavigation.ts";
import { ItwRemoteMachineContext } from "../machine/provider.tsx";
import {
  selectIsClaimsDisclosure,
  selectIsLoading,
  selectRelyingPartyData
} from "../machine/selectors.ts";
import { useIODispatch } from "../../../../../store/hooks.ts";
import { identificationRequest } from "../../../../identification/store/actions";
import { ItwRemoteLoadingScreen } from "../components/ItwRemoteLoadingScreen.tsx";
import { ItwRemotePresentationDetails } from "../components/ItwRemotePresentationDetails.tsx";

const ItwRemoteClaimsDisclosureScreen = () => {
  usePreventScreenCapture();
  useItwDisableGestureNavigation();
  useAvoidHardwareBackButton();

  const isLoading = ItwRemoteMachineContext.useSelector(selectIsLoading);
  const isClaimsDisclosure = ItwRemoteMachineContext.useSelector(
    selectIsClaimsDisclosure
  );

  /**
   * In addition to checking for the loading state,
   * we need to ensure that the current state is not `ClaimsDisclosure`
   * to prevent a visual glitch caused by a slight delay in navigation
   */
  if (isLoading || !isClaimsDisclosure) {
    return (
      <ItwRemoteLoadingScreen
        title={I18n.t(
          "features.itWallet.presentation.remote.loadingScreen.request"
        )}
      />
    );
  }

  return <ContentView />;
};

/**
 * The actual content of the screen, with the claims to disclose for the verifiable presentation.
 */
const ContentView = () => {
  const machineRef = ItwRemoteMachineContext.useActorRef();
  const rpData = ItwRemoteMachineContext.useSelector(selectRelyingPartyData);
  const dispatch = useIODispatch();

  const closePresentation = () => machineRef.send({ type: "close" });

  useHeaderSecondLevel({ title: "", goBack: closePresentation });

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
            onPress: confirmVerifiablePresentation
          },
          secondary: {
            label: I18n.t("global.buttons.cancel"),
            onPress: closePresentation
          }
        }
      }}
    >
      <ContentWrapper>
        <VStack space={24}>
          <ItwDataExchangeIcons
            requesterLogoUri={
              rpData?.logo_uri ? { uri: rpData.logo_uri } : undefined
            }
          />

          <VStack space={8}>
            <H2>
              {I18n.t(
                "features.itWallet.presentation.selectiveDisclosure.title"
              )}
            </H2>
            <IOMarkdown
              content={I18n.t(
                "features.itWallet.presentation.selectiveDisclosure.subtitle",
                { relyingParty: rpData?.organization_name }
              )}
            />
          </VStack>
          <ItwRemotePresentationDetails />
          <FeatureInfo
            iconName="fornitori"
            body={I18n.t(
              "features.itWallet.presentation.selectiveDisclosure.disclaimer.0"
            )}
          />
          <FeatureInfo
            iconName="trashcan"
            body={I18n.t(
              "features.itWallet.presentation.selectiveDisclosure.disclaimer.1"
            )}
          />
          <IOMarkdown
            content={I18n.t(
              "features.itWallet.presentation.selectiveDisclosure.tos",
              { privacyUrl: rpData?.policy_uri }
            )}
          />
        </VStack>
      </ContentWrapper>
    </ForceScrollDownView>
  );
};

export { ItwRemoteClaimsDisclosureScreen };
