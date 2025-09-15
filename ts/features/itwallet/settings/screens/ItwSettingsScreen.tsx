import {
  ButtonSolidProps,
  ContentWrapper,
  IOToast,
  VStack
} from "@pagopa/io-app-design-system";
import { TxtLinkNode } from "@textlint/ast-node-types";
import I18n from "i18next";
import { useCallback, useMemo } from "react";
import { Alert } from "react-native";
import IOMarkdown from "../../../../components/IOMarkdown";
import { linkNodeToReactNative } from "../../../../components/IOMarkdown/renderRules";
import { Renderer } from "../../../../components/IOMarkdown/types";
import { IOScrollViewWithLargeHeader } from "../../../../components/ui/IOScrollViewWithLargeHeader";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { useIOSelector } from "../../../../store/hooks";
import { trackWalletStartDeactivation } from "../../analytics";
import { ItwEidLifecycleAlert } from "../../common/components/ItwEidLifecycleAlert";
import { itwIsL3EnabledSelector } from "../../common/store/selectors/preferences";
import {
  itwLifecycleIsITWalletValidSelector,
  itwLifecycleIsValidSelector
} from "../../lifecycle/store/selectors";
import { ItwEidIssuanceMachineContext } from "../../machine/eid/provider";
import { ITW_ROUTES } from "../../navigation/routes";

const ItwSettingsScreen = () => {
  const navigation = useIONavigation();
  const machineRef = ItwEidIssuanceMachineContext.useActorRef();
  const isWalletValid = useIOSelector(itwLifecycleIsValidSelector);
  const isItwValid = useIOSelector(itwLifecycleIsITWalletValidSelector);
  const isL3Enabled = useIOSelector(itwIsL3EnabledSelector);

  const handleRevokePress = useCallback(() => {
    trackWalletStartDeactivation("ITW_PID");
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

  const handleGetItwPress = useCallback(
    () =>
      navigation.navigate(ITW_ROUTES.MAIN, {
        screen: ITW_ROUTES.DISCOVERY.INFO,
        params: { isL3: isL3Enabled }
      }),
    [navigation, isL3Enabled]
  );

  const ctaProps: ButtonSolidProps = useMemo(() => {
    if (isItwValid) {
      return {
        label: I18n.t("features.itWallet.settings.manage.cta.disable"),
        accessibilityLabel: I18n.t(
          "features.itWallet.settings.manage.cta.disable"
        ),
        color: "danger",
        onPress: handleRevokePress
      };
    }
    return {
      label: I18n.t("features.itWallet.settings.manage.cta.activate"),
      accessibilityLabel: I18n.t(
        "features.itWallet.settings.manage.cta.activate"
      ),
      onPress: handleGetItwPress
    };
  }, [isItwValid, handleRevokePress, handleGetItwPress]);

  return (
    <IOScrollViewWithLargeHeader
      title={{ label: I18n.t("features.itWallet.settings.manage.title") }}
      actions={{
        type: "SingleButton",
        primary: ctaProps
      }}
    >
      <ContentWrapper>
        <VStack space={24}>
          <IOMarkdown
            content={
              isItwValid
                ? I18n.t("features.itWallet.settings.manage.content.active")
                : isWalletValid
                ? I18n.t("features.itWallet.settings.manage.content.upgrade")
                : I18n.t("features.itWallet.settings.manage.content.disabled")
            }
            // TODO [SIW-2632] remove this rule and add IT Wallet url to I18n locales
            rules={generateLinkRuleWithCallback()}
          />
          <ItwEidLifecycleAlert navigation={navigation} />
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
      () => {
        IOToast.info(
          I18n.t("features.itWallet.generic.featureUnavailable.title")
        );
      },
      render
    );
  }
});

export { ItwSettingsScreen };
