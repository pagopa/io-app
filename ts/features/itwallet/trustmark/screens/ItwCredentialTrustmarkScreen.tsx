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
import * as O from "fp-ts/Option";
import React from "react";
import { StyleSheet, View } from "react-native";
import Placeholder from "rn-placeholder";
import { QrCodeImage } from "../../../../components/QrCodeImage";
import { IOScrollViewWithLargeHeader } from "../../../../components/ui/IOScrollViewWithLargeHeader";
import I18n from "../../../../i18n";
import { IOStackNavigationRouteProps } from "../../../../navigation/params/AppParamsList";
import { useIOSelector } from "../../../../store/hooks";
import { useMaxBrightness } from "../../../../utils/brightness";
import { getCredentialNameFromType } from "../../common/utils/itwCredentialUtils";
import { itwCredentialByTypeSelector } from "../../credentials/store/selectors";
import { ItwParamsList } from "../../navigation/ItwParamsList";
import {
  ItwTrustmarkMachineContext,
  ItwTrustmarkMachineProvider
} from "../machine/provider";
import {
  selectExpirationSeconds,
  selectTrustmarkUrl
} from "../machine/selectors";
import { itwWalletInstanceAttestationSelector } from "../../walletInstance/store/reducers";
import { ItwGenericErrorContent } from "../../common/components/ItwGenericErrorContent";

export type ItwCredentialTrustmarkScreenNavigationParams = {
  credentialType: string;
};

type ScreenProps = IOStackNavigationRouteProps<
  ItwParamsList,
  "ITW_PRESENTATION_CREDENTIAL_TRUSTMARK"
>;

export const ItwCredentialTrustmarkScreen = ({ route }: ScreenProps) => {
  const { credentialType } = route.params;
  const walletInstanceAttestation = useIOSelector(
    itwWalletInstanceAttestationSelector
  );

  const credentialOption = useIOSelector(
    itwCredentialByTypeSelector(credentialType)
  );

  useMaxBrightness();

  if (O.isNone(credentialOption) || !walletInstanceAttestation) {
    // This is unlikely to happen, but we want to handle the case where the credential or WIA are not found
    // because of inconsistencies in the state, and assert that the credential is O.some
    return <ItwGenericErrorContent />;
  }

  return (
    <ItwTrustmarkMachineProvider
      credential={credentialOption.value}
      walletInstanceAttestation={walletInstanceAttestation}
    >
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

  return (
    <View style={styles.qrCodeContainer}>
      <QrCodeImage size={"92%"} value={trustmarkUrl} correctionLevel="L" />
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

  // Format the expiration time to mm:ss
  const formattedExpirationTime = expirationSeconds
    ? format(new Date(expirationSeconds * 1000), "mm:ss")
    : undefined;

  return (
    <View style={[IOStyles.row, IOStyles.alignCenter]}>
      <Icon name="history" size={24} color="grey-300" />
      <HSpacer size={24} />
      <Body>
        {I18n.t("features.itWallet.trustmark.expiration") + " "}
        {formattedExpirationTime ? (
          <Body weight="Bold">{formattedExpirationTime}</Body>
        ) : (
          <Placeholder.Box height={18} width={40} animate="fade" radius={4} />
        )}
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
