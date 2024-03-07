import { Pictogram } from "@pagopa/io-app-design-system";
import { useRoute } from "@react-navigation/native";
import * as O from "fp-ts/lib/Option";
import * as React from "react";
import { SafeAreaView } from "react-native";
import { IOStyles } from "../../components/core/variables/IOStyles";
import { InfoScreenComponent } from "../../components/infoScreen/InfoScreenComponent";
import BaseScreenComponent from "../../components/screens/BaseScreenComponent";
import { BlockButtonProps } from "../../components/ui/BlockButtons";
import FooterWithButtons from "../../components/ui/FooterWithButtons";
import { isFastLoginEnabledSelector } from "../../features/fastLogin/store/selectors";
import I18n from "../../i18n";
import { completeOnboarding } from "../../store/actions/onboarding";
import { useIODispatch, useIOSelector } from "../../store/hooks";
import { idpSelector } from "../../store/reducers/authentication";
import { getFlowType } from "../../utils/analytics";
import { useOnFirstRender } from "../../utils/hooks/useOnFirstRender";
import { trackLoginEnded } from "../authentication/analytics";
import { trackThankYouPageScreen } from "../profile/analytics";

const OnboardingCompletedScreen = () => {
  const dispatch = useIODispatch();

  const isFastLoginEnabled = useIOSelector(isFastLoginEnabledSelector);
  const idpSelected = useIOSelector(idpSelector);

  const idp = O.isSome(idpSelected) ? idpSelected.value.name : "";
  const route = useRoute();

  const continueButtonProps: BlockButtonProps = {
    bordered: false,
    title: I18n.t("global.buttons.continue"),
    onPress: () => {
      trackLoginEnded(
        isFastLoginEnabled,
        idp,
        getFlowType(false, true),
        route.name
      );
      dispatch(completeOnboarding());
    }
  };

  useOnFirstRender(() => {
    trackThankYouPageScreen();
  });

  return (
    <BaseScreenComponent>
      <SafeAreaView style={IOStyles.flex}>
        <InfoScreenComponent
          image={<Pictogram name="fireworks" />}
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
