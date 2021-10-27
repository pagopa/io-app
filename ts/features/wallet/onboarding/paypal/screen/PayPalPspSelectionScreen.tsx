import React, { useState } from "react";
import { SafeAreaView, ScrollView, StyleSheet } from "react-native";
import { View } from "native-base";
import { NonNegativeNumber } from "@pagopa/ts-commons/lib/numbers";
import { constNull } from "fp-ts/lib/function";
import { connect } from "react-redux";
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
import { privacyUrl } from "../../../../../config";
import {
  getValueOrElse,
  isError,
  isReady,
  remoteReady
} from "../../../../bonus/bpd/model/RemoteValue";
import { H4 } from "../../../../../components/core/typography/H4";
import { GlobalState } from "../../../../../store/reducers/types";
import { LoadingErrorComponent } from "../../../../bonus/bonusVacanze/components/loadingErrorScreen/LoadingErrorComponent";
import { PspRadioItem } from "../components/PspRadioItem";

type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps>;

// TODO temporary type. It will be shared in the future or replaced with a new one
export type PayPalPsp = {
  id: string;
  logoUrl: string;
  name: string;
  fee: NonNegativeNumber;
  privacyUrl: string;
  tosUrl: string;
};

const styles = StyleSheet.create({
  radioListHeaderRightColumn: {
    flex: 1,
    textAlign: "right"
  }
});

// TODO replace fake items with values coming from the store
const pspList: ReadonlyArray<PayPalPsp> = [
  {
    id: "1",
    logoUrl: "https://paytipper.com/wp-content/uploads/2021/02/logo.png",
    name: "PayTipper",
    fee: 100 as NonNegativeNumber,
    privacyUrl,
    tosUrl: privacyUrl
  },
  {
    id: "2",
    logoUrl: "https://www.dropbox.com/s/smk5cyxx1qevn6a/mat_bank.png?dl=1",
    name: "Mat Bank",
    fee: 50 as NonNegativeNumber,
    privacyUrl,
    tosUrl: privacyUrl
  }
];

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
  pspList: ReadonlyArray<PayPalPsp>
): ReadonlyArray<RadioItem<PayPalPsp["id"]>> =>
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
  )
});

const buttonsProps = () => {
  const cancelButtonProps = {
    testID: "cancelButtonId",
    primary: false,
    bordered: true,
    // TODO replace with the effective handler
    onPress: undefined,
    title: I18n.t("global.buttons.cancel")
  };
  const continueButtonProps = {
    testID: "continueButtonId",
    bordered: false,
    // TODO replace with the effective handler
    onPress: undefined,
    title: I18n.t("global.buttons.continue")
  };
  return { cancelButtonProps, continueButtonProps };
};

/**
 * This screen is where the user picks a PSP that will be used to handle PayPal transactions
 * Only 1 psp can be selected
 */
const PayPalPpsSelectionScreen = (props: Props): React.ReactElement | null => {
  const locales = getLocales();
  const pspList = getValueOrElse(props.pspList, []);
  // auto select if the psp list has 1 element
  const [selectedPsp, setSelectedPsp] = useState<PayPalPsp["id"] | undefined>(
    pspList.length === 1 ? pspList[0].id : undefined
  );

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
              {/* TODO see https://pagopa.atlassian.net/browse/IA-304 */}
              <Link onPress={constNull}>{locales.link}</Link>
              <View spacer={true} large={true} />
              <RadioListHeader
                leftColumnTitle={locales.leftColumnTitle}
                rightColumnTitle={locales.rightColumnTitle}
              />
              <View spacer={true} small={true} />
              <RadioButtonList<PayPalPsp["id"]>
                key="paypal_psp_selection"
                items={getPspListRadioItems(pspList)}
                selectedItem={selectedPsp}
                onPress={setSelectedPsp}
              />
            </ScrollView>
          </View>
          <FooterWithButtons
            type={"TwoButtonsInlineThird"}
            leftButton={buttonsProps().cancelButtonProps}
            rightButton={{
              ...buttonsProps().continueButtonProps,
              disabled: selectedPsp === undefined
            }}
          />
        </SafeAreaView>
      ) : (
        <LoadingErrorComponent
          testID={"PayPalPpsSelectionScreen"}
          isLoading={!isError(props.pspList)}
          loadingCaption={I18n.t("global.remoteStates.loading")}
          // TODO replace with the handler that retries to reload data
          onRetry={constNull}
        />
      )}
    </BaseScreenComponent>
  );
};

const mapDispatchToProps = (_: Dispatch) => ({});
const mapStateToProps = (_: GlobalState) => ({
  pspList: remoteReady(pspList)
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(PayPalPpsSelectionScreen);
