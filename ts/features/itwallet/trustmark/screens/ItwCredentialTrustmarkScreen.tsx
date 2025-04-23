import { Body, ContentWrapper, VStack } from "@pagopa/io-app-design-system";
import { IOScrollViewWithLargeHeader } from "../../../../components/ui/IOScrollViewWithLargeHeader";
import I18n from "../../../../i18n";
import { IOStackNavigationRouteProps } from "../../../../navigation/params/AppParamsList";
import { useMaxBrightness } from "../../../../utils/brightness";
import { getCredentialNameFromType } from "../../common/utils/itwCredentialUtils";
import { ItwParamsList } from "../../navigation/ItwParamsList";
import { ItwTrustmarkExpirationTimer } from "../components/ItwTrustmarkExpirationTimer";
import { ItwTrustmarkQrCode } from "../components/ItwTrustmarkQrCode";
import { ItwTrustmarkMachineProvider } from "../machine/provider";
import { usePreventScreenCapture } from "../../../../utils/hooks/usePreventScreenCapture";
import { withOfflineFailureScreen } from "../../wallet/utils/withOfflineFailureScreen.tsx";

export type ItwCredentialTrustmarkScreenNavigationParams = {
  credentialType: string;
};

type ScreenProps = IOStackNavigationRouteProps<
  ItwParamsList,
  "ITW_PRESENTATION_CREDENTIAL_TRUSTMARK"
>;

const ItwCredentialTrustmarkScreenComponent = (params: ScreenProps) => {
  const { credentialType } = params.route.params;

  usePreventScreenCapture();
  useMaxBrightness({ useSmoothTransition: true });

  return (
    <ItwTrustmarkMachineProvider credentialType={credentialType}>
      <IOScrollViewWithLargeHeader
        title={{
          label: getCredentialNameFromType(credentialType)
        }}
        headerActionsProp={{ showHelp: true }}
      >
        <ContentWrapper>
          <VStack space={24}>
            <Body>{I18n.t("features.itWallet.trustmark.description")}</Body>
            <ItwTrustmarkQrCode />
            <ItwTrustmarkExpirationTimer />
          </VStack>
        </ContentWrapper>
      </IOScrollViewWithLargeHeader>
    </ItwTrustmarkMachineProvider>
  );
};

// Offline failure screen HOC
export const ItwCredentialTrustmarkScreen = withOfflineFailureScreen(
  ItwCredentialTrustmarkScreenComponent
);
