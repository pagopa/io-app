/* eslint-disable functional/immutable-data */
import { RouteProp, useRoute } from "@react-navigation/native";
import { useSelector } from "@xstate/react";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import * as React from "react";
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  View
} from "react-native";
import ItemSeparatorComponent from "../../../../components/ItemSeparatorComponent";
import { VSpacer } from "../../../../components/core/spacer/Spacer";
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
import { ScrollDownButton } from "../components/ScrollDownButton";
import { IDPayOnboardingParamsList } from "../navigation/navigator";
import { useOnboardingMachineService } from "../xstate/provider";
import { isUpsertingSelector, selectInitiative } from "../xstate/selectors";

type InitiativeDetailsScreenRouteParams = {
  serviceId: string;
};

type InitiativeDetailsRouteProps = RouteProp<
  IDPayOnboardingParamsList,
  "IDPAY_ONBOARDING_INITIATIVE_DETAILS"
>;

const InitiativeDetailsScreen = () => {
  const route = useRoute<InitiativeDetailsRouteProps>();
  const machine = useOnboardingMachineService();

  const { serviceId } = route.params;

  React.useEffect(() => {
    machine.send({
      type: "SELECT_INITIATIVE",
      serviceId
    });
  }, [machine, serviceId]);

  const initiative = useSelector(machine, selectInitiative);
  const isUpserting = useSelector(machine, isUpsertingSelector);

  const scrollViewRef = React.useRef<ScrollView>(null);

  const [isDescriptionLoaded, setDescriptionLoaded] = React.useState(false);
  const [isScrollButtonVisible, setScrollButtonVisible] = React.useState(false);
  const [_, setFooterVisible] = React.useState(false);

  const handleDescriptionLoadEnd = () => {
    setDescriptionLoaded(true);
    setScrollButtonVisible(true);
  };

  const handleGoBackPress = () => machine.send({ type: "QUIT_ONBOARDING" });

  const handleContinuePress = () => machine.send({ type: "ACCEPT_TOS" });

  const handleOnScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const paddingToBottom = 100;

    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    const isCloseToBottom =
      layoutMeasurement.height + contentOffset.y >=
      contentSize.height - paddingToBottom;

    setFooterVisible(isVisible => {
      if (isVisible && !isCloseToBottom) {
        // Continue button transition from VISIBLE to HIDDEN
        setScrollButtonVisible(true);
      } else if (!isVisible && isCloseToBottom) {
        // Continue button transition from HIDDEN to VISIBLE
        setScrollButtonVisible(false);
      }
      return isCloseToBottom;
    });
  };

  const handleScrollDownPress = () => {
    setScrollButtonVisible(false);
    scrollViewRef.current?.scrollToEnd();
  };

  const onboardingPrivacyAdvice = pipe(
    initiative,
    O.fromNullable,
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
    O.fromNullable,
    O.fold(
      () => <OnboardingDescriptionMarkdownSkeleton />,
      ({ description }) => (
        <OnboardingDescriptionMarkdown
          onLoadEnd={handleDescriptionLoadEnd}
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
      <ScrollView
        ref={scrollViewRef}
        scrollIndicatorInsets={{ right: 1 }}
        scrollEnabled={isDescriptionLoaded}
        onScroll={handleOnScroll}
        scrollEventThrottle={400}
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
              isLoading: isUpserting,
              disabled: isUpserting
            }}
          />
          <VSpacer size={48} />
        </View>
      </ScrollView>
      <ScrollDownButton
        onPress={handleScrollDownPress}
        isVisible={isScrollButtonVisible}
      />
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

export type { InitiativeDetailsScreenRouteParams };

export default InitiativeDetailsScreen;
