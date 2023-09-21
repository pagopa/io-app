import {
  Body,
  ButtonLink,
  ButtonSolid,
  ContentWrapper,
  IOStyles,
  Pictogram,
  VSpacer
} from "@pagopa/io-app-design-system";
import { SafeAreaView } from "react-native-safe-area-context";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import * as React from "react";
import { StyleSheet, View } from "react-native";
import {
  AppParamsList,
  IOStackNavigationProp
} from "../../../../navigation/params/AppParamsList";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { IdPayCodeParamsList } from "../navigation/params";
import { IdPayCodeRoutes } from "../navigation/routes";
import { idPayEnrollCode, idPayGenerateCode } from "../store/actions";
import { isIdPayCodeOnboardedSelector } from "../store/selectors";
import TopScreenComponent from "../../../../components/screens/TopScreenComponent";
import { NewH3 } from "../../../../components/core/typography/NewH3";
import { useIdPayInfoCieBottomSheet } from "../components/IdPayInfoCieBottomSheet";
import TypedI18n from "../../../../i18n";

type IdPayCodeOnboardingRouteParams = {
  initiativeId?: string;
};

type IdPayCodeOnboardingRouteProps = RouteProp<
  IdPayCodeParamsList,
  "IDPAY_CODE_ONBOARDING"
>;

const IdPayCodeOnboardingScreen = () => {
  const route = useRoute<IdPayCodeOnboardingRouteProps>();
  const { initiativeId } = route.params;

  const navigation = useNavigation<IOStackNavigationProp<AppParamsList>>();
  const dispatch = useIODispatch();
  const { bottomSheet, present: presentCIEBottomSheet } =
    useIdPayInfoCieBottomSheet();

  const isCodeOnboarded = useIOSelector(isIdPayCodeOnboardedSelector);

  const handleContinue = () => {
    if (isCodeOnboarded && initiativeId !== undefined) {
      dispatch(idPayEnrollCode.request({ initiativeId }));
      navigation.replace(IdPayCodeRoutes.IDPAY_CODE_MAIN, {
        screen: IdPayCodeRoutes.IDPAY_CODE_RESULT
      });
    } else {
      dispatch(idPayGenerateCode.request({ initiativeId }));
      navigation.replace(IdPayCodeRoutes.IDPAY_CODE_MAIN, {
        screen: IdPayCodeRoutes.IDPAY_CODE_DISPLAY,
        params: {
          initiativeId
        }
      });
    }
  };

  return (
    <SafeAreaView style={IOStyles.flex}>
      <TopScreenComponent goBack>
        <View style={styles.wizardContent}>
          <View style={IOStyles.alignCenter}>
            <Pictogram name="cie" size={240} />
          </View>
          <VSpacer size={24} />
          <NewH3 style={styles.textCenter}>
            {TypedI18n.t("idpay.code.onboarding.title")}
          </NewH3>
          <VSpacer size={8} />
          <Body weight="Regular" color="grey-850" style={styles.textCenter}>
            {TypedI18n.t("idpay.code.onboarding.description")}
          </Body>
        </View>
      </TopScreenComponent>
      <ContentWrapper>
        <ButtonSolid
          label={TypedI18n.t("idpay.code.onboarding.buttons.start")}
          accessibilityLabel={TypedI18n.t(
            "idpay.code.onboarding.buttons.start"
          )}
          onPress={handleContinue}
          fullWidth
        />
        <VSpacer size={24} />
        <View style={[IOStyles.alignCenter, IOStyles.selfCenter]}>
          <ButtonLink
            label={TypedI18n.t("idpay.code.onboarding.buttons.howItWorks")}
            onPress={presentCIEBottomSheet}
          />
        </View>
      </ContentWrapper>
      {bottomSheet}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  textCenter: {
    textAlign: "center"
  },
  wizardContent: {
    ...IOStyles.flex,
    ...IOStyles.horizontalContentPadding,
    ...IOStyles.centerJustified
  }
});

export { IdPayCodeOnboardingScreen };
export type { IdPayCodeOnboardingRouteParams };
