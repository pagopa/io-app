import { ListItemAction } from "@pagopa/io-app-design-system";
import { useNavigation } from "@react-navigation/native";
import { Alert } from "react-native";
import I18n from "i18next";
import { IOScrollViewWithLargeHeader } from "../../../../components/ui/IOScrollViewWithLargeHeader";
import { useHeaderSecondLevel } from "../../../../hooks/useHeaderSecondLevel";
import {
  AppParamsList,
  IOStackNavigationProp
} from "../../../../navigation/params/AppParamsList";
import { identificationRequest } from "../../../identification/store/actions";
import { useIODispatch } from "../../../../store/hooks";
import { emptyContextualHelp } from "../../../../utils/contextualHelp";
import { useIdPayInfoCieBottomSheet } from "../components/IdPayInfoCieBottomSheet";
import { IdPayCodeRoutes } from "../navigation/routes";
import { idPayGenerateCode } from "../store/actions";

export const IdPayCodeRenewScreen = () => {
  const navigation = useNavigation<IOStackNavigationProp<AppParamsList>>();
  const dispatch = useIODispatch();

  const { bottomSheet, present: presentCieBottomSheet } =
    useIdPayInfoCieBottomSheet();

  const handleContinue = () => {
    dispatch(idPayGenerateCode.request({}));
    navigation.replace(IdPayCodeRoutes.IDPAY_CODE_MAIN, {
      screen: IdPayCodeRoutes.IDPAY_CODE_DISPLAY,
      params: {
        isOnboarding: false
      }
    });
  };

  const handleConfirm = () => {
    dispatch(
      identificationRequest(
        false,
        true,
        undefined,
        {
          label: I18n.t("global.buttons.cancel"),
          onCancel: () => undefined
        },
        {
          onSuccess: handleContinue
        }
      )
    );
  };

  useHeaderSecondLevel({
    title: "",
    canGoBack: true,
    contextualHelp: emptyContextualHelp,
    supportRequest: true
  });

  return (
    <IOScrollViewWithLargeHeader
      title={{
        label: I18n.t("idpay.code.renew.screen.header")
      }}
      description={[
        { text: I18n.t("idpay.code.renew.screen.body") },
        { text: "\n" },
        {
          text: I18n.t("idpay.code.renew.screen.link"),
          onPress: presentCieBottomSheet,
          weight: "Semibold",
          asLink: true
        }
      ]}
      contextualHelp={emptyContextualHelp}
      headerActionsProp={{ showHelp: true }}
      includeContentMargins
    >
      <ListItemAction
        label={I18n.t("idpay.code.renew.screen.generateCTA")}
        onPress={() => customAlert(handleConfirm)}
        icon="change"
        accessibilityLabel={I18n.t("idpay.code.renew.screen.generateCTA")}
        variant="danger"
      />
      {bottomSheet}
    </IOScrollViewWithLargeHeader>
  );
};

// -------------------------- utils --------------------------

const customAlert = (handleConfirm: () => void) =>
  Alert.alert(
    I18n.t("idpay.code.renew.alert.title"),

    I18n.t("idpay.code.renew.alert.body"),
    [
      {
        text: I18n.t("global.buttons.continue"),
        onPress: handleConfirm,
        style: "destructive"
      },
      {
        text: I18n.t("global.buttons.cancel"),
        style: "cancel"
      }
    ]
  );
