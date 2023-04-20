import { useNavigation } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import { View, SafeAreaView, ScrollView, StyleSheet } from "react-native";
import { connect, useDispatch } from "react-redux";
import { Dispatch } from "redux";
import {
  RadioButtonList,
  RadioItem
} from "../../../../../components/core/selection/RadioButtonList";
import { VSpacer } from "../../../../../components/core/spacer/Spacer";
import { Body } from "../../../../../components/core/typography/Body";
import { H1 } from "../../../../../components/core/typography/H1";
import { H4 } from "../../../../../components/core/typography/H4";
import { Link } from "../../../../../components/core/typography/Link";
import { IOStyles } from "../../../../../components/core/variables/IOStyles";
import BaseScreenComponent from "../../../../../components/screens/BaseScreenComponent";
import FooterWithButtons from "../../../../../components/ui/FooterWithButtons";
import I18n from "../../../../../i18n";
import { GlobalState } from "../../../../../store/reducers/types";
import { emptyContextualHelp } from "../../../../../utils/emptyContextualHelp";
import { useIOBottomSheetModal } from "../../../../../utils/hooks/bottomSheet";
import { LoadingErrorComponent } from "../../../../bonus/bonusVacanze/components/loadingErrorScreen/LoadingErrorComponent";
import {
  getValueOrElse,
  isError,
  isReady
} from "../../../../bonus/bpd/model/RemoteValue";
import { PspRadioItem } from "../components/PspRadioItem";
import {
  searchPaypalPsp as searchPaypalPspAction,
  walletAddPaypalBack,
  walletAddPaypalCancel,
  walletAddPaypalPspSelected
} from "../store/actions";
import { navigateToPayPalCheckout } from "../store/actions/navigation";
import { payPalPspSelector } from "../store/reducers/searchPsp";
import { IOPayPalPsp } from "../types";

type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps>;

const styles = StyleSheet.create({
  radioListHeaderRightColumn: {
    flex: 1,
    textAlign: "right"
  }
});

// an header over the psp list with 2 columns
const RadioListHeader = (props: {
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

const getPspListRadioItems = (
  pspList: ReadonlyArray<IOPayPalPsp>
): ReadonlyArray<RadioItem<IOPayPalPsp["id"]>> =>
  pspList.map(psp => ({
    id: psp.id,
    body: <PspRadioItem psp={psp} />
  }));

const getLocales = () => ({
  title: I18n.t("wallet.onboarding.paypal.selectPsp.title"),
  body: I18n.t("wallet.onboarding.paypal.selectPsp.body"),
  link: I18n.t("wallet.onboarding.paypal.selectPsp.link"),
  leftColumnTitle: I18n.t("wallet.onboarding.paypal.selectPsp.leftColumnTitle"),
  rightColumnTitle: I18n.t(
    "wallet.onboarding.paypal.selectPsp.rightColumnTitle"
  ),
  whatIsPspBody: I18n.t(
    "wallet.onboarding.paypal.selectPsp.whatIsPspBottomSheet.body"
  ),
  whatIsPspTitle: I18n.t(
    "wallet.onboarding.paypal.selectPsp.whatIsPspBottomSheet.title"
  )
});

/**
 * This screen is where the user picks a PSP that will be used to handle PayPal transactions within PayPal
 * Only 1 psp can be selected
 */
const PayPalPspSelectionScreen = (props: Props): React.ReactElement | null => {
  const locales = getLocales();
  const { present: presentWhatIsPspBottomSheet, bottomSheet } =
    useIOBottomSheetModal(
      <Body>{locales.whatIsPspBody}</Body>,
      locales.whatIsPspTitle,
      280
    );
  const pspList = getValueOrElse(props.pspList, []);
  const [selectedPsp, setSelectedPsp] = useState<IOPayPalPsp | undefined>();
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const searchPaypalPsp = () => {
    dispatch(searchPaypalPspAction.request());
  };
  useEffect(searchPaypalPsp, [dispatch]);
  useEffect(() => {
    // auto select if the psp list has 1 element
    setSelectedPsp(pspList.length === 1 ? pspList[0] : undefined);
  }, [pspList]);

  const buttonsProps = {
    cancelButtonProps: {
      testID: "cancelButtonId",
      primary: false,
      bordered: true,
      onPress: props.cancel,
      title: I18n.t("global.buttons.cancel")
    },
    continueButtonProps: {
      testID: "continueButtonId",
      bordered: false,
      onPress: () => {
        if (selectedPsp) {
          props.setPspSelected(selectedPsp);
          navigation.dispatch(navigateToPayPalCheckout());
        }
      },
      title: I18n.t("global.buttons.continue")
    }
  };

  return (
    <BaseScreenComponent
      goBack={props.goBack}
      contextualHelp={emptyContextualHelp}
      headerTitle={I18n.t("wallet.onboarding.paypal.headerTitle")}
    >
      {isReady(props.pspList) ? (
        <SafeAreaView style={IOStyles.flex} testID={"PayPalPpsSelectionScreen"}>
          <View style={[IOStyles.horizontalContentPadding, IOStyles.flex]}>
            <VSpacer size={8} />
            <H1>{locales.title}</H1>
            <VSpacer size={8} />
            <ScrollView>
              <Body>{locales.body}</Body>
              <Link
                onPress={presentWhatIsPspBottomSheet}
                testID={"whatIsPSPTestID"}
              >
                {locales.link}
              </Link>
              <VSpacer size={24} />
              <RadioListHeader
                leftColumnTitle={locales.leftColumnTitle}
                rightColumnTitle={locales.rightColumnTitle}
              />
              <VSpacer size={8} />
              <RadioButtonList<IOPayPalPsp["id"]>
                key="paypal_psp_selection"
                items={getPspListRadioItems(pspList)}
                selectedItem={selectedPsp?.id}
                onPress={(idPsp: string) => {
                  setSelectedPsp(pspList.find(p => p.id === idPsp));
                }}
              />
            </ScrollView>
          </View>
          <FooterWithButtons
            type={"TwoButtonsInlineThird"}
            leftButton={buttonsProps.cancelButtonProps}
            rightButton={{
              ...buttonsProps.continueButtonProps,
              disabled: selectedPsp === undefined
            }}
          />
          {bottomSheet}
        </SafeAreaView>
      ) : (
        <LoadingErrorComponent
          testID={"PayPalPpsSelectionScreenLoadingError"}
          isLoading={!isError(props.pspList)}
          loadingCaption={I18n.t("global.remoteStates.loading")}
          onRetry={searchPaypalPsp}
        />
      )}
    </BaseScreenComponent>
  );
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
  goBack: () => dispatch(walletAddPaypalBack()),
  cancel: () => dispatch(walletAddPaypalCancel()),
  setPspSelected: (psp: IOPayPalPsp) =>
    dispatch(walletAddPaypalPspSelected(psp))
});
const mapStateToProps = (state: GlobalState) => ({
  pspList: payPalPspSelector(state)
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(PayPalPspSelectionScreen);
