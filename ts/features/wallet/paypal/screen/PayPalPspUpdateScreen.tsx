import {
  Body,
  FooterWithButtons,
  H2,
  H6,
  Icon,
  Label,
  PressableListItemBase,
  VSpacer
} from "@pagopa/io-app-design-system";
import { Route, useRoute } from "@react-navigation/native";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import React, { useEffect } from "react";
import {
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  View
} from "react-native";
import { isError, isReady } from "../../../../common/model/RemoteValue";
import { LoadingErrorComponent } from "../../../../components/LoadingErrorComponent";
import { IOStyles } from "../../../../components/core/variables/IOStyles";
import BaseScreenComponent from "../../../../components/screens/BaseScreenComponent";
import I18n from "../../../../i18n";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import {
  pspForPaymentV2,
  pspSelectedForPaymentV2
} from "../../../../store/actions/wallet/payment";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { pspV2ListSelector } from "../../../../store/reducers/wallet/payment";
import { emptyContextualHelp } from "../../../../utils/emptyContextualHelp";
import { formatNumberCentsToAmount } from "../../../../utils/stringBuilder";
import { useImageResize } from "../../onboarding/bancomat/hooks/useImageResize";
import {
  PSP_LOGO_MAX_HEIGHT,
  PSP_LOGO_MAX_WIDTH
} from "../../onboarding/paypal/components/PspRadioItem";
import { convertPspData } from "../../onboarding/paypal/store/transformers";
import { IOPayPalPsp } from "../../onboarding/paypal/types";

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
  }
  // pspListItem: {
  //   flexDirection: "row",
  //   justifyContent: "space-between",
  //   paddingLeft: 0,
  //   paddingRight: 0,
  //   flex: 1
  // }
});

// an header over the psp list with 2 columns
const PspListHeader = (props: {
  leftColumnTitle: string;
  rightColumnTitle: string;
}) => {
  const color = "bluegrey";

  return (
    <View style={{ flexDirection: "row" }}>
      <H6 color={color}>{props.leftColumnTitle}</H6>
      <H6 color={color} style={styles.radioListHeaderRightColumn}>
        {props.rightColumnTitle}
      </H6>
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

const PspItem = (props: { psp: IOPayPalPsp; onPress: () => void }) => {
  const { psp } = props;
  const imgDimensions = useImageResize(
    PSP_LOGO_MAX_WIDTH,
    PSP_LOGO_MAX_HEIGHT,
    psp.logoUrl
  );
  return (
    <PressableListItemBase
      testID={`pspItemTestID_${psp.id}`}
      // style={styles.pspListItem}
      accessibilityRole={"button"}
      onPress={props.onPress}
    >
      <View style={{ flex: 1 }}>
        {pipe(
          imgDimensions,
          O.fold(
            () => (
              <H6 color={"bluegreyDark"} testID={"pspNameTestID"}>
                {psp.name}
              </H6>
            ),
            imgDim => (
              <Image
                accessibilityIgnoresInvertColors
                testID={"pspNameLogoID"}
                source={{ uri: psp.logoUrl }}
                style={[
                  styles.pspLogo,
                  { width: imgDim[0], height: imgDim[1] }
                ]}
                resizeMode={"contain"}
              />
            )
          )
        )}
      </View>
      <View style={IOStyles.row}>
        <Label color={"black"}>{formatNumberCentsToAmount(psp.fee)}</Label>
        <View style={{ justifyContent: "center" }}>
          <Icon name="chevronRightListItem" size={24} color="blue" />
        </View>
      </View>
    </PressableListItemBase>
  );
};
export type PayPalPspUpdateScreenNavigationParams = {
  idPayment: string;
  idWallet: number;
};

/**
 * This screen is where the user updates the PSP that will be used for the payment
 * Only 1 psp can be selected
 */
const PayPalPspUpdateScreen: React.FunctionComponent = () => {
  const { idPayment, idWallet } =
    useRoute<
      Route<
        "WALLET_PAYPAL_UPDATE_PAYMENT_PSP",
        PayPalPspUpdateScreenNavigationParams
      >
    >().params;
  const locales = getLocales();
  const navigation = useIONavigation();
  const dispatch = useIODispatch();
  const pspList = useIOSelector(pspV2ListSelector);
  const searchPaypalPsp = () => {
    dispatch(pspForPaymentV2.request({ idPayment, idWallet }));
  };
  useEffect(searchPaypalPsp, [dispatch, idPayment, idWallet]);

  const goBack = () => navigation.goBack();
  return (
    <BaseScreenComponent
      goBack={goBack}
      contextualHelp={emptyContextualHelp}
      headerTitle={I18n.t("wallet.onboarding.paypal.updatePsp.headerTitle")}
    >
      {isReady(pspList) ? (
        <>
          <SafeAreaView style={IOStyles.flex} testID={"PayPalPspUpdateScreen"}>
            <View style={[IOStyles.horizontalContentPadding, IOStyles.flex]}>
              <VSpacer size={8} />
              <H2>{locales.title}</H2>
              <VSpacer size={8} />
              <ScrollView>
                <Body>{locales.body}</Body>
                <VSpacer size={24} />
                <PspListHeader
                  leftColumnTitle={locales.leftColumnTitle}
                  rightColumnTitle={locales.rightColumnTitle}
                />
                <VSpacer size={8} />
                {pspList.value.map(psp => {
                  const paypalPsp = convertPspData(psp);
                  return (
                    <PspItem
                      psp={paypalPsp}
                      key={`paypal_psp:${paypalPsp.id}`}
                      onPress={() => {
                        dispatch(pspSelectedForPaymentV2(psp));
                        goBack();
                      }}
                    />
                  );
                })}
              </ScrollView>
            </View>
          </SafeAreaView>
          <FooterWithButtons
            type="SingleButton"
            primary={{
              type: "Outline",
              buttonProps: {
                label: I18n.t("global.buttons.cancel"),
                accessibilityLabel: I18n.t("global.buttons.cancel"),
                onPress: goBack,
                testID: "backButtonID"
              }
            }}
          />
        </>
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