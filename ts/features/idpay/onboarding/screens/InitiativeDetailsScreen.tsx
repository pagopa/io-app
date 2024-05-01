/* eslint-disable functional/immutable-data */
import { VSpacer } from "@pagopa/io-app-design-system";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import * as React from "react";
import { StyleSheet, View } from "react-native";
import { ForceScrollDownView } from "../../../../components/ForceScrollDownView";
import ItemSeparatorComponent from "../../../../components/ItemSeparatorComponent";
import BaseScreenComponent from "../../../../components/screens/BaseScreenComponent";
import BlockButtons from "../../../../components/ui/BlockButtons";
import I18n from "../../../../i18n";
import { emptyContextualHelp } from "../../../../utils/emptyContextualHelp";
import {
  OnboardingDescriptionMarkdown,
  OnboardingDescriptionMarkdownSkeleton
} from "../components/OnboardingDescriptionMarkdown";
import { OnboardingPrivacyAdvice } from "../components/OnboardingPrivacyAdvice";
import { OnboardingServiceHeader } from "../components/OnboardingServiceHeader";
import { IdPayOnboardingMachineContext } from "../machine/provider";
import { selectInitiative } from "../machine/selectors";
import { isLoadingSelector } from "../../../../xstate/selectors";

export const InitiativeDetailsScreen = () => {
  const { useActorRef, useSelector } = IdPayOnboardingMachineContext;
  const machine = useActorRef();

  const initiative = useSelector(selectInitiative);
  const isLoading = useSelector(isLoadingSelector);
  const [isDescriptionLoaded, setDescriptionLoaded] = React.useState(false);

  const handleGoBackPress = () => machine.send({ type: "close" });
  const handleContinuePress = () => machine.send({ type: "next" });

  const onboardingPrivacyAdvice = pipe(
    initiative,
    O.map(initiative => ({
      privacyUrl: initiative.privacyLink,
      tosUrl: initiative.tcLink
    })),
    O.fold(
      () => null,
      props => <OnboardingPrivacyAdvice {...props} />
    )
  );

  const descriptionComponent = pipe(
    initiative,
    O.fold(
      () => <OnboardingDescriptionMarkdownSkeleton />,
      ({ description }) => (
        <OnboardingDescriptionMarkdown
          onLoadEnd={() => setDescriptionLoaded(true)}
          description={description}
        />
      )
    )
  );

  return (
    <BaseScreenComponent
      goBack={handleGoBackPress}
      headerTitle={I18n.t("idpay.onboarding.headerTitle")}
      contextualHelp={emptyContextualHelp}
    >
      <ForceScrollDownView
        threshold={150}
        scrollEnabled={isDescriptionLoaded}
        contentContainerStyle={styles.scrollContainer}
      >
        <View style={styles.container}>
          <VSpacer size={24} />
          <OnboardingServiceHeader initiative={initiative} />
          <VSpacer size={24} />
          {descriptionComponent}
          <VSpacer size={8} />
          <ItemSeparatorComponent noPadded={true} />
          <VSpacer size={16} />
          {onboardingPrivacyAdvice}
          <VSpacer size={32} />
          <BlockButtons
            key={"continue"}
            type="SingleButton"
            leftButton={{
              title: I18n.t("global.buttons.continue"),
              accessibilityLabel: I18n.t("global.buttons.continue"),
              onPress: handleContinuePress,
              testID: "IDPayOnboardingContinue",
              isLoading,
              disabled: isLoading
            }}
          />
          <VSpacer size={48} />
        </View>
      </ForceScrollDownView>
    </BaseScreenComponent>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1
  },
  container: {
    flexGrow: 1,
    paddingHorizontal: 24
  }
});
