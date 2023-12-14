/* eslint-disable functional/immutable-data */
import * as React from "react";
import { SafeAreaView, View } from "react-native";
import { ButtonSolid, Pictogram } from "@pagopa/io-app-design-system";
import { IOStyles } from "../../../../components/core/variables/IOStyles";
import { InfoScreenComponent } from "../../../../components/infoScreen/InfoScreenComponent";
import I18n from "../../../../i18n";

type WalletOnboardingSuccessProps = {
  onContinue: () => void;
};

/**
 * Component that shows a success message after the wallet onboarding process is completed
 * TODO: Define the desired design of this component
 */
const WalletOnboardingSuccess = ({
  onContinue
}: WalletOnboardingSuccessProps) => (
  <SafeAreaView style={IOStyles.flex}>
    <InfoScreenComponent
      image={<Pictogram name="success" size={120} />}
      title={I18n.t("wallet.onboarding.success.title")}
      body={<ContinueButton onPress={onContinue} />}
    />
  </SafeAreaView>
);

type ContinueButtonProps = {
  onPress: () => void;
};

const ContinueButton = ({ onPress }: ContinueButtonProps) => (
  <View style={IOStyles.alignCenter}>
    <ButtonSolid
      accessibilityLabel={I18n.t("wallet.onboarding.success.continueButton")}
      label={I18n.t("wallet.onboarding.success.continueButton")}
      onPress={onPress}
    />
  </View>
);

export default WalletOnboardingSuccess;
