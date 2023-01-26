import { useNavigation } from "@react-navigation/native";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import { ListItem } from "native-base";
import React, { useEffect } from "react";
import {
  View,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet
} from "react-native";
import { useDispatch } from "react-redux";
import { VSpacer } from "../../../../components/core/spacer/Spacer";
import { Body } from "../../../../components/core/typography/Body";
import { H1 } from "../../../../components/core/typography/H1";
import { H4 } from "../../../../components/core/typography/H4";
import { Label } from "../../../../components/core/typography/Label";
import { IOStyles } from "../../../../components/core/variables/IOStyles";
import BaseScreenComponent from "../../../../components/screens/BaseScreenComponent";
import FooterWithButtons from "../../../../components/ui/FooterWithButtons";
import IconFont from "../../../../components/ui/IconFont";
import I18n from "../../../../i18n";
import { IOStackNavigationRouteProps } from "../../../../navigation/params/AppParamsList";
import { WalletParamsList } from "../../../../navigation/params/WalletParamsList";
import {
  pspForPaymentV2,
  pspSelectedForPaymentV2
} from "../../../../store/actions/wallet/payment";
import { useIOSelector } from "../../../../store/hooks";
import { pspV2ListSelector } from "../../../../store/reducers/wallet/payment";
import customVariables from "../../../../theme/variables";
import { emptyContextualHelp } from "../../../../utils/emptyContextualHelp";
import { formatNumberCentsToAmount } from "../../../../utils/stringBuilder";
import { LoadingErrorComponent } from "../../../bonus/bonusVacanze/components/loadingErrorScreen/LoadingErrorComponent";
import { isError, isReady } from "../../../bonus/bpd/model/RemoteValue";
import { useImageResize } from "../../onboarding/bancomat/screens/hooks/useImageResize";
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
      testID={`pspItemTestID_${psp.id}`}
      style={styles.pspListItem}
      accessibilityRole={"button"}
      onPress={props.onPress}
    >
      <View style={{ flex: 1 }}>
        {pipe(
          imgDimensions,
          O.fold(
            () => (
              <H4
                weight={"SemiBold"}
                color={"bluegreyDark"}
                testID={"pspNameTestID"}
              >
                {psp.name}
              </H4>
            ),
            imgDim => (
              <Image
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
export type PayPalPspUpdateScreenNavigationParams = {
  idPayment: string;
  idWallet: number;
};
type Props = IOStackNavigationRouteProps<
  WalletParamsList,
  "WALLET_PAYPAL_UPDATE_PAYMENT_PSP"
>;

/**
 * This screen is where the user updates the PSP that will be used for the payment
 * Only 1 psp can be selected
 */
const PayPalPspUpdateScreen: React.FunctionComponent<Props> = (
  props: Props
) => {
  const locales = getLocales();
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const pspList = useIOSelector(pspV2ListSelector);
  const idPayment = props.route.params.idPayment;
  const idWallet = props.route.params.idWallet;
  const searchPaypalPsp = () => {
    dispatch(pspForPaymentV2.request({ idPayment, idWallet }));
  };
  useEffect(searchPaypalPsp, [dispatch]);

  const goBack = () => navigation.goBack();
  return (
    <BaseScreenComponent
      goBack={goBack}
      contextualHelp={emptyContextualHelp}
      headerTitle={I18n.t("wallet.onboarding.paypal.updatePsp.headerTitle")}
    >
      {isReady(pspList) ? (
        <SafeAreaView style={IOStyles.flex} testID={"PayPalPspUpdateScreen"}>
          <View style={[IOStyles.horizontalContentPadding, IOStyles.flex]}>
            <VSpacer size={8} />
            <H1>{locales.title}</H1>
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
