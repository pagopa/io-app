import {
  Banner,
  Body,
  H3,
  IOColors,
  IOMarkdownLite,
  useIOTheme,
  VSpacer,
  VStack
} from "@pagopa/io-app-design-system";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import I18n from "i18next";
import LoadingSpinnerOverlay from "../../../../components/LoadingSpinnerOverlay";
import { IOScrollViewWithLargeHeader } from "../../../../components/ui/IOScrollViewWithLargeHeader";
import {
  AppParamsList,
  IOStackNavigationProp
} from "../../../../navigation/params/AppParamsList";
import { useIOSelector } from "../../../../store/hooks";
import { emptyContextualHelp } from "../../../../utils/contextualHelp";
import { useIdPayInfoCieBottomSheet } from "../components/IdPayInfoCieBottomSheet";
import { IdPayCodeParamsList } from "../navigation/params";
import { IdPayCodeRoutes } from "../navigation/routes";
import {
  idPayCodeSelector,
  isIdPayCodeFailureSelector,
  isIdPayCodeLoadingSelector
} from "../store/selectors";

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

  const isGeneratingCode = useIOSelector(isIdPayCodeLoadingSelector);
  const isFailure = useIOSelector(isIdPayCodeFailureSelector);
  const idPayCode = useIOSelector(idPayCodeSelector);
  const { bottomSheet, present: presentCieBottomSheet } =
    useIdPayInfoCieBottomSheet();

  useEffect(() => {
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

  const buttonLabel: string = isOnboarding
    ? I18n.t("global.buttons.continue")
    : I18n.t("global.buttons.close");

  return (
    <IOScrollViewWithLargeHeader
      title={{
        label: I18n.t("idpay.code.onboarding.header")
      }}
      contextualHelp={emptyContextualHelp}
      headerActionsProp={{ showHelp: true }}
      actions={{
        type: "SingleButton",
        primary: {
          label: buttonLabel,
          onPress: handleContinue,
          testID: "actionButtonTestID"
        }
      }}
      includeContentMargins
    >
      <VStack space={8}>
        <IOMarkdownLite content={I18n.t("idpay.code.onboarding.body")} />
        <Body asLink weight="Semibold" onPress={presentCieBottomSheet}>
          {I18n.t("idpay.code.onboarding.buttons.howItWorks")}
        </Body>
      </VStack>
      <VSpacer size={24} />
      <LoadingSpinnerOverlay isLoading={isGeneratingCode} loadingOpacity={1}>
        <CodeDisplayComponent code={idPayCode} />
        <VSpacer size={24} />
        <Banner
          color="neutral"
          pictogramName="security"
          title={I18n.t("idpay.code.onboarding.banner.header")}
          content={I18n.t("idpay.code.onboarding.banner.body")}
        />
      </LoadingSpinnerOverlay>
      {bottomSheet}
    </IOScrollViewWithLargeHeader>
  );
};

const CodeDisplayComponent = ({ code }: { code: string }) => {
  const theme = useIOTheme();

  return (
    <View style={styles.codeDisplay}>
      {[...code].map((digit, index) => (
        <View
          key={index}
          style={[
            styles.codeDigit,
            { borderColor: IOColors[theme["textInputBorder-default"]] }
          ]}
          testID={`idPayCodeDigit${index}TestID`}
        >
          <H3>{digit}</H3>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  codeDigit: {
    minHeight: 60,
    maxWidth: 60,
    flex: 1,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
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
