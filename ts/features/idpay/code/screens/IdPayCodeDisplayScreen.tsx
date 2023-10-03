import * as React from "react";
import {
  Banner,
  Body,
  ButtonSolid,
  ContentWrapper,
  H2,
  H3,
  IOColors,
  IOStyles,
  LabelLink,
  VSpacer
} from "@pagopa/io-app-design-system";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import LoadingSpinnerOverlay from "../../../../components/LoadingSpinnerOverlay";
import TopScreenComponent from "../../../../components/screens/TopScreenComponent";
import I18n from "../../../../i18n";
import {
  AppParamsList,
  IOStackNavigationProp
} from "../../../../navigation/params/AppParamsList";
import { useIOSelector } from "../../../../store/hooks";
import { emptyContextualHelp } from "../../../../utils/emptyContextualHelp";
import { IdPayCodeParamsList } from "../navigation/params";
import { IdPayCodeRoutes } from "../navigation/routes";
import { idPayCodeSelector } from "../store/selectors";

type IdPayCodeDisplayRouteParams = {
  isOnboarding?: boolean;
};

type IdPayCodeDisplayRouteProps = RouteProp<
  IdPayCodeParamsList,
  "IDPAY_CODE_DISPLAY"
>;

const IdPayCodeDisplayScreen = () => {
  const route = useRoute<IdPayCodeDisplayRouteProps>();
  const { isOnboarding } = route.params;

  const navigation = useNavigation<IOStackNavigationProp<AppParamsList>>();

  const idPayCodePot = useIOSelector(idPayCodeSelector);

  const isGeneratingCode = pot.isLoading(idPayCodePot);
  const isFailure = pot.isError(idPayCodePot);
  const idPayCode = pot.getOrElse(idPayCodePot, "");

  React.useEffect(() => {
    if (isFailure) {
      navigation.replace(IdPayCodeRoutes.IDPAY_CODE_MAIN, {
        screen: IdPayCodeRoutes.IDPAY_CODE_RESULT
      });
    }
  }, [isFailure, navigation]);

  const handleContinue = () => {
    if (isOnboarding) {
      navigation.replace(IdPayCodeRoutes.IDPAY_CODE_MAIN, {
        screen: IdPayCodeRoutes.IDPAY_CODE_RESULT
      });
    } else {
      navigation.pop();
    }
  };

  const bannerRef = React.createRef<View>();

  const buttonLabel: string = isOnboarding
    ? I18n.t("global.buttons.continue")
    : I18n.t("global.buttons.close");

  return (
    <LoadingSpinnerOverlay isLoading={isGeneratingCode} loadingOpacity={1}>
      <TopScreenComponent contextualHelp={emptyContextualHelp}>
        <ContentWrapper>
          <H2>{I18n.t("idpay.code.onboarding.header")}</H2>
          <VSpacer size={16} />
          <Body color="grey-700" weight="Regular">
            {I18n.t("idpay.code.onboarding.body1")}
          </Body>
          <Body color="grey-700" weight="Bold">
            {I18n.t("idpay.code.onboarding.bodyBold")}
          </Body>
          <LabelLink>{I18n.t("idpay.code.onboarding.bodyCta")}</LabelLink>
          <VSpacer size={24} />
          <CodeDisplayComponent code={idPayCode} />
          <VSpacer size={24} />
          <Banner
            color="neutral"
            pictogramName="help" // security once new DS ver is released
            size="big"
            viewRef={bannerRef}
            title={I18n.t("idpay.code.onboarding.banner.header")}
            content={I18n.t("idpay.code.onboarding.banner.body")}
          />
        </ContentWrapper>
      </TopScreenComponent>
      <SafeAreaView style={IOStyles.horizontalContentPadding}>
        <ButtonSolid
          accessibilityLabel={buttonLabel}
          label={buttonLabel}
          fullWidth={true}
          onPress={handleContinue}
        />
      </SafeAreaView>
    </LoadingSpinnerOverlay>
  );
};

const CodeDigitDisplayBox = ({ digit }: { digit: string }) => (
  <View style={styles.codeDigit}>
    <H3>{digit}</H3>
  </View>
);

const CodeDisplayComponent = ({ code }: { code: string }) => (
  <View style={styles.codeDisplay}>
    {[...code].map((digit, index) => (
      <CodeDigitDisplayBox key={index} digit={digit} />
    ))}
  </View>
);

const styles = StyleSheet.create({
  codeDigit: {
    minHeight: 60,
    maxWidth: 60,
    flex: 1,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
    borderColor: IOColors["grey-200"],
    borderRadius: 8,
    marginHorizontal: 2
  },
  codeDisplay: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between"
  }
});

export { IdPayCodeDisplayScreen };
export type { IdPayCodeDisplayRouteParams };
