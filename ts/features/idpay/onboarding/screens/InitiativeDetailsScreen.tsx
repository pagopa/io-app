/* eslint-disable functional/immutable-data */
import * as pot from "@pagopa/ts-commons/lib/pot";
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
import { ServiceId } from "../../../../../definitions/backend/ServiceId";
import ItemSeparatorComponent from "../../../../components/ItemSeparatorComponent";
import LoadingSpinnerOverlay from "../../../../components/LoadingSpinnerOverlay";
import OrganizationHeader from "../../../../components/OrganizationHeader";
import { VSpacer } from "../../../../components/core/spacer/Spacer";
import { Body } from "../../../../components/core/typography/Body";
import { LabelSmall } from "../../../../components/core/typography/LabelSmall";
import { IOColors } from "../../../../components/core/variables/IOColors";
import { IOStyles } from "../../../../components/core/variables/IOStyles";
import BaseScreenComponent from "../../../../components/screens/BaseScreenComponent";
import FooterWithButtons from "../../../../components/ui/FooterWithButtons";
import Markdown from "../../../../components/ui/Markdown";
import I18n from "../../../../i18n";
import { useIOSelector } from "../../../../store/hooks";
import { serviceByIdSelector } from "../../../../store/reducers/entities/services/servicesById";
import { toUIService } from "../../../../store/reducers/entities/services/transformers";
import { UIService } from "../../../../store/reducers/entities/services/types";
import { emptyContextualHelp } from "../../../../utils/emptyContextualHelp";
import { showToast } from "../../../../utils/showToast";
import { openWebUrl } from "../../../../utils/url";
import { IDPayOnboardingParamsList } from "../navigation/navigator";
import { useOnboardingMachineService } from "../xstate/provider";
import {
  initiativeDescriptionSelector,
  isLoadingSelector,
  isUpsertingSelector
} from "../xstate/selectors";

type InitiativeDetailsScreenRouteParams = {
  serviceId: string;
};

type InitiativeDetailsRouteProps = RouteProp<
  IDPayOnboardingParamsList,
  "IDPAY_ONBOARDING_INITIATIVE_DETAILS"
>;

const InitiativeOrganizationHeader = ({
  name,
  organizationName,
  logoURLs
}: UIService) => (
  <OrganizationHeader
    serviceName={name}
    organizationName={organizationName}
    logoURLs={logoURLs}
  />
);

type BeforeContinueBodyProps = {
  tosUrl?: string;
  privacyUrl?: string;
};

const BeforeContinueBody = (props: BeforeContinueBodyProps) => {
  const { tosUrl, privacyUrl } = props;

  const handlePrivacyLinkPress = () => {
    if (privacyUrl !== undefined) {
      openWebUrl(privacyUrl, () => showToast(I18n.t("global.jserror.title")));
    }
  };

  const handleTosLinkPress = () => {
    if (tosUrl !== undefined) {
      openWebUrl(tosUrl, () => showToast(I18n.t("global.jserror.title")));
    }
  };

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

  const isAcceptingTos = useSelector(machine, isUpsertingSelector);
  const isLoading = useSelector(machine, isLoadingSelector);
  const description = useSelector(machine, initiativeDescriptionSelector);

  const hasDescription = description !== undefined;

  const [needsScrolling, setNeedsScrolling] = React.useState(true);
  const [hasScrolled, setHasScrolled] = React.useState(false);
  const scrollViewHeightRef = React.useRef(0);
  const isContinueButtonDisabled =
    isLoading || (hasDescription && needsScrolling && !hasScrolled);
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
  const scrollViewRef = React.useRef<ScrollView>(null);
  const handleGoBackPress = () => {
    machine.send({ type: "QUIT_ONBOARDING" });
  };
  const handleContinuePress = () =>
    isContinueButtonDisabled
      ? scrollViewRef.current?.scrollToEnd()
      : machine.send({ type: "ACCEPT_TOS" });

  const service = pipe(
    pot.toOption(
      useIOSelector(serviceByIdSelector(serviceId as ServiceId)) || pot.none
    ),
    O.toUndefined
  );

  const setMarkdownIsLoaded = () => (isMarkdownLoadedRef.current = true);

  const screenContent = () => (
    <SafeAreaView style={IOStyles.flex}>
      <ScrollView
        onLayout={handleScrollViewLayout}
        onContentSizeChange={handleScrollViewContentSizeChange}
        onScroll={handleScrollViewOnScroll}
        scrollEventThrottle={400}
        ref={scrollViewRef}
        style={IOStyles.flex}
      >
        <View style={IOStyles.horizontalContentPadding}>
          {service !== undefined && (
            <InitiativeOrganizationHeader {...toUIService(service)} />
          )}
          <VSpacer size={16} />
          {description !== undefined && (
            <Markdown onLoadEnd={setMarkdownIsLoaded}>{description}</Markdown>
          )}
          <VSpacer size={16} />
          <ItemSeparatorComponent noPadded={true} />
          <VSpacer size={16} />
          <BeforeContinueBody
            tosUrl={service?.service_metadata?.tos_url}
            privacyUrl={service?.service_metadata?.privacy_url}
          />
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
          style: isContinueButtonDisabled
            ? {
                flex: 2,
                backgroundColor: IOColors.grey
              }
            : { flex: 2 },
          // the style prop overrides the default style of the button,
          // so we need to add the flex: 2 property for consistency
          isLoading: isAcceptingTos,
          disabled: isAcceptingTos
        }}
      />
    </SafeAreaView>
  );

  return (
    <BaseScreenComponent
      goBack={handleGoBackPress}
      headerTitle={I18n.t("idpay.onboarding.headerTitle")}
      contextualHelp={emptyContextualHelp}
    >
      <LoadingSpinnerOverlay isLoading={isLoading} loadingOpacity={100}>
        {isLoading ? null : screenContent()}
      </LoadingSpinnerOverlay>
    </BaseScreenComponent>
  );
};

export type { InitiativeDetailsScreenRouteParams };

export default InitiativeDetailsScreen;
