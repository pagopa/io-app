import { Banner, ContentWrapper, VStack } from "@pagopa/io-app-design-system";
import { useFocusEffect } from "@react-navigation/native";
import { constNull } from "fp-ts/lib/function";
import I18n from "i18next";
import { Alert } from "react-native";

import IOMarkdown from "../../../../components/IOMarkdown";
import { IOScrollViewWithLargeHeader } from "../../../../components/ui/IOScrollViewWithLargeHeader";
import { useIODispatch } from "../../../../store/hooks";
import { useAvoidHardwareBackButton } from "../../../../utils/useAvoidHardwareBackButton";
import { logoutRequest } from "../../../authentication/common/store/actions";
import { useItwDisableGestureNavigation } from "../../common/hooks/useItwDisableGestureNavigation";
import { trackItwIdNotMatch, trackWalletNewIdReset } from "../analytics";
import {
  itwLifecycleIdentityCheckCompleted,
  itwLifecycleWalletReset
} from "../store/actions";

export const ItwIdentityNotMatchingScreen = () => {
  useAvoidHardwareBackButton();
  useItwDisableGestureNavigation();

  useFocusEffect(trackItwIdNotMatch);

  const dispatch = useIODispatch();

  const resetWallet = () => {
    dispatch(itwLifecycleWalletReset());
    dispatch(itwLifecycleIdentityCheckCompleted());
    trackWalletNewIdReset();
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
      goBack={handleCancel}
      headerActionsProp={{ showHelp: true }}
      title={{
        label: I18n.t("features.itWallet.notMatchingIdentityScreen.title")
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
            color="neutral"
            content={I18n.t(
              "features.itWallet.notMatchingIdentityScreen.banner.title"
            )}
            pictogramName="security"
          />
        </VStack>
      </ContentWrapper>
    </IOScrollViewWithLargeHeader>
  );
};
