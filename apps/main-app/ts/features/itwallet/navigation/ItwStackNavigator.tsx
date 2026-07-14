import { createStackNavigator } from "@react-navigation/stack";
import { ComponentType, memo } from "react";

import { useIOSelector } from "../../../store/hooks";
import { isGestureEnabled } from "../../../utils/navigation";
import { ItwGenericErrorContent } from "../common/components/ItwGenericErrorContent";
import { isItwEnabledSelector } from "../common/store/selectors/remoteConfig";
import { ItwDiscoveryInfoFallbackComponent } from "../discovery/components/ItwDiscoveryInfoFallbackComponent.tsx";
import { ItwAlreadyActiveScreen } from "../discovery/screens/ItwAlreadyActiveScreen.tsx";
import { ItwDiscoveryInfoScreen } from "../discovery/screens/ItwDiscoveryInfoScreen";
import { ItwDiscoveryLandingScreen } from "../discovery/screens/ItwDiscoveryLandingScreen.tsx";
import ItwIpzsPrivacyScreen from "../discovery/screens/ItwIpzsPrivacyScreen";
import { ItwActivateNfcScreen } from "../identification/cie/screens/ItwActivateNfcScreen.tsx";
import { ItwCieAuthenticationScreen } from "../identification/cie/screens/ItwCieAuthenticationScreen.tsx";
import { ItwCieCanScreen } from "../identification/cie/screens/ItwCieCanScreen.tsx";
import { ItwCieInternalAuthAndMrtdScreen } from "../identification/cie/screens/ItwCieInternalAuthAndMrtdScreen.tsx";
import { ItwCiePinScreen } from "../identification/cie/screens/ItwCiePinScreen.tsx";
import { ItwCiePreparationCanScreen } from "../identification/cie/screens/ItwCiePreparationCanScreen.tsx";
import { ItwCiePreparationCardScreen } from "../identification/cie/screens/ItwCiePreparationCardScreen.tsx";
import { ItwCiePreparationNfcScreen } from "../identification/cie/screens/ItwCiePreparationNfcScreen.tsx";
import { ItwCiePreparationPinScreen } from "../identification/cie/screens/ItwCiePreparationPinScreen.tsx";
import { ItwIdentificationCieWarningScreen } from "../identification/cie/screens/ItwIdentificationCieWarningScreen.tsx";
import ItwCieIdLoginScreen from "../identification/cieId/screens/ItwCieIdLoginScreen.tsx";
import { ItwIdentificationModeSelectionScreen } from "../identification/common/screens/ItwIdentificationModeSelectionScreen.tsx";
import { ItwIdentificationIdpSelectionScreen } from "../identification/spid/screens/ItwIdentificationIdpSelectionScreen.tsx";
import ItwSpidIdpLoginScreen from "../identification/spid/screens/ItwSpidIdpLoginScreen.tsx";
import { ItwIssuanceCredentialAsyncContinuationScreen } from "../issuance/screens/ItwIssuanceCredentialAsyncContinuationScreen";
import { ItwIssuanceCredentialFailureScreen } from "../issuance/screens/ItwIssuanceCredentialFailureScreen";
import { ItwIssuanceCredentialIntroductionScreen } from "../issuance/screens/ItwIssuanceCredentialIntroductionScreen";
import { ItwIssuanceCredentialLandingScreen } from "../issuance/screens/ItwIssuanceCredentialLandingScreen";
import { ItwIssuanceCredentialPreviewScreen } from "../issuance/screens/ItwIssuanceCredentialPreviewScreen";
import { ItwIssuanceCredentialTrustIssuerScreen } from "../issuance/screens/ItwIssuanceCredentialTrustIssuerScreen";
import { ItwIssuanceEidFailureScreen } from "../issuance/screens/ItwIssuanceEidFailureScreen";
import { ItwIssuanceEidPreviewScreen } from "../issuance/screens/ItwIssuanceEidPreviewScreen";
import { ItwIssuanceEidReissuanceLandingScreen } from "../issuance/screens/ItwIssuanceEidReissuanceLandingScreen";
import { ItwIssuanceEidResultScreen } from "../issuance/screens/ItwIssuanceEidResultScreen";
import { ItwIssuanceUpcomingCredentialScreen } from "../issuance/screens/ItwIssuanceUpcomingCredentialScreen";
import { ItwIdentityNotMatchingScreen } from "../lifecycle/screens/ItwIdentityNotMatchingScreen.tsx";
import { ItwLifecycleWalletRevocationScreen } from "../lifecycle/screens/ItwLifecycleWalletRevocationScreen.tsx";
import {
  ItwCredentialIssuanceMachineContext,
  ItwCredentialIssuanceMachineProvider
} from "../machine/credential/provider";
import {
  ItwEidIssuanceMachineContext,
  ItwEidIssuanceMachineProvider
} from "../machine/eid/provider";
import { ItwIssuanceCredentialOfferIntroScreen } from "../offer/screens/ItwIssuanceCredentialOfferIntro.tsx";
import { ItwCardOnboardingL2Screen } from "../onboarding/screens/ItwCardOnboardingL2Screen.tsx";
import { ItwCardOnboardingL3Screen } from "../onboarding/screens/ItwCardOnboardingL3Screen.tsx";
import { WalletCardOnboardingScreen } from "../onboarding/screens/WalletCardOnboardingScreen";
import { ItwL3CredentialDetailScreen } from "../playgrounds/screens/ItwL3CredentialDetailScreen.tsx";
import ItwPlayground from "../playgrounds/screens/ItwPlayground.tsx";
import { ItwProximityPlaygroundScreen } from "../playgrounds/screens/ItwProximityPlaygroundScreen.tsx";
import { ItwPresentationCredentialAttachmentScreen } from "../presentation/details/screens/ItwPresentationCredentialAttachmentScreen";
import { ItwPresentationCredentialCardModal } from "../presentation/details/screens/ItwPresentationCredentialCardModal";
import { ItwPresentationCredentialDetailScreen } from "../presentation/details/screens/ItwPresentationCredentialDetailScreen";
import { ItwPresentationCredentialFiscalCodeModal } from "../presentation/details/screens/ItwPresentationCredentialFiscalCodeModal";
import { ItwPresentationEidVerificationExpiredScreen } from "../presentation/details/screens/ItwPresentationEidVerificationExpiredScreen";
import { ItwPresentationPidDetailScreen } from "../presentation/details/screens/ItwPresentationPidDetailScreen.tsx";
import { ItwSettingsScreen } from "../settings/screens/ItwSettingsScreen.tsx";
import { ItwCredentialTrustmarkScreen } from "../trustmark/screens/ItwCredentialTrustmarkScreen";
import { ItwOfflineWalletScreen } from "../wallet/screens/ItwOfflineWalletScreen";
import { ItwParamsList } from "./ItwParamsList";
import { ITW_ROUTES } from "./routes";

