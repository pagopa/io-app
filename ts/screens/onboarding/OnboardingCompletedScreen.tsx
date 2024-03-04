import { FooterWithButtons, Pictogram } from "@pagopa/io-app-design-system";
import { useRoute } from "@react-navigation/native";
import * as O from "fp-ts/lib/Option";
import * as React from "react";
import { SafeAreaView } from "react-native";
import { useDispatch } from "react-redux";
import { IOStyles } from "../../components/core/variables/IOStyles";
import { InfoScreenComponent } from "../../components/infoScreen/InfoScreenComponent";
import BaseScreenComponent from "../../components/screens/BaseScreenComponent";
import { isFastLoginEnabledSelector } from "../../features/fastLogin/store/selectors";
import I18n from "../../i18n";
import { completeOnboarding } from "../../store/actions/onboarding";
import { useIOSelector } from "../../store/hooks";
import { idpSelector } from "../../store/reducers/authentication";
import { getFlowType } from "../../utils/analytics";
import { useOnFirstRender } from "../../utils/hooks/useOnFirstRender";
import { trackLoginEnded } from "../authentication/analytics";
import { trackThankYouPageScreen } from "../profile/analytics";

const OnboardingCompletedScreen = () => {
  const dispatch = useDispatch();

  const isFastLoginEnabled = useIOSelector(isFastLoginEnabledSelector);
  const idpSelected = useIOSelector(idpSelector);

  const idp = O.isSome(idpSelected) ? idpSelected.value.name : "";
  const route = useRoute();

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
      </SafeAreaView>
      <FooterWithButtons
        type="SingleButton"
        primary={{
          type: "Solid",
          buttonProps: {
            label: I18n.t("global.buttons.continue"),
            accessibilityLabel: I18n.t("global.buttons.continue"),
            onPress: () => {
              trackLoginEnded(
                isFastLoginEnabled,
                idp,
                getFlowType(false, true),
                route.name
              );
              dispatch(completeOnboarding());
            }
          }
        }}
      />
    </BaseScreenComponent>
  );
};

export default OnboardingCompletedScreen;
