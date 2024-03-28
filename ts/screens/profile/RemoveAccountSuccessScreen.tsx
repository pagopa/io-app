import {
  BlockButtonProps,
  Body,
  ContentWrapper,
  FooterWithButtons,
  H2,
  IOVisualCostants,
  VSpacer
} from "@pagopa/io-app-design-system";
import * as React from "react";
import { useState } from "react";
import { Image, Platform, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { connect } from "react-redux";
import expiredIcon from "../../../img/wallet/errors/payment-expired-icon.png";
import { useHardwareBackButton } from "../../hooks/useHardwareBackButton";
import I18n from "../../i18n";
import {
  AppParamsList,
  IOStackNavigationRouteProps
} from "../../navigation/params/AppParamsList";
import { logoutRequest } from "../../store/actions/authentication";
import { Dispatch } from "../../store/actions/types";

type Props = IOStackNavigationRouteProps<AppParamsList> &
  ReturnType<typeof mapDispatchToProps>;

/**
 * A screen to explain how the account removal works.
 * Here user can ask to delete his account
 */
const RemoveAccountSuccess: React.FunctionComponent<Props> = props => {
  const [footerHeight, setFooterHeight] = useState(0);
  const insets = useSafeAreaInsets();
  // do nothing
  useHardwareBackButton(() => true);

  const continueButtonProps: BlockButtonProps = {
    type: "Outline",
    buttonProps: {
      color: "primary",
      label: I18n.t("profile.main.privacy.removeAccount.success.cta"),
      accessibilityLabel: I18n.t(
        "profile.main.privacy.removeAccount.success.cta"
      ),
      onPress: props.logout
    }
  };

  const footerComponent = (
    <FooterWithButtons
      sticky
      onLayoutChange={setFooterHeight}
      type={"SingleButton"}
      primary={continueButtonProps}
    />
  );

  return (
    <View style={{ flexGrow: 1 }}>
      {/* This extra View is mandatory when you have a fixed
        bottom component to get a consistent behavior
        across platforms */}
      <View style={{ flexGrow: 1, paddingBottom: footerHeight }}>
        <ScrollView
          centerContent
          contentContainerStyle={[
            { paddingTop: insets.top },
            /* Android fallback because `centerContent`
              is only an iOS property */
            Platform.OS === "android" && {
              flexGrow: 1,
              justifyContent: "center"
            }
          ]}
        >
          <ContentWrapper>
            <View
              style={{
                alignItems: "center",
                paddingVertical: IOVisualCostants.appMarginDefault
              }}
            >
              <Image accessibilityIgnoresInvertColors source={expiredIcon} />
              <VSpacer size={16} />
              <H2 style={{ textAlign: "center" }}>
                {I18n.t("profile.main.privacy.removeAccount.success.title")}
              </H2>
              <VSpacer size={16} />
              <Body style={{ textAlign: "center" }}>
                {I18n.t("profile.main.privacy.removeAccount.success.body")}
              </Body>
            </View>
          </ContentWrapper>
        </ScrollView>
      </View>
      {footerComponent}
    </View>
  );
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
  // hard-logout
  logout: () => dispatch(logoutRequest())
});

export default connect(undefined, mapDispatchToProps)(RemoveAccountSuccess);
