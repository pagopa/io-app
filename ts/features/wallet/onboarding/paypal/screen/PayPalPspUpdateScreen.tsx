import React, { useEffect } from "react";
import { Image, SafeAreaView, ScrollView, StyleSheet } from "react-native";
import { ListItem, View } from "native-base";
import { useDispatch } from "react-redux";
import { constNull } from "fp-ts/lib/function";
import BaseScreenComponent from "../../../../../components/screens/BaseScreenComponent";
import { emptyContextualHelp } from "../../../../../utils/emptyContextualHelp";
import I18n from "../../../../../i18n";
import { IOStyles } from "../../../../../components/core/variables/IOStyles";
import { H1 } from "../../../../../components/core/typography/H1";
import { Body } from "../../../../../components/core/typography/Body";
import FooterWithButtons from "../../../../../components/ui/FooterWithButtons";
import { isError, isReady } from "../../../../bonus/bpd/model/RemoteValue";
import { H4 } from "../../../../../components/core/typography/H4";
import { LoadingErrorComponent } from "../../../../bonus/bonusVacanze/components/loadingErrorScreen/LoadingErrorComponent";
import { IOPayPalPsp } from "../types";
import { searchPaypalPsp as searchPaypalPspAction } from "../store/actions";
import { payPalPspSelector } from "../store/reducers/searchPsp";
import { useNavigationContext } from "../../../../../utils/hooks/useOnFocus";
import customVariables from "../../../../../theme/variables";
import IconFont from "../../../../../components/ui/IconFont";
import { formatNumberCentsToAmount } from "../../../../../utils/stringBuilder";
import { Label } from "../../../../../components/core/typography/Label";
import { useImageResize } from "../../bancomat/screens/hooks/useImageResize";
import {
  PSP_LOGO_MAX_HEIGHT,
  PSP_LOGO_MAX_WIDTH
} from "../components/PspRadioItem";
import { useIOSelector } from "../../../../../store/hooks";

const styles = StyleSheet.create({
  radioListHeaderRightColumn: {
    flex: 1,
    textAlign: "right"
  },
  pspLogo: {
    height: 32,
    flex: 1,
    flexDirection: "row",
    justifyContent: "flex-start"
  },
  pspListItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingLeft: 0,
    paddingRight: 0,
    flex: 1
  }
});

// an header over the psp list with 2 columns
const PspListHeader = (props: {
  leftColumnTitle: string;
  rightColumnTitle: string;
}) => {
  const color = "bluegrey";
  const weight = "Regular";
  return (
    <View style={{ flexDirection: "row" }}>
      <H4 color={color} weight={weight}>
        {props.leftColumnTitle}
      </H4>
      <H4
        color={color}
        weight={weight}
        style={styles.radioListHeaderRightColumn}
      >
        {props.rightColumnTitle}
      </H4>
    </View>
  );
};

const getLocales = () => ({
  title: I18n.t("wallet.onboarding.paypal.updatePsp.title"),
  body: I18n.t("wallet.onboarding.paypal.updatePsp.body"),
  leftColumnTitle: I18n.t("wallet.onboarding.paypal.updatePsp.leftColumnTitle"),
  rightColumnTitle: I18n.t(
    "wallet.onboarding.paypal.updatePsp.rightColumnTitle"
  )
});

const backButtonProps = (onPress: () => void) => ({
  testID: "backButtonID",
  primary: false,
  bordered: true,
  onPress,
  title: I18n.t("global.buttons.cancel")
});

const PspItem = (props: { psp: IOPayPalPsp; onPress: () => void }) => {
  const { psp } = props;
  const imgDimensions = useImageResize(
    PSP_LOGO_MAX_WIDTH,
    PSP_LOGO_MAX_HEIGHT,
    psp.logoUrl
  );
  return (
    <ListItem
      style={styles.pspListItem}
      accessibilityRole={"button"}
      onPress={constNull}
    >
      <View style={{ flex: 1 }}>
        {imgDimensions.fold<React.ReactNode>(
          <H4
            weight={"SemiBold"}
            color={"bluegreyDark"}
            testID={"pspNameTestID"}
          >
            {psp.name}
          </H4>,
          imgDim => (
            <Image
              testID={"pspNameLogoID"}
              source={{ uri: psp.logoUrl }}
              style={[styles.pspLogo, { width: imgDim[0], height: imgDim[1] }]}
              resizeMode={"contain"}
            />
          )
        )}
      </View>
      <View style={IOStyles.row}>
        <Label color={"blue"}>{formatNumberCentsToAmount(psp.fee)}</Label>
        <IconFont
          style={{ justifyContent: "center" }}
          name={"io-right"}
          size={24}
          color={customVariables.contentPrimaryBackground}
        />
      </View>
    </ListItem>
  );
};

/**
 * This screen is where the user updates the PSP that will be used for the payment
 * Only 1 psp can be selected
 */
const PayPalPspUpdateScreen = (): React.ReactElement | null => {
  const locales = getLocales();
  const navigation = useNavigationContext();
  const dispatch = useDispatch();
  const pspList = useIOSelector(payPalPspSelector);
  const searchPaypalPsp = () => {
    dispatch(searchPaypalPspAction.request());
  };
  useEffect(searchPaypalPsp, [dispatch]);

  const goBack = () => navigation.goBack();
  return (
    <BaseScreenComponent
      goBack={goBack}
      contextualHelp={emptyContextualHelp}
      headerTitle={I18n.t("wallet.onboarding.paypal.headerTitle")}
    >
      {isReady(pspList) ? (
        <SafeAreaView style={IOStyles.flex} testID={"PayPalPpsUpdateScreen"}>
          <View style={[IOStyles.horizontalContentPadding, IOStyles.flex]}>
            <View spacer={true} small={true} />
            <H1>{locales.title}</H1>
            <View spacer={true} small={true} />
            <ScrollView>
              <Body>{locales.body}</Body>
              <View spacer={true} large={true} />
              <PspListHeader
                leftColumnTitle={locales.leftColumnTitle}
                rightColumnTitle={locales.rightColumnTitle}
              />
              <View spacer={true} small={true} />
              {pspList.value.map(psp => (
                // TODO replace the on press with the effective handler see https://pagopa.atlassian.net/browse/IA-499
                <PspItem
                  psp={psp}
                  key={`paypal_psp:${psp.id}`}
                  onPress={constNull}
                />
              ))}
            </ScrollView>
          </View>
          <FooterWithButtons
            type={"SingleButton"}
            leftButton={backButtonProps(goBack)}
          />
        </SafeAreaView>
      ) : (
        <LoadingErrorComponent
          testID={"PayPalPpsUpdateScreenLoadingError"}
          isLoading={!isError(pspList)}
          loadingCaption={I18n.t("global.remoteStates.loading")}
          onRetry={searchPaypalPsp}
        />
      )}
    </BaseScreenComponent>
  );
};

export default PayPalPspUpdateScreen;
