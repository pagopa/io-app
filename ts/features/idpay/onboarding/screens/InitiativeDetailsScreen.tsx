/* eslint-disable functional/immutable-data */
import * as pot from "@pagopa/ts-commons/lib/pot";
import { RouteProp, useRoute } from "@react-navigation/native";
import { useSelector } from "@xstate/react";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import * as React from "react";
import { SafeAreaView, ScrollView, Text, View } from "react-native";
import { ServiceId } from "../../../../../definitions/backend/ServiceId";
import ItemSeparatorComponent from "../../../../components/ItemSeparatorComponent";
import LoadingSpinnerOverlay from "../../../../components/LoadingSpinnerOverlay";
import OrganizationHeader from "../../../../components/OrganizationHeader";
import { VSpacer } from "../../../../components/core/spacer/Spacer";
import { Body } from "../../../../components/core/typography/Body";
import { LabelSmall } from "../../../../components/core/typography/LabelSmall";
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
import { useInitiativeDetailsScrolling } from "../utility/hooks";
import { useOnboardingMachineService } from "../xstate/provider";
import { initiativeIDSelector, isUpsertingSelector } from "../xstate/selectors";

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

  const isAcceptingTos = useSelector(machine, isUpsertingSelector);
  const initiativeId = useSelector(machine, initiativeIDSelector);
  const { serviceId } = route.params;
  const {
    scrollViewRef,
    onScrollViewSizeChange,
    scrollToEnd,
    handleIsScrollEnd,
    requiresScrolling,
    setMarkdownIsLoaded,
    isLoading,
    description
  } = useInitiativeDetailsScrolling();

  React.useEffect(() => {
    machine.send({
      type: "SELECT_INITIATIVE",
      serviceId
    });
  }, [machine, serviceId]);
  const handleGoBackPress = () => {
    machine.send({ type: "QUIT_ONBOARDING" });
  };
  const handleContinuePress = () =>
    requiresScrolling ? scrollToEnd() : machine.send({ type: "ACCEPT_TOS" });

  // TODO show initaitveID for testing purposes
  const headerContent = pipe(
    O.fromNullable(initiativeId),
    O.map(id => `Initiative ID: ${id}`),
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
        onScroll={({ nativeEvent }) => handleIsScrollEnd(nativeEvent)}
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
