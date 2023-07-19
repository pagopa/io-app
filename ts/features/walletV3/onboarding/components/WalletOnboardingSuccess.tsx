/* eslint-disable functional/immutable-data */
import * as React from "react";
import { SafeAreaView, View } from "react-native";
import { IOStyles } from "../../../../components/core/variables/IOStyles";
import { InfoScreenComponent } from "../../../../components/infoScreen/InfoScreenComponent";
import ButtonSolid from "../../../../components/ui/ButtonSolid";
import SectionPictogram from "../../../../components/core/pictograms/SectionPictogram";

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
      image={<SectionPictogram name="smile" size={120} color="blue" />}
      title="La carta è stata aggiunta!"
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
      accessibilityLabel="Continua"
      label="Continua"
      onPress={onPress}
    />
  </View>
);

export default WalletOnboardingSuccess;
