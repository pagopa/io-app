import {
  Body,
  ContentWrapper,
  HSpacer,
  Icon,
  IOStyles,
  IOVisualCostants,
  VStack
} from "@pagopa/io-app-design-system";
import { format } from "date-fns";
import React from "react";
import { StyleSheet, View } from "react-native";
import Placeholder from "rn-placeholder";
import { QrCodeImage } from "../../../../components/QrCodeImage";
import { IOScrollViewWithLargeHeader } from "../../../../components/ui/IOScrollViewWithLargeHeader";
import I18n from "../../../../i18n";
import { IOStackNavigationRouteProps } from "../../../../navigation/params/AppParamsList";
import { useMaxBrightness } from "../../../../utils/brightness";
import { getCredentialNameFromType } from "../../common/utils/itwCredentialUtils";
import { ItwParamsList } from "../../navigation/ItwParamsList";
import {
  ItwTrustmarkMachineContext,
  ItwTrustmarkMachineProvider
} from "../machine/provider";
import {
  selectExpirationSeconds,
  selectTrustmarkUrl
} from "../machine/selectors";
import { useDebugInfo } from "../../../../hooks/useDebugInfo";

export type ItwCredentialTrustmarkScreenNavigationParams = {
  credentialType: string;
};

type ScreenProps = IOStackNavigationRouteProps<
  ItwParamsList,
  "ITW_PRESENTATION_CREDENTIAL_TRUSTMARK"
>;

export const ItwCredentialTrustmarkScreen = (params: ScreenProps) => {
  const { credentialType } = params.route.params;

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
            <TrustmarkQrCode />
            <TrustmarkExpirationTimer />
          </VStack>
        </ContentWrapper>
      </IOScrollViewWithLargeHeader>
    </ItwTrustmarkMachineProvider>
  );
};

/**
 * Component that renders the QR code of the trustmark
 */
const TrustmarkQrCode = () => {
  const trustmarkUrl =
    ItwTrustmarkMachineContext.useSelector(selectTrustmarkUrl);

  useDebugInfo({ trustmarkUrl });

  return (
    <View style={styles.qrCodeContainer}>
      <QrCodeImage
        size={"92%"}
        value={trustmarkUrl}
        correctionLevel="L"
        accessibilityLabel={I18n.t("features.itWallet.trustmark.qrCode")}
      />
    </View>
  );
};

/**
 * Timer that shows the remaining time before the trustmark expires
 */
const TrustmarkExpirationTimer = () => {
  const expirationSeconds = ItwTrustmarkMachineContext.useSelector(
    selectExpirationSeconds
  );

  // Format the expiration time to mm:ss and show a placeholder if the expiration time is undefined
  const formattedExpirationTime =
    expirationSeconds !== undefined ? (
      <Body weight="Semibold">
        {format(new Date(expirationSeconds * 1000), "mm:ss")}
      </Body>
    ) : (
      <Placeholder.Box height={18} width={40} animate="fade" radius={4} />
    );

  return (
    <View style={[IOStyles.row, IOStyles.alignCenter]}>
      <Icon name="history" size={24} color="grey-300" />
      <HSpacer size={24} />
      <Body>
        {I18n.t("features.itWallet.trustmark.expiration") + " "}
        {formattedExpirationTime}
      </Body>
    </View>
  );
};

const styles = StyleSheet.create({
  qrCodeContainer: {
    marginHorizontal: -IOVisualCostants.appMarginDefault,
    alignItems: "center"
  }
});
