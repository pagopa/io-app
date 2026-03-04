import { ContentWrapper, IOToast, VStack } from "@pagopa/io-app-design-system";
import { useFocusEffect } from "@react-navigation/native";
import { TxtLinkNode } from "@textlint/ast-node-types";
import I18n from "i18next";
import { useCallback, useMemo } from "react";
import { Alert, View } from "react-native";
import IOMarkdown from "../../../../components/IOMarkdown";
import { linkNodeToReactNative } from "../../../../components/IOMarkdown/renderRules";
import { Renderer } from "../../../../components/IOMarkdown/types";
import { IOScrollViewWithLargeHeader } from "../../../../components/ui/IOScrollViewWithLargeHeader";
import { ButtonBlockProps } from "../../../../components/ui/utils/buttons";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { useIOSelector } from "../../../../store/hooks";
import {
  trackItwSettings,
  trackItwStartActivation,
  trackItwStartDeactivation
} from "../../analytics";
import { ItwEidLifecycleAlert } from "../../common/components/ItwEidLifecycleAlert";
import { itwLifecycleIsITWalletValidSelector } from "../../lifecycle/store/selectors";
import { ItwEidIssuanceMachineContext } from "../../machine/eid/provider";
import { ITW_ROUTES } from "../../navigation/routes";
import { ITW_SCREENVIEW_EVENTS } from "../../analytics/enum";

const MIXPANEL_SCREEN_NAME = ITW_SCREENVIEW_EVENTS.ITW_SETTINGS;

const ItwSettingsScreen = () => {
  const navigation = useIONavigation();
  const machineRef = ItwEidIssuanceMachineContext.useActorRef();
  const isWalletValid = useIOSelector(itwLifecycleIsITWalletValidSelector);

  useFocusEffect(trackItwSettings);

  const handleRevokeOnPress = useCallback(() => {
    trackItwStartDeactivation({
      credential: "ITW_PID",
      screen_name: MIXPANEL_SCREEN_NAME
    });
    Alert.alert(
      I18n.t("features.itWallet.presentation.itWalletId.dialog.revoke.title"),
      I18n.t("features.itWallet.presentation.itWalletId.dialog.revoke.message"),
      [
        {
          text: I18n.t(
            "features.itWallet.presentation.itWalletId.dialog.revoke.confirm"
          ),
          style: "destructive",
          onPress: () => machineRef.send({ type: "revoke-wallet-instance" })
        },
        {
          text: I18n.t(
            "features.itWallet.presentation.itWalletId.dialog.revoke.cancel"
          ),
          style: "cancel"
        }
      ]
    );
  }, [machineRef]);

  const handleObtainItwOnPress = useCallback(() => {
    trackItwStartActivation(MIXPANEL_SCREEN_NAME);
    navigation.navigate(ITW_ROUTES.MAIN, {
      screen: ITW_ROUTES.DISCOVERY.INFO,
      params: { level: "l3" }
    });
  }, [navigation]);

  const ctaProps: ButtonBlockProps = useMemo(
    () => ({
      label: I18n.t(
        `features.itWallet.settings.manage.cta.${
          isWalletValid ? "revoke" : "obtain"
        }`
      ),
      testID: isWalletValid ? "itwRevokeButtonTestID" : "itwObtainButtonTestID",
      onPress: isWalletValid ? handleRevokeOnPress : handleObtainItwOnPress,
      color: isWalletValid ? "danger" : "primary"
    }),
    [isWalletValid, handleRevokeOnPress, handleObtainItwOnPress]
  );

  return (
    <IOScrollViewWithLargeHeader
      title={{ label: I18n.t("features.itWallet.settings.manage.title") }}
      description={I18n.t("features.itWallet.settings.manage.description")}
      actions={{
        type: "SingleButton",
        primary: ctaProps
      }}
    >
      <ContentWrapper>
        <VStack space={8}>
          <View />
          {isWalletValid && <ItwEidLifecycleAlert navigation={navigation} />}
          <IOMarkdown
            content={I18n.t("features.itWallet.settings.manage.content")}
            // TODO [SIW-2632] remove this rule and add IT Wallet url to I18n locales
            rules={generateLinkRuleWithCallback()}
          />
        </VStack>
      </ContentWrapper>
    </IOScrollViewWithLargeHeader>
  );
};

// Dummy rule to display "Feature not available" toast when a link is pressed
// TODO Should be removed after [SIW-2632]
export const generateLinkRuleWithCallback = () => ({
  Link(link: TxtLinkNode, render: Renderer) {
    return linkNodeToReactNative(
      link,
      {
        onPress: () => {
          IOToast.info(
            I18n.t("features.itWallet.generic.featureUnavailable.title")
          );
        }
      },
      render
    );
  }
});

export { ItwSettingsScreen };
