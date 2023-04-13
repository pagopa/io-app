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
import LoadingSpinnerOverlay from "../../../../components/LoadingSpinnerOverlay";
import { ContentWrapper } from "../../../../components/core/ContentWrapper";
import { VSpacer } from "../../../../components/core/spacer/Spacer";
import { IOStyles } from "../../../../components/core/variables/IOStyles";
import BaseScreenComponent from "../../../../components/screens/BaseScreenComponent";
import BlockButtons from "../../../../components/ui/BlockButtons";
import IconButtonSolid from "../../../../components/ui/IconButtonSolid";
import Markdown from "../../../../components/ui/Markdown";
import I18n from "../../../../i18n";
import { emptyContextualHelp } from "../../../../utils/emptyContextualHelp";
import { OnboardingPrivacyAdvice } from "../components/OnboardingPrivacyAdvice";
import { OnboardingServiceHeader } from "../components/OnboardingServiceHeader";
import { IDPayOnboardingParamsList } from "../navigation/navigator";
import { useOnboardingMachineService } from "../xstate/provider";
import {
  isLoadingSelector,
  isUpsertingSelector,
  selectInitiative
} from "../xstate/selectors";

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
  const isLoading = useSelector(machine, isLoadingSelector);

  const scrollViewRef = React.useRef<ScrollView>(null);

  const [isDescriptionLoaded, setDescriptionLoaded] = React.useState(false);
  const [isEndReached, setEndReached] = React.useState(false);

  const shouldRenderScrollToBottomButton = isDescriptionLoaded && !isEndReached;

  const handleGoBackPress = () => machine.send({ type: "QUIT_ONBOARDING" });

  const handleContinuePress = () => machine.send({ type: "ACCEPT_TOS" });

  const handleOnScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;

    const padding = 50;

    setEndReached(
      layoutMeasurement.height + contentOffset.y >= contentSize.height - padding
    );
  };

  const handleScrollToBottomPress = () => {
    scrollViewRef.current?.scrollToEnd();
  };

  const serviceHeaderComponent = pipe(
    initiative,
    O.fromNullable,
    O.map(initiative => ({
      organizationName: initiative.organizationName,
      initiativeName: initiative.initiativeName,
      logoURL: initiative.logoURL
    })),
    O.map(props => <OnboardingServiceHeader key={"header"} {...props} />),
    O.toUndefined
  );

  const descriptionComponent = pipe(
    initiative?.description,
    O.fromNullable,
    O.map(description => (
      <Markdown key={"desc"} onLoadEnd={() => setDescriptionLoaded(true)}>
        {description}
      </Markdown>
    )),
    O.toUndefined
  );

  const scrollToBottomButton = pipe(
    O.some(undefined),
    O.filter(_ => shouldRenderScrollToBottomButton),
    O.map(_ => (
      <View key={"scrollDown"} style={styles.scrollDownButton}>
        <IconButtonSolid
          accessibilityLabel="Scroll to bottom"
          icon="arrowBottom"
          onPress={handleScrollToBottomPress}
        />
      </View>
    )),
    O.toUndefined
  );

  const footerComponent = pipe(
    initiative,
    O.fromNullable,
    O.filter(_ => isDescriptionLoaded),
    O.map(initiative => (
      <>
        <ItemSeparatorComponent noPadded={true} />
        <VSpacer size={16} />
        <OnboardingPrivacyAdvice
          privacyUrl={initiative.privacyLink}
          tosUrl={initiative.tcLink}
        />
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
      </>
    )),
    O.toUndefined
  );

  return (
    <BaseScreenComponent
      goBack={handleGoBackPress}
      headerTitle={I18n.t("idpay.onboarding.headerTitle")}
      contextualHelp={emptyContextualHelp}
    >
      <LoadingSpinnerOverlay isLoading={isLoading} loadingOpacity={100}>
        <ScrollView
          ref={scrollViewRef}
          style={IOStyles.flex}
          scrollIndicatorInsets={{ right: 1 }}
          onScroll={handleOnScroll}
          scrollEventThrottle={400}
        >
          <ContentWrapper>
            {serviceHeaderComponent}
            <VSpacer size={24} />
            {descriptionComponent}
            <VSpacer size={8} />
            {footerComponent}
            <VSpacer size={48} />
          </ContentWrapper>
        </ScrollView>
        {scrollToBottomButton}
      </LoadingSpinnerOverlay>
    </BaseScreenComponent>
  );
};

const styles = StyleSheet.create({
  scrollDownButton: {
    position: "absolute",
    right: 20,
    bottom: 50
  }
});

export type { InitiativeDetailsScreenRouteParams };

export default InitiativeDetailsScreen;
