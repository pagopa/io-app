/* eslint-disable functional/immutable-data */
import { RouteProp, useRoute } from "@react-navigation/native";
import { useSelector } from "@xstate/react";
import { sequenceS } from "fp-ts/lib/Apply";
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
import { VSpacer } from "../../../../components/core/spacer/Spacer";
import { Body } from "../../../../components/core/typography/Body";
import { LabelSmall } from "../../../../components/core/typography/LabelSmall";
import { IOStyles } from "../../../../components/core/variables/IOStyles";
import BaseScreenComponent from "../../../../components/screens/BaseScreenComponent";
import FooterWithButtons from "../../../../components/ui/FooterWithButtons";
import Markdown from "../../../../components/ui/Markdown";
import I18n from "../../../../i18n";
import { emptyContextualHelp } from "../../../../utils/emptyContextualHelp";
import { showToast } from "../../../../utils/showToast";
import { openWebUrl } from "../../../../utils/url";
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

type BeforeContinueBodyProps = {
  tosUrl: string;
  privacyUrl: string;
};

const BeforeContinueBody = (props: BeforeContinueBodyProps) => {
  const { tosUrl, privacyUrl } = props;

  const handlePrivacyLinkPress = () =>
    openWebUrl(privacyUrl, () => showToast(I18n.t("global.jserror.title")));

  const handleTosLinkPress = () =>
    openWebUrl(tosUrl, () => showToast(I18n.t("global.jserror.title")));

  return (
    <Body accessibilityRole="link" testID="IDPayOnboardingBeforeContinue">
      <LabelSmall weight={"Regular"} color={"bluegrey"}>
        {I18n.t("idpay.onboarding.beforeContinue.text1")}
      </LabelSmall>
      <LabelSmall
        color={"blue"}
        onPress={handleTosLinkPress}
        testID="IDPayOnboardingPrivacyLink"
      >
        {I18n.t("idpay.onboarding.beforeContinue.tosLink")}
      </LabelSmall>
      <LabelSmall weight={"Regular"} color={"bluegrey"}>
        {I18n.t("idpay.onboarding.beforeContinue.text2")}
      </LabelSmall>
      <LabelSmall
        color={"blue"}
        onPress={handlePrivacyLinkPress}
        testID="IDPayOnboardingTOSLink"
      >
        {I18n.t("idpay.onboarding.beforeContinue.privacyLink")}
      </LabelSmall>
    </Body>
  );
};

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

  const beforeContinueComponent = pipe(
    sequenceS(O.option)({
      privacyUrl: pipe(initiative?.privacyLink, O.fromNullable),
      tosUrl: pipe(initiative?.tcLink, O.fromNullable)
    }),
    O.map(props => <BeforeContinueBody key={"tos"} {...props} />),
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
              <VSpacer size={16} />
              {descriptionComponent}
              <VSpacer size={16} />
              <ItemSeparatorComponent noPadded={true} />
              <VSpacer size={16} />
              {beforeContinueComponent}
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
