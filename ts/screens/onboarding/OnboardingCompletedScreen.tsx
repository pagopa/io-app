import * as React from "react";
import { SafeAreaView } from "react-native";
import { useDispatch } from "react-redux";
import BaseScreenComponent from "../../components/screens/BaseScreenComponent";
import { IOStyles } from "../../components/core/variables/IOStyles";
import { InfoScreenComponent } from "../../components/infoScreen/InfoScreenComponent";
import FooterWithButtons from "../../components/ui/FooterWithButtons";
import { BlockButtonProps } from "../../components/ui/BlockButtons";
import I18n from "../../i18n";
import { completeOnboarding } from "../../store/actions/onboarding";
import PictogramFireworks from "../../components/core/pictograms/svg/PictogramFireworks";

const OnboardingCompletedScreen = () => {
  const dispatch = useDispatch();

  const continueButtonProps: BlockButtonProps = {
    bordered: false,
    title: I18n.t("global.buttons.continue"),
    onPress: () => dispatch(completeOnboarding())
  };

  return (
    <BaseScreenComponent>
      <SafeAreaView style={IOStyles.flex}>
        <InfoScreenComponent
          image={<PictogramFireworks size={120} color="#00C5CA" />}
          title={I18n.t("onboarding.thankYouPage.title")}
        />

        <FooterWithButtons
          type={"SingleButton"}
          leftButton={continueButtonProps}
        />
      </SafeAreaView>
    </BaseScreenComponent>
  );
};

export default OnboardingCompletedScreen;
