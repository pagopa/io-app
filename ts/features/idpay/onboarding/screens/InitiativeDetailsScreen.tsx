/* eslint-disable functional/immutable-data */
import * as pot from "@pagopa/ts-commons/lib/pot";
import { RouteProp, useRoute } from "@react-navigation/native";
import * as React from "react";
import { pipe } from "fp-ts/lib/function";
import { useActor } from "@xstate/react";
import * as O from "fp-ts/lib/Option";
import {
  View,
  SafeAreaView,
  ScrollView,
  Text,
  useWindowDimensions,
  NativeScrollEvent
} from "react-native";
import { IOStyles } from "../../../../components/core/variables/IOStyles";
import OrganizationHeader from "../../../../components/OrganizationHeader";
import BaseScreenComponent from "../../../../components/screens/BaseScreenComponent";
import FooterWithButtons from "../../../../components/ui/FooterWithButtons";
import Markdown from "../../../../components/ui/Markdown";
import ItemSeparatorComponent from "../../../../components/ItemSeparatorComponent";
import { Body } from "../../../../components/core/typography/Body";
import { LabelSmall } from "../../../../components/core/typography/LabelSmall";
import { UIService } from "../../../../store/reducers/entities/services/types";
import { useIOSelector } from "../../../../store/hooks";
import { serviceByIdSelector } from "../../../../store/reducers/entities/services/servicesById";
import { toUIService } from "../../../../store/reducers/entities/services/transformers";
import { showToast } from "../../../../utils/showToast";
import { openWebUrl } from "../../../../utils/url";
import { IDPayOnboardingParamsList } from "../navigation/navigator";
import { useOnboardingMachineService } from "../xstate/provider";
import { ServiceId } from "../../../../../definitions/backend/ServiceId";
import LoadingSpinnerOverlay from "../../../../components/LoadingSpinnerOverlay";
import { emptyContextualHelp } from "../../../../utils/emptyContextualHelp";
import { LOADING_TAG, UPSERTING_TAG } from "../../../../utils/xstate";
import I18n from "../../../../i18n";
import { VSpacer } from "../../../../components/core/spacer/Spacer";

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
  const onboardingMachineService = useOnboardingMachineService();
  const [state, send] = useActor(onboardingMachineService);

  const [requiresScrolling, setRequiresScrolling] = React.useState(true);
  const markdDownIsLoadingRef = React.useRef<boolean>(true);
  const screenHeight = useWindowDimensions().height;
  const scrollViewRef = React.useRef<ScrollView>(null);
  const isLoading = state.tags.has(LOADING_TAG);
  const isAcceptingTos = state.tags.has(UPSERTING_TAG);
  const { serviceId } = route.params;

  React.useEffect(() => {
    send({
      type: "SELECT_INITIATIVE",
      serviceId
    });
  }, [send, serviceId]);
  const handleGoBackPress = () => {
    send({ type: "QUIT_ONBOARDING" });
  };
  const handleContinuePress = () =>
    requiresScrolling ? scrollToEnd() : send({ type: "ACCEPT_TOS" });

  const onScrollViewSizeChange = (_: number, height: number) => {
    if (!markdDownIsLoadingRef.current) {
      setRequiresScrolling(height >= screenHeight);
    }
  };

  const scrollToEnd = () => {
    if (!markdDownIsLoadingRef.current) {
      scrollViewRef.current?.scrollToEnd();
      setRequiresScrolling(false);
    }
  };

  // required in order to detect the scroll end
  const isCloseToBottom = ({
    layoutMeasurement,
    contentOffset,
    contentSize
  }: NativeScrollEvent) => {
    const paddingToBottom = 20;
    return (
      layoutMeasurement.height + contentOffset.y >=
      contentSize.height - paddingToBottom
    );
  };

  // TODO show initaitveID for testing purposes
  const headerContent = pipe(
    O.fromNullable(state.context.initiative),
    O.map(initiative => `Initiative ID: ${initiative.initiativeId}`),
    O.toUndefined
  );
  const service = pipe(
    pot.toOption(
      useIOSelector(serviceByIdSelector(serviceId as ServiceId)) || pot.none
    ),
    O.toUndefined
  );

  const screenContent = () => (
    <SafeAreaView style={IOStyles.flex}>
      <ScrollView
        onContentSizeChange={onScrollViewSizeChange}
        onScroll={({ nativeEvent }) => {
          if (isCloseToBottom(nativeEvent)) {
            setRequiresScrolling(false);
          }
        }}
        scrollEventThrottle={400}
        ref={scrollViewRef}
        style={IOStyles.flex}
      >
        <View style={IOStyles.horizontalContentPadding}>
          {service !== undefined && (
            <InitiativeOrganizationHeader {...toUIService(service)} />
          )}
          {headerContent && <Text>{headerContent}</Text>}
          <VSpacer size={16} />
          {state.context.initiative?.description !== undefined ? (
            <Markdown onLoadEnd={() => (markdDownIsLoadingRef.current = false)}>
              {state.context.initiative.description}
            </Markdown>
          ) : (
            (markdDownIsLoadingRef.current = false)
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
          gray: requiresScrolling,
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
