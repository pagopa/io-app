import React, { useEffect, useState } from "react";
import { SafeAreaView, ScrollView, StyleSheet } from "react-native";
import { View } from "native-base";
import { connect, useDispatch } from "react-redux";
import { Dispatch } from "redux";
import BaseScreenComponent from "../../../../../components/screens/BaseScreenComponent";
import { emptyContextualHelp } from "../../../../../utils/emptyContextualHelp";
import I18n from "../../../../../i18n";
import { IOStyles } from "../../../../../components/core/variables/IOStyles";
import { H1 } from "../../../../../components/core/typography/H1";
import { Body } from "../../../../../components/core/typography/Body";
import { Link } from "../../../../../components/core/typography/Link";
import FooterWithButtons from "../../../../../components/ui/FooterWithButtons";
import {
  RadioButtonList,
  RadioItem
} from "../../../../../components/core/selection/RadioButtonList";
import {
  getValueOrElse,
  isError,
  isReady
} from "../../../../bonus/bpd/model/RemoteValue";
import { H4 } from "../../../../../components/core/typography/H4";
import { GlobalState } from "../../../../../store/reducers/types";
import { LoadingErrorComponent } from "../../../../bonus/bonusVacanze/components/loadingErrorScreen/LoadingErrorComponent";
import { PspRadioItem } from "../components/PspRadioItem";
import { useIOBottomSheet } from "../../../../../utils/bottomSheet";
import { IOPayPalPsp } from "../types";
import {
  searchPaypalPsp as searchPaypalPspAction,
  walletAddPaypalBack,
  walletAddPaypalCancel,
  walletAddPaypalPspSelected
} from "../store/actions";
import { payPalPspSelector } from "../store/reducers/searchPsp";

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
  const { present: presentWhatIsPspBottomSheet } = useIOBottomSheet(
    <Body>{locales.whatIsPspBody}</Body>,
    locales.whatIsPspTitle,
    280
  );
  const pspList = getValueOrElse(props.pspList, []);
  const [selectedPsp, setSelectedPsp] = useState<IOPayPalPsp | undefined>();
  const dispatch = useDispatch();
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
          props.pspSelected(selectedPsp);
          // TODO navigate to paypal onboarding webview see https://pagopa.atlassian.net/browse/IA-471
        }
      },
      title: I18n.t("global.buttons.continue")
    }
  };

  return (
    <BaseScreenComponent
      goBack={true}
      contextualHelp={emptyContextualHelp}
      headerTitle={I18n.t("wallet.onboarding.paypal.headerTitle")}
    >
      {isReady(props.pspList) ? (
        <SafeAreaView style={IOStyles.flex} testID={"PayPalPpsSelectionScreen"}>
          <View style={[IOStyles.horizontalContentPadding, IOStyles.flex]}>
            <View spacer={true} small={true} />
            <H1>{locales.title}</H1>
            <View spacer={true} small={true} />
            <ScrollView>
              <Body>{locales.body}</Body>
              <Link
                onPress={presentWhatIsPspBottomSheet}
                testID={"whatIsPSPTestID"}
              >
                {locales.link}
              </Link>
              <View spacer={true} large={true} />
              <RadioListHeader
                leftColumnTitle={locales.leftColumnTitle}
                rightColumnTitle={locales.rightColumnTitle}
              />
              <View spacer={true} small={true} />
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
  pspSelected: (psp: IOPayPalPsp) => dispatch(walletAddPaypalPspSelected(psp))
});
const mapStateToProps = (state: GlobalState) => ({
  pspList: payPalPspSelector(state)
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(PayPalPspSelectionScreen);
