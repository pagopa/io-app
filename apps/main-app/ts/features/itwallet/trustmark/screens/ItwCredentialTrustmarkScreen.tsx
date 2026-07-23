import { Body, ContentWrapper, VStack } from "@io-app/design-system";
import I18n from "i18next";

import { IOScrollViewWithLargeHeader } from "../../../../components/ui/IOScrollViewWithLargeHeader";
import { IOStackNavigationRouteProps } from "../../../../navigation/params/AppParamsList";
import { useMaxBrightness } from "../../../../utils/brightness";
import { usePreventScreenCapture } from "../../../../utils/hooks/usePreventScreenCapture";
import { RequiresConnectivity } from "../../common/components/RequiresConnectivity";
import { useItwCredentialName } from "../../common/hooks/useItwCredentialName";
import { ItwParamsList } from "../../navigation/ItwParamsList";
import { ItwTrustmarkExpirationTimer } from "../components/ItwTrustmarkExpirationTimer";
import { ItwTrustmarkQrCode } from "../components/ItwTrustmarkQrCode";
import { ItwTrustmarkMachineProvider } from "../machine/provider";

export type ItwCredentialTrustmarkScreenNavigationParams = {
  credentialType: string;
};

type ScreenProps = IOStackNavigationRouteProps<
  ItwParamsList,
  "ITW_PRESENTATION_CREDENTIAL_TRUSTMARK"
>;

const ItwCredentialTrustmarkScreenComponent = (params: ScreenProps) => {
  const { credentialType } = params.route.params;
  const credentialName = useItwCredentialName(credentialType);

  usePreventScreenCapture();
  useMaxBrightness({ useSmoothTransition: true });

  return (
    <ItwTrustmarkMachineProvider credentialType={credentialType}>
      <IOScrollViewWithLargeHeader
        headerActionsProp={{ showHelp: true }}
        title={{
          label: credentialName
        }}
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

export const ItwCredentialTrustmarkScreen = (props: ScreenProps) => (
  <RequiresConnectivity>
    <ItwCredentialTrustmarkScreenComponent {...props} />
  </RequiresConnectivity>
);
