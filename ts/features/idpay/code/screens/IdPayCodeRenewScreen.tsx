import {
  Body,
  H2,
  IOStyles,
  ListItemAction,
  VSpacer
} from "@pagopa/io-app-design-system";
import { useNavigation } from "@react-navigation/native";
import { Alert, View } from "react-native";
import TopScreenComponent from "../../../../components/screens/TopScreenComponent";
import I18n from "../../../../i18n";
import {
  AppParamsList,
  IOStackNavigationProp
} from "../../../../navigation/params/AppParamsList";
import { identificationRequest } from "../../../../store/actions/identification";
import { useIODispatch } from "../../../../store/hooks";
import { emptyContextualHelp } from "../../../../utils/emptyContextualHelp";
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

  return (
    <>
      <TopScreenComponent
        customGoBack={false}
        dark={false}
        goBack={true}
        contextualHelp={emptyContextualHelp}
      >
        <View style={IOStyles.horizontalContentPadding}>
          <H2>{I18n.t("idpay.code.renew.screen.header")}</H2>
          <VSpacer size={16} />
          <Body>{I18n.t("idpay.code.renew.screen.body")}</Body>
          <Body weight="Semibold" asLink onPress={presentCieBottomSheet}>
            {I18n.t("idpay.code.renew.screen.link")}
          </Body>
          <VSpacer size={16} />
          <ListItemAction
            label={I18n.t("idpay.code.renew.screen.generateCTA")}
            onPress={() => customAlert(handleConfirm)}
            icon="change"
            accessibilityLabel={I18n.t("idpay.code.renew.screen.generateCTA")}
            variant="danger"
          />
        </View>
      </TopScreenComponent>
      {bottomSheet}
    </>
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
