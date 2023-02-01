import { useActor, useSelector } from "@xstate/react";
import React from "react";
import { View, SafeAreaView } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { H1 } from "../../../../components/core/typography/H1";
import { IOStyles } from "../../../../components/core/variables/IOStyles";
import LoadingSpinnerOverlay from "../../../../components/LoadingSpinnerOverlay";
import BaseScreenComponent from "../../../../components/screens/BaseScreenComponent";
import { emptyContextualHelp } from "../../../../utils/emptyContextualHelp";
import { useOnboardingMachineService } from "../xstate/provider";
import { Body } from "../../../../components/core/typography/Body";
import { Link } from "../../../../components/core/typography/Link";
import FooterWithButtons from "../../../../components/ui/FooterWithButtons";
import ListItemComponent from "../../../../components/screens/ListItemComponent";
import { LOADING_TAG } from "../../../../utils/xstate";
import { boolRequiredCriteriaSelector } from "../xstate/selectors";
import { VSpacer } from "../../../../components/core/spacer/Spacer";
import I18n from "../../../../i18n";

const InitiativeSelfDeclarationsScreen = () => {
  const machine = useOnboardingMachineService();
  const [state, send] = useActor(machine);

  const isLoading = state.tags.has(LOADING_TAG);

  const selfCriteriaBool = useSelector(machine, boolRequiredCriteriaSelector);

  const continueOnPress = () => send({ type: "ACCEPT_REQUIRED_BOOL_CRITERIA" });
  const goBackOnPress = () => send({ type: "GO_BACK" });

  return (
    <BaseScreenComponent
      headerTitle={I18n.t("idpay.onboarding.navigation.header")}
      goBack={goBackOnPress}
      contextualHelp={emptyContextualHelp}
    >
      <LoadingSpinnerOverlay isLoading={isLoading}>
        <SafeAreaView style={IOStyles.flex}>
          <ScrollView style={IOStyles.flex}>
            <View style={IOStyles.horizontalContentPadding}>
              <H1>{I18n.t("idpay.onboarding.boolPrerequisites.header")}</H1>
              <VSpacer size={16} />
              <Body>{I18n.t("idpay.onboarding.boolPrerequisites.body")}</Body>
              <Link>{I18n.t("idpay.onboarding.boolPrerequisites.link")}</Link>
              <VSpacer size={24} />
              {selfCriteriaBool.map((criteria, index) => (
                <View key={criteria.code}>
                  <ListItemComponent
                    key={index}
                    title={criteria.description}
                    switchValue={true}
                    accessibilityRole={"switch"}
                    accessibilityState={{ checked: false }}
                    isLongPressEnabled={true}
                  />
                  <VSpacer size={16} />
                </View>
              ))}
            </View>
          </ScrollView>
          <FooterWithButtons
            type={"TwoButtonsInlineHalf"}
            leftButton={{
              bordered: true,
              title: I18n.t("global.buttons.back"),
              onPress: goBackOnPress
            }}
            rightButton={{
              title: I18n.t("global.buttons.continue"),
              onPress: continueOnPress
            }}
          />
        </SafeAreaView>
      </LoadingSpinnerOverlay>
    </BaseScreenComponent>
  );
};

export default InitiativeSelfDeclarationsScreen;
