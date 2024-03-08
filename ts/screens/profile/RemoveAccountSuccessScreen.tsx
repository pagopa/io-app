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
import expiredIcon from "../../../img/wallet/errors/payment-expired-icon.png";
import { useHardwareBackButton } from "../../hooks/useHardwareBackButton";
import I18n from "../../i18n";
import { logoutRequest } from "../../store/actions/authentication";
import { useIODispatch } from "../../store/hooks";

/**
 * A screen to explain how the account removal works.
 * Here user can ask to delete his account
 */
const RemoveAccountSuccess = () => {
  const [footerHeight, setFooterHeight] = useState(0);
  const dispatch = useIODispatch();
  const insets = useSafeAreaInsets();
  // do nothing
  useHardwareBackButton(() => true);

  const logout = React.useCallback(() => dispatch(logoutRequest()), [dispatch]);

  const continueButtonProps: BlockButtonProps = {
    type: "Outline",
    buttonProps: {
      color: "primary",
      label: I18n.t("profile.main.privacy.removeAccount.success.cta"),
      accessibilityLabel: I18n.t(
        "profile.main.privacy.removeAccount.success.cta"
      ),
      onPress: logout
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
              <Image source={expiredIcon} />
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

export default RemoveAccountSuccess;
