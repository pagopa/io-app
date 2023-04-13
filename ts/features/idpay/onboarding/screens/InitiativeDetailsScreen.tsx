/* eslint-disable functional/immutable-data */
import { RouteProp, useRoute } from "@react-navigation/native";
import { useSelector } from "@xstate/react";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import * as React from "react";
import {
  LayoutChangeEvent,
  NativeScrollEvent,
  NativeSyntheticEvent,
  SafeAreaView,
  ScrollView,
  View
} from "react-native";
import ItemSeparatorComponent from "../../../../components/ItemSeparatorComponent";
import LoadingSpinnerOverlay from "../../../../components/LoadingSpinnerOverlay";
import OrganizationHeader from "../../../../components/OrganizationHeader";
import { VSpacer } from "../../../../components/core/spacer/Spacer";
import { IOStyles } from "../../../../components/core/variables/IOStyles";
import BaseScreenComponent from "../../../../components/screens/BaseScreenComponent";
import FooterWithButtons from "../../../../components/ui/FooterWithButtons";
import Markdown from "../../../../components/ui/Markdown";
import I18n from "../../../../i18n";
import { emptyContextualHelp } from "../../../../utils/emptyContextualHelp";
import { OnboardingPrivacyAdvice } from "../components/OnboardingPrivacyAdvice";
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
  const isAcceptingTos = useSelector(machine, isUpsertingSelector);
  const isLoading = useSelector(machine, isLoadingSelector);

  const [needsScrolling, setNeedsScrolling] = React.useState(true);
  const [hasScrolled, setHasScrolled] = React.useState(false);

  const scrollViewHeightRef = React.useRef(0);
  const isContinueButtonDisabled =
    isLoading || (needsScrolling && !hasScrolled);

  const handleScrollViewLayout = (e: LayoutChangeEvent) => {
    scrollViewHeightRef.current = e.nativeEvent.layout.height;
  };
  const isMarkdownLoadedRef = React.useRef(false);

  const handleScrollViewContentSizeChange = (_: number, height: number) => {
    // this method is called multiple times during the loading of the markdown
    if (isMarkdownLoadedRef.current) {
      setNeedsScrolling(height >= scrollViewHeightRef.current);
    }
  };

  const handleScrollViewOnScroll = ({
    nativeEvent
  }: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
    const paddingToBottom = 20;
    if (
      layoutMeasurement.height + contentOffset.y >=
      contentSize.height - paddingToBottom
    ) {
      setHasScrolled(true);
    }
  };

  const handleGoBackPress = () => {
    machine.send({ type: "QUIT_ONBOARDING" });
  };

  const handleContinuePress = () => machine.send({ type: "ACCEPT_TOS" });

  const setMarkdownIsLoaded = () => (isMarkdownLoadedRef.current = true);

  const serviceHeaderComponent = pipe(
    initiative,
    O.fromNullable,
    O.map(initiative => (
      <OrganizationHeader
        key={"header"}
        serviceName={initiative.organizationName}
        organizationName={initiative.initiativeName}
        logoURLs={[{ uri: initiative.logoURL }]}
      />
    )),
    O.toUndefined
  );

  const descriptionComponent = pipe(
    initiative?.description,
    O.fromNullable,
    O.map(description => (
      <Markdown key={"desc"} onLoadEnd={setMarkdownIsLoaded}>
        {description}
      </Markdown>
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
    O.map(props => <OnboardingPrivacyAdvice key={"tos"} {...props} />),
    O.toUndefined
  );

  return (
    <BaseScreenComponent
      goBack={handleGoBackPress}
      headerTitle={I18n.t("idpay.onboarding.headerTitle")}
      contextualHelp={emptyContextualHelp}
    >
      <LoadingSpinnerOverlay isLoading={isLoading} loadingOpacity={100}>
        <SafeAreaView style={IOStyles.flex}>
          <ScrollView
            onLayout={handleScrollViewLayout}
            onContentSizeChange={handleScrollViewContentSizeChange}
            onScroll={handleScrollViewOnScroll}
            scrollEventThrottle={400}
            style={IOStyles.flex}
          >
            <View style={IOStyles.horizontalContentPadding}>
              {serviceHeaderComponent}
              <VSpacer size={16} />
              {descriptionComponent}
              <VSpacer size={16} />
              <ItemSeparatorComponent noPadded={true} />
              <VSpacer size={16} />
              {onboardingPrivacyAdvice}
              <VSpacer size={16} />
            </View>
            <VSpacer size={16} />
          </ScrollView>
          <FooterWithButtons
            type={"TwoButtonsInlineThird"}
            leftButton={{
              bordered: true,
              title: I18n.t("global.buttons.cancel"),
              onPress: handleGoBackPress,
              testID: "IDPayOnboardingCancel"
            }}
            rightButton={{
              title: I18n.t("global.buttons.continue"),
              onPress: handleContinuePress,
              testID: "IDPayOnboardingContinue",
              isLoading: isAcceptingTos,
              disabled: isContinueButtonDisabled || isAcceptingTos
            }}
          />
        </SafeAreaView>
      </LoadingSpinnerOverlay>
    </BaseScreenComponent>
  );
};

export type { InitiativeDetailsScreenRouteParams };

export default InitiativeDetailsScreen;
