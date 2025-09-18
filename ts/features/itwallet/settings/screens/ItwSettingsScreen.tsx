import {
  ButtonSolidProps,
  ContentWrapper,
  IOToast,
  VStack
} from "@pagopa/io-app-design-system";
import { TxtLinkNode } from "@textlint/ast-node-types";
import I18n from "i18next";
import { useCallback, useMemo } from "react";
import { Alert, View } from "react-native";
import IOMarkdown from "../../../../components/IOMarkdown";
import { linkNodeToReactNative } from "../../../../components/IOMarkdown/renderRules";
import { Renderer } from "../../../../components/IOMarkdown/types";
import { IOScrollViewWithLargeHeader } from "../../../../components/ui/IOScrollViewWithLargeHeader";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { useIOSelector } from "../../../../store/hooks";
import { trackWalletStartDeactivation } from "../../analytics";
import { ItwEidLifecycleAlert } from "../../common/components/ItwEidLifecycleAlert";
import { itwLifecycleIsITWalletValidSelector } from "../../lifecycle/store/selectors";
import { ItwEidIssuanceMachineContext } from "../../machine/eid/provider";
import { ITW_ROUTES } from "../../navigation/routes";

const ItwSettingsScreen = () => {
  const navigation = useIONavigation();
  const machineRef = ItwEidIssuanceMachineContext.useActorRef();
  const isWalletValid = useIOSelector(itwLifecycleIsITWalletValidSelector);

  const handleRevokeOnPress = useCallback(() => {
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

  const handleObtainItwOnPress = useCallback(
    () =>
      navigation.navigate(ITW_ROUTES.MAIN, {
        screen: ITW_ROUTES.DISCOVERY.INFO,
        params: { isL3: true }
      }),
    [navigation]
  );

  const ctaProps: ButtonSolidProps = useMemo(
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
