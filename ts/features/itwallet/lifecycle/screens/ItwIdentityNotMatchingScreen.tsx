import { useFocusEffect } from "@react-navigation/native";
import { Banner, ContentWrapper, VStack } from "@pagopa/io-app-design-system";
import { Alert } from "react-native";
import { constNull } from "fp-ts/lib/function";
import I18n from "i18next";
import {
  itwLifecycleIdentityCheckCompleted,
  itwLifecycleWalletReset
} from "../store/actions";
import { logoutRequest } from "../../../authentication/common/store/actions";
import { useAvoidHardwareBackButton } from "../../../../utils/useAvoidHardwareBackButton";
import { useIODispatch, useIOStore } from "../../../../store/hooks";
import { trackItwIdNotMatch, trackWalletNewIdReset } from "../../analytics";
import { IOScrollViewWithLargeHeader } from "../../../../components/ui/IOScrollViewWithLargeHeader";
import { useItwDisableGestureNavigation } from "../../common/hooks/useItwDisableGestureNavigation";
import IOMarkdown from "../../../../components/IOMarkdown";

export const ItwIdentityNotMatchingScreen = () => {
  useAvoidHardwareBackButton();
  useItwDisableGestureNavigation();

  useFocusEffect(trackItwIdNotMatch);

  const dispatch = useIODispatch();
  const store = useIOStore();

  const resetWallet = () => {
    dispatch(itwLifecycleWalletReset());
    dispatch(itwLifecycleIdentityCheckCompleted());
    trackWalletNewIdReset(store.getState());
  };

  const handleCancel = () => {
    Alert.alert(
      I18n.t("features.itWallet.notMatchingIdentityScreen.alert.title"),
      I18n.t("features.itWallet.notMatchingIdentityScreen.alert.message"),
      [
        {
          text: I18n.t("global.buttons.exit"),
          style: "destructive",
          onPress: () => dispatch(logoutRequest({ withApiCall: true }))
        },
        {
          text: I18n.t("global.buttons.cancel"),
          onPress: constNull // Do nothing, just dismiss the alert
        }
      ],
      { cancelable: false }
    );
  };

  return (
    <IOScrollViewWithLargeHeader
      title={{
        label: I18n.t("features.itWallet.notMatchingIdentityScreen.title")
      }}
      headerActionsProp={{ showHelp: true }}
      goBack={handleCancel}
      actions={{
        type: "TwoButtons",
        primary: {
          label: I18n.t("global.buttons.continue"),
          onPress: resetWallet
        },
        secondary: {
          label: I18n.t("global.buttons.exit"),
          onPress: handleCancel
        }
      }}
    >
      <ContentWrapper>
        <VStack space={24}>
          <IOMarkdown
            content={I18n.t(
              "features.itWallet.notMatchingIdentityScreen.message"
            )}
          />
          <Banner
            content={I18n.t(
              "features.itWallet.notMatchingIdentityScreen.banner.title"
            )}
            pictogramName="security"
            color="neutral"
          />
        </VStack>
      </ContentWrapper>
    </IOScrollViewWithLargeHeader>
  );
};
