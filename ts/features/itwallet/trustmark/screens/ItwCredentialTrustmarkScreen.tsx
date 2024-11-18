import {
  Body,
  ContentWrapper,
  FeatureInfo,
  H2,
  H6,
  VSpacer,
  VStack
} from "@pagopa/io-app-design-system";
import * as O from "fp-ts/Option";
import React from "react";
import { View } from "react-native";
import { QrCodeImage } from "../../../../components/QrCodeImage";
import I18n from "../../../../i18n";
import { IOStackNavigationRouteProps } from "../../../../navigation/params/AppParamsList";
import { useIOSelector } from "../../../../store/hooks";
import { ItwGenericErrorContent } from "../../common/components/ItwGenericErrorContent";
import { getCredentialNameFromType } from "../../common/utils/itwCredentialUtils";
import { StoredCredential } from "../../common/utils/itwTypesUtils";
import { itwCredentialByTypeSelector } from "../../credentials/store/selectors";
import { ItwParamsList } from "../../navigation/ItwParamsList";
import {
  ItwTrustmarkMachineContext,
  ItwTrustmarkMachineProvider
} from "../machine/provider";
import { selectTrustmarkUrl } from "../machine/selectors";
import { DSIOScrollViewScreenWithLargeHeader } from "../../../design-system/core/DSIOScrollViewWithLargeHeader";
import { IOScrollViewWithLargeHeader } from "../../../../components/ui/IOScrollViewWithLargeHeader";
import { useMaxBrightness } from "../../../../utils/brightness";

export type ItwCredentialTrustmarkScreenNavigationParams = {
  credentialType: string;
};

type ScreenProps = IOStackNavigationRouteProps<
  ItwParamsList,
  "ITW_PRESENTATION_CREDENTIAL_TRUSTMARK"
>;

export const ItwCredentialTrustmarkScreen = ({ route }: ScreenProps) => {
  const { credentialType } = route.params;
  const credentialOption = useIOSelector(
    itwCredentialByTypeSelector(credentialType)
  );

  if (O.isNone(credentialOption)) {
    // This is unlikely to happen, but we want to handle the case where the credential is not found
    // because of inconsistencies in the state, and assert that the credential is O.some
    return <ItwGenericErrorContent />;
  }

  return (
    <ItwTrustmarkMachineProvider credential={credentialOption.value}>
      <ItwCredentialTrustmarkContent credential={credentialOption.value} />
    </ItwTrustmarkMachineProvider>
  );
};

type ItwCredentialTrustmarkContentProps = {
  credential: StoredCredential;
};

const ItwCredentialTrustmarkContent = ({
  credential
}: ItwCredentialTrustmarkContentProps) => {
  const trustmarkUrl =
    ItwTrustmarkMachineContext.useSelector(selectTrustmarkUrl);

  useMaxBrightness();

  return (
    <IOScrollViewWithLargeHeader
      title={{
        label: getCredentialNameFromType(credential.credentialType)
      }}
    >
      <ContentWrapper>
        <VStack space={16}>
          <Body>
            {I18n.t(
              "features.itWallet.presentation.trustmark.usageDescription"
            )}
          </Body>
          <QrCodeImage size={"90%"} value={trustmarkUrl} correctionLevel="L" />
        </VStack>
      </ContentWrapper>
    </IOScrollViewWithLargeHeader>
  );
};
