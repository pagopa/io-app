import {
  Body,
  FeatureInfo,
  H6,
  VSpacer,
  VStack
} from "@pagopa/io-app-design-system";
import { default as React } from "react";
import { View } from "react-native";
import { QrCodeImage } from "../../../../components/QrCodeImage";
import I18n from "../../../../i18n";
import { getCredentialNameFromType } from "../../common/utils/itwCredentialUtils";
import { StoredCredential } from "../../common/utils/itwTypesUtils";
import {
  ItwTrustmarkMachineContext,
  ItwTrustmarkMachineProvider
} from "../machine/provider";
import { selectTrustmarkUrl } from "../machine/selectors";

type Props = {
  credential: StoredCredential;
};

export const ItwCredentialTrustmarkBottomSheet = ({ credential }: Props) => (
  <ItwTrustmarkMachineProvider credential={credential}>
    <ItwCredentialTrustmarkBottomSheetContent credential={credential} />
  </ItwTrustmarkMachineProvider>
);

export const ItwCredentialTrustmarkBottomSheetContent = ({
  credential
}: Props) => {
  const trustmarkUrl =
    ItwTrustmarkMachineContext.useSelector(selectTrustmarkUrl);

  return (
    <View>
      <VStack space={24}>
        <QrCodeImage size={170} value={trustmarkUrl} />
        <VStack space={8}>
          <H6>{getCredentialNameFromType(credential.credentialType)}</H6>
          <Body>
            {I18n.t(
              "features.itWallet.presentation.trustmark.usageDescription"
            )}
          </Body>
        </VStack>
        <FeatureInfo
          iconName="security"
          body={I18n.t(
            "features.itWallet.presentation.trustmark.certifiedLabel"
          )}
        />
      </VStack>
      <VSpacer size={24} />
    </View>
  );
};
