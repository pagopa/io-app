/* eslint-disable functional/immutable-data */
import { RouteProp, useRoute } from "@react-navigation/native";
import { useSelector } from "@xstate/react";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import * as React from "react";
import {
  Dimensions,
  LayoutChangeEvent,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  View
} from "react-native";
import ItemSeparatorComponent from "../../../../components/ItemSeparatorComponent";
import LoadingSpinnerOverlay from "../../../../components/LoadingSpinnerOverlay";
import { VSpacer } from "../../../../components/core/spacer/Spacer";
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
  const footerViewRef = React.useRef<View>(null);

  const [isDescriptionLoaded, setDescriptionLoaded] = React.useState(false);
  const [isFooterVisible, setFooterVisible] = React.useState(false);

  const handleGoBackPress = () => machine.send({ type: "QUIT_ONBOARDING" });

  const handleContinuePress = () => machine.send({ type: "ACCEPT_TOS" });

  const handleOnScroll = (_: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (footerViewRef.current) {
      footerViewRef.current.measureInWindow((_x, y, _width, height) => {
        checkFooterVisibility(y, height);
      });
    }
  };

  const handleFooterLayout = (event: LayoutChangeEvent) => {
    const { y, height } = event.nativeEvent.layout;
    checkFooterVisibility(y, height);
  };

  const checkFooterVisibility = (y: number, height: number) => {
    const top = y;
    const bottom = top + height;
    const { height: screenHeight } = Dimensions.get("window");
    const isInView = bottom > 0 && top < screenHeight;
    setFooterVisible(isInView);
  };

  const handleScrollToBottomPress = () => scrollViewRef.current?.scrollToEnd();

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
    initiative,
    O.fromNullable,
    O.map(({ description }) => description),
    O.map(description => (
      <View key={"desc"} style={{ flexGrow: 1 }}>
        <Markdown onLoadEnd={() => setDescriptionLoaded(true)}>
          {description}
        </Markdown>
      </View>
    )),
    O.toUndefined
  );

  const scrollToBottomButton = pipe(
    O.some(undefined),
    O.filter(_ => isDescriptionLoaded && !isFooterVisible),
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

  const onboardingPrivacyAdvice = pipe(
    initiative,
    O.fromNullable,
    O.map(initiative => ({
      privacyUrl: initiative.privacyLink,
      tosUrl: initiative.tcLink
    })),
    O.map(props => <OnboardingPrivacyAdvice key={"advice"} {...props} />),
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
          scrollIndicatorInsets={{ right: 1 }}
          onScroll={handleOnScroll}
          scrollEventThrottle={400}
          contentContainerStyle={styles.scrollContent}
        >
          <VSpacer size={24} />
          {serviceHeaderComponent}
          <VSpacer size={24} />
          {descriptionComponent}
          <VSpacer size={8} />
          <ItemSeparatorComponent noPadded={true} />
          <VSpacer size={16} />
          {onboardingPrivacyAdvice}
          <VSpacer size={32} />
          <View ref={footerViewRef} onLayout={handleFooterLayout}>
            <BlockButtons
              key={"continue"}
              type="SingleButton"
              leftButton={{
                title: I18n.t("global.buttons.continue"),
                accessibilityLabel: I18n.t("global.buttons.continue"),
                onPress: handleContinuePress,
                testID: "IDPayOnboardingContinue",
                isLoading: isUpserting,
                disabled: isUpserting || !isDescriptionLoaded
              }}
            />
          </View>
          <VSpacer size={48} />
        </ScrollView>
        {scrollToBottomButton}
      </LoadingSpinnerOverlay>
    </BaseScreenComponent>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24
  },
  scrollDownButton: {
    position: "absolute",
    right: 20,
    bottom: 50
  }
});

export type { InitiativeDetailsScreenRouteParams };

export default InitiativeDetailsScreen;