const Stack = createStackNavigator<ItwParamsList>();

const hiddenHeader = { headerShown: false };

export const ItwStackNavigator = () => (
  <ItwEidIssuanceMachineProvider>
    <ItwCredentialIssuanceMachineProvider>
      <InnerNavigator />
    </ItwCredentialIssuanceMachineProvider>
  </ItwEidIssuanceMachineProvider>
);

const InnerNavigator = memo(() => {
  const eidIssuanceMachineRef = ItwEidIssuanceMachineContext.useActorRef();
  const credentialIssuanceMachineRef =
    ItwCredentialIssuanceMachineContext.useActorRef();

  return (
    <Stack.Navigator
      initialRouteName={ITW_ROUTES.OFFLINE.WALLET}
      screenListeners={{
        beforeRemove: () => {
          // Read more on https://reactnavigation.org/docs/preventing-going-back/
          // Whenever we have a back navigation action we send a "back" event to the machine.
          // Since the back event is accepted only by specific states, we can safely send a back event to each machine
          eidIssuanceMachineRef.send({ type: "back" });
          credentialIssuanceMachineRef.send({ type: "back" });
        }
      }}
      screenOptions={{ gestureEnabled: isGestureEnabled, headerMode: "screen" }}
    >
      <Stack.Screen
        component={WalletCardOnboardingScreen}
        name={ITW_ROUTES.ONBOARDING}
      />
      <Stack.Screen
        component={ItwCardOnboardingL3Screen}
        name={ITW_ROUTES.L3_ONBOARDING}
      />
      <Stack.Screen
        component={ItwCardOnboardingL2Screen}
        name={ITW_ROUTES.L2_ONBOARDING}
      />
      <Stack.Screen
        component={ItwOfflineWalletScreen}
        name={ITW_ROUTES.OFFLINE.WALLET}
        options={{
          gestureEnabled: isGestureEnabled,
          headerShown: false
        }}
      />
      {/* Landing screens from deep links */}
      <Stack.Screen
        component={ItwDiscoveryLandingScreen}
        name={ITW_ROUTES.LANDING.DISCOVERY}
        options={hiddenHeader}
      />
      <Stack.Screen
        component={ItwIssuanceCredentialLandingScreen}
        name={ITW_ROUTES.LANDING.CREDENTIAL_ISSUANCE}
        options={hiddenHeader}
      />
      <Stack.Screen
        component={withItwEnabled(ItwIssuanceCredentialAsyncContinuationScreen)}
        name={ITW_ROUTES.LANDING.CREDENTIAL_ASYNC_FLOW_CONTINUATION}
        options={hiddenHeader}
      />
      <Stack.Screen
        component={withItwEnabled(ItwIssuanceEidReissuanceLandingScreen)}
        name={ITW_ROUTES.LANDING.EID_REISSUANCE}
        options={hiddenHeader}
      />
      {/* DISCOVERY */}
      <Stack.Screen
        component={withItwEnabled(ItwDiscoveryInfoScreen)}
        name={ITW_ROUTES.DISCOVERY.INFO}
        options={({ route }) => ({
          ...hiddenHeader,
          animationEnabled: route.params?.animationEnabled
        })}
      />
      <Stack.Screen
        component={ItwIpzsPrivacyScreen}
        name={ITW_ROUTES.DISCOVERY.IPZS_PRIVACY}
      />
      <Stack.Screen
        component={withItwEnabled(ItwAlreadyActiveScreen)}
        name={ITW_ROUTES.DISCOVERY.ALREADY_ACTIVE_SCREEN}
        options={{ ...hiddenHeader, animationEnabled: false }}
      />
      {/* IDENTIFICATION */}
      <Stack.Screen
        component={ItwIdentificationModeSelectionScreen}
        name={ITW_ROUTES.IDENTIFICATION.MODE_SELECTION}
        options={({ route }) => ({
          animationEnabled: route.params.animationEnabled
        })}
      />
      <Stack.Screen
        component={ItwIdentificationCieWarningScreen}
        name={ITW_ROUTES.IDENTIFICATION.CIE_WARNING}
      />
      <Stack.Screen
        component={ItwIdentificationIdpSelectionScreen}
        name={ITW_ROUTES.IDENTIFICATION.IDP_SELECTION}
      />
      <Stack.Screen
        component={ItwSpidIdpLoginScreen}
        name={ITW_ROUTES.IDENTIFICATION.SPID.LOGIN}
      />
      <Stack.Screen
        component={ItwCieIdLoginScreen}
        name={ITW_ROUTES.IDENTIFICATION.CIE_ID.LOGIN}
      />
      {/* IDENTIFICATION CIE */}
      <Stack.Screen
        component={ItwCiePreparationPinScreen}
        name={ITW_ROUTES.IDENTIFICATION.CIE.PREPARATION.PIN_SCREEN}
      />
      <Stack.Screen
        component={ItwCiePreparationNfcScreen}
        name={ITW_ROUTES.IDENTIFICATION.CIE.PREPARATION.NFC_SCREEN}
      />
      <Stack.Screen
        component={ItwCiePreparationCanScreen}
        name={ITW_ROUTES.IDENTIFICATION.CIE.PREPARATION.CAN_SCREEN}
      />
      <Stack.Screen
        component={ItwCiePreparationCardScreen}
        name={ITW_ROUTES.IDENTIFICATION.CIE.PREPARATION.CARD_SCREEN}
      />
      <Stack.Screen
        component={ItwCiePinScreen}
        name={ITW_ROUTES.IDENTIFICATION.CIE.PIN_SCREEN}
      />
      <Stack.Screen
        component={ItwCieCanScreen}
        name={ITW_ROUTES.IDENTIFICATION.CIE.CAN_SCREEN}
      />
      <Stack.Screen
        component={ItwCieAuthenticationScreen}
        name={ITW_ROUTES.IDENTIFICATION.CIE.AUTH_SCREEN}
        options={hiddenHeader}
      />
      <Stack.Screen
        component={ItwCieInternalAuthAndMrtdScreen}
        name={ITW_ROUTES.IDENTIFICATION.CIE.INTERNAL_AUTH_MRTD_SCREEN}
        options={hiddenHeader}
      />
      <Stack.Screen
        component={ItwActivateNfcScreen}
        name={ITW_ROUTES.IDENTIFICATION.CIE.ACTIVATE_NFC}
      />
      {/* ISSUANCE */}
      <Stack.Screen
        component={ItwIssuanceEidPreviewScreen}
        name={ITW_ROUTES.ISSUANCE.EID_PREVIEW}
        options={hiddenHeader}
      />
      <Stack.Screen
        component={ItwIssuanceCredentialIntroductionScreen}
        name={ITW_ROUTES.ISSUANCE.CREDENTIAL_INTRODUCTION}
        options={hiddenHeader}
      />
      <Stack.Screen
        component={ItwIssuanceCredentialTrustIssuerScreen}
        name={ITW_ROUTES.ISSUANCE.CREDENTIAL_TRUST_ISSUER}
        options={({ route }) => ({
          ...hiddenHeader,
          animationEnabled: route.params?.animationEnabled
        })}
      />
      <Stack.Screen
        component={ItwIssuanceCredentialPreviewScreen}
        name={ITW_ROUTES.ISSUANCE.CREDENTIAL_PREVIEW}
        options={hiddenHeader}
      />
      <Stack.Screen
        component={ItwIssuanceCredentialFailureScreen}
        name={ITW_ROUTES.ISSUANCE.CREDENTIAL_FAILURE}
        options={hiddenHeader}
      />
      <Stack.Screen
        component={ItwIssuanceEidResultScreen}
        name={ITW_ROUTES.ISSUANCE.EID_RESULT}
        options={hiddenHeader}
      />
      <Stack.Screen
        component={ItwIssuanceEidFailureScreen}
        name={ITW_ROUTES.ISSUANCE.EID_FAILURE}
        options={{ headerShown: false, gestureEnabled: false }}
        /* gestureEnabled to false prevents going back to the loading screen, just go back to the home screen when swiping back.
         * TODO: [SIW-1375] better retry and go back handling logic for the issuance process
         */
      />
      <Stack.Screen
        component={ItwIssuanceUpcomingCredentialScreen}
        name={ITW_ROUTES.ISSUANCE.UPCOMING_CREDENTIAL}
        options={hiddenHeader}
      />
      <Stack.Screen
        component={ItwIssuanceCredentialOfferIntroScreen}
        name={ITW_ROUTES.ISSUANCE.CREDENTIAL_OFFER_INTRO}
        options={hiddenHeader}
      />
      {/* CREDENTIAL PRESENTATION */}
      <Stack.Screen
        component={ItwPresentationCredentialDetailScreen}
        name={ITW_ROUTES.PRESENTATION.CREDENTIAL_DETAIL}
        options={hiddenHeader}
      />
      <Stack.Screen
        component={ItwPresentationCredentialAttachmentScreen}
        name={ITW_ROUTES.PRESENTATION.CREDENTIAL_ATTACHMENT}
      />
      <Stack.Screen
        component={ItwPresentationCredentialCardModal}
        name={ITW_ROUTES.PRESENTATION.CREDENTIAL_CARD_MODAL}
        options={{
          gestureEnabled: false,
          presentation: "transparentModal"
        }}
      />
      <Stack.Screen
        component={ItwCredentialTrustmarkScreen}
        name={ITW_ROUTES.PRESENTATION.CREDENTIAL_TRUSTMARK}
      />
      <Stack.Screen
        component={ItwPresentationCredentialFiscalCodeModal}
        name={ITW_ROUTES.PRESENTATION.CREDENTIAL_FISCAL_CODE_MODAL}
      />
      <Stack.Screen
        component={ItwPresentationPidDetailScreen}
        name={ITW_ROUTES.PRESENTATION.PID_DETAIL}
      />
      {/* LIFECYCLE */}
      <Stack.Screen
        component={ItwIdentityNotMatchingScreen}
        name={ITW_ROUTES.IDENTITY_NOT_MATCHING_SCREEN}
        options={{ gestureEnabled: false }}
      />
      <Stack.Screen
        component={ItwLifecycleWalletRevocationScreen}
        name={ITW_ROUTES.WALLET_REVOCATION_SCREEN}
        options={{ headerShown: false, gestureEnabled: false }}
      />
      <Stack.Screen
        component={ItwPresentationEidVerificationExpiredScreen}
        name={ITW_ROUTES.PRESENTATION.EID_VERIFICATION_EXPIRED}
        options={{ headerShown: false }}
      />
      {/* Playground's routes */}
      <Stack.Group screenOptions={hiddenHeader}>
        <Stack.Screen
          component={ItwPlayground}
          name={ITW_ROUTES.PLAYGROUNDS.LANDING}
        />
        <Stack.Screen
          component={ItwL3CredentialDetailScreen}
          name={ITW_ROUTES.PLAYGROUNDS.CREDENTIAL_DETAIL}
        />
        <Stack.Screen
          component={ItwDiscoveryInfoFallbackComponent}
          name={ITW_ROUTES.PLAYGROUNDS.DISCOVERY_INFO_NEW}
        />
        <Stack.Screen
          component={ItwProximityPlaygroundScreen}
          name={ITW_ROUTES.PLAYGROUNDS.ISO_18013_PROXIMITY}
        />
      </Stack.Group>
      <Stack.Screen component={ItwSettingsScreen} name={ITW_ROUTES.SETTINGS} />
    </Stack.Navigator>
  );
});

/**
 * A higher-order component which renders the screen only if IT Wallet is enabled.
 * In case IT Wallet is not enabled, it renders an error screen.
 * @param Screen - The screen to render
 * @returns The component or the error screen
 */
const withItwEnabled =
  <P extends Record<string, unknown>>(Screen: ComponentType<P>) =>
  (props: P) => {
    const isItwEnabled = useIOSelector(isItwEnabledSelector);
    return isItwEnabled ? <Screen {...props} /> : <ItwGenericErrorContent />;
  };
