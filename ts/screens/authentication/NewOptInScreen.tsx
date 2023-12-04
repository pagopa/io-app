import React from "react";
import { Dimensions, View } from "react-native";
import {
  Badge,
  ContentWrapper,
  FeatureInfo,
  GradientScrollView,
  H3,
  IOStyles,
  Pictogram,
  VSpacer
} from "@pagopa/io-app-design-system";
import { useNavigation } from "@react-navigation/native";
import BaseScreenComponent, {
  ContextualHelpPropsMarkdown
} from "../../components/screens/BaseScreenComponent";
import { useIOBottomSheetAutoresizableModal } from "../../utils/hooks/bottomSheet";
import ROUTES from "../../navigation/routes";
import { AuthenticationParamsList } from "../../navigation/params/AuthenticationParamsList";
import { IOStackNavigationRouteProps } from "../../navigation/params/AppParamsList";
import I18n from "../../i18n";
import { setFastLoginOptIn } from "../../features/fastLogin/store/actions/optInActions";
import { useIODispatch } from "../../store/hooks";
import SecuritySuggestions from "../../features/fastLogin/components/SecuritySuggestions";

const contextualHelpMarkdown: ContextualHelpPropsMarkdown = {
  title: "authentication.opt_in.contextualHelpTitle",
  body: "authentication.opt_in.contextualHelpContent"
};

export type ChosenIdentifier = {
  identifier: "SPID" | "CIE";
};

type Props = IOStackNavigationRouteProps<
  AuthenticationParamsList,
  "AUTHENTICATION_OPT_IN"
>;

const NewOptInScreen = (props: Props) => {
  const dispatch = useIODispatch();

  const navigation = useNavigation();

  const navigateToIdpPage = (isLV: boolean) => {
    navigation.navigate(ROUTES.AUTHENTICATION, {
      screen:
        props.route.params.identifier === "CIE"
          ? ROUTES.CIE_PIN_SCREEN
          : ROUTES.AUTHENTICATION_IDP_SELECTION
    });
    dispatch(setFastLoginOptIn({ enabled: isLV }));
  };

  const {
    present: presentVeryLongAutoresizableBottomSheetWithFooter,
    bottomSheet: veryLongAutoResizableBottomSheetWithFooter
  } = useIOBottomSheetAutoresizableModal({
    title: I18n.t("authentication.opt_in.security_suggests"),
    component: <SecuritySuggestions />,
    fullScreen: true
  });

  return (
    <BaseScreenComponent
      goBack={true}
      contextualHelpMarkdown={contextualHelpMarkdown}
    >
      <GradientScrollView
        testID="container-test"
        primaryActionProps={{
          label: I18n.t("authentication.opt_in.button_accept_lv"),
          accessibilityLabel: I18n.t("authentication.opt_in.button_accept_lv"),
          onPress: () => navigateToIdpPage(true),
          testID: "accept-button-test"
        }}
        secondaryActionProps={{
          label: I18n.t("authentication.opt_in.button_decline_lv"),
          accessibilityLabel: I18n.t("authentication.opt_in.button_decline_lv"),
          onPress: () => navigateToIdpPage(false),
          testID: "decline-button-test"
        }}
      >
        <ContentWrapper>
          {Dimensions.get("screen").height > 780 && (
            <View style={IOStyles.selfCenter} testID="pictogram-test">
              <Pictogram name="passcode" size={120} />
            </View>
          )}
          <VSpacer size={24} />
          <View style={IOStyles.selfCenter}>
            <Badge
              text={I18n.t("authentication.opt_in.news")}
              variant="info"
              testID="badge-test"
            />
          </View>
          <VSpacer size={24} />
          <H3
            style={{ textAlign: "center", alignItems: "center" }}
            testID="title-test"
          >
            {I18n.t("authentication.opt_in.title")}
          </H3>
          <VSpacer size={24} />
          <FeatureInfo
            pictogramName="identityCheck"
            body={I18n.t("authentication.opt_in.identity_check")}
          />
          <VSpacer size={24} />
          <FeatureInfo
            pictogramName="passcode"
            body={I18n.t("authentication.opt_in.passcode")}
          />
          <VSpacer size={24} />
          <FeatureInfo
            pictogramName="notification"
            body={I18n.t("authentication.opt_in.notification")}
            actionLabel={I18n.t("authentication.opt_in.security_suggests")}
            actionOnPress={presentVeryLongAutoresizableBottomSheetWithFooter}
          />
        </ContentWrapper>
        {veryLongAutoResizableBottomSheetWithFooter}
      </GradientScrollView>
    </BaseScreenComponent>
  );
};

export default NewOptInScreen;
