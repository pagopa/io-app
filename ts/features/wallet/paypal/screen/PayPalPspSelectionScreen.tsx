import React, { useState } from "react";
import {
  Dimensions,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet
} from "react-native";
import { View } from "native-base";
import { NonNegativeNumber } from "@pagopa/ts-commons/lib/numbers";
import { constNull } from "fp-ts/lib/function";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import BaseScreenComponent from "../../../../components/screens/BaseScreenComponent";
import { emptyContextualHelp } from "../../../../utils/emptyContextualHelp";
import I18n from "../../../../i18n";
import { IOStyles } from "../../../../components/core/variables/IOStyles";
import { H1 } from "../../../../components/core/typography/H1";
import { Body } from "../../../../components/core/typography/Body";
import { Link } from "../../../../components/core/typography/Link";
import FooterWithButtons from "../../../../components/ui/FooterWithButtons";
import {
  RadioButtonList,
  RadioItem
} from "../../../../components/core/selection/RadioButtonList";
import { privacyUrl } from "../../../../config";
import {
  getValueOrElse,
  isError,
  isReady,
  remoteReady
} from "../../../bonus/bpd/model/RemoteValue";
import { useImageResize } from "../../onboarding/bancomat/screens/hooks/useImageResize";
import { H4 } from "../../../../components/core/typography/H4";
import IconFont from "../../../../components/ui/IconFont";
import { IOColors } from "../../../../components/core/variables/IOColors";
import TouchableDefaultOpacity from "../../../../components/TouchableDefaultOpacity";
import { GlobalState } from "../../../../store/reducers/types";
import { LoadingErrorComponent } from "../../../bonus/bonusVacanze/components/loadingErrorScreen/LoadingErrorComponent";
import { PspInfoBottomSheetContent } from "../components/PspInfoBottomSheet";
import { useIOBottomSheetRaw } from "../../../../utils/bottomSheet";

type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps>;

// TODO temporary type. It will be shared in the future or replaced with a new one
type PayPalPsp = {
  id: string;
  logoUrl: string;
  name: string;
  fee: NonNegativeNumber;
  privacyUrl: string;
};
const PSP_LOGO_MAX_WIDTH = Dimensions.get("window").width;
const PSP_LOGO_MAX_HEIGHT = 32;
const styles = StyleSheet.create({
  pspLogo: {
    height: 32,
    flex: 1,
    flexDirection: "row",
    justifyContent: "flex-start"
  },
  radioItemBody: {
    alignItems: "flex-start",
    justifyContent: "space-between",
    flexDirection: "row"
  },
  radioItemRightContainer: {
    flex: 1,
    flexDirection: "column",
    alignItems: "flex-end"
  },
  radioItemRight: {
    flex: 1,
    flexDirection: "column",
    alignItems: "flex-end"
  },
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
    privacyUrl
  },
  {
    id: "2",
    logoUrl: "https://www.dropbox.com/s/smk5cyxx1qevn6a/mat_bank.png?dl=1",
    name: "Mat Bank",
    fee: 50 as NonNegativeNumber,
    privacyUrl
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

type RadioItemProps = {
  psp: PayPalPsp;
};
// component that represents the item in the radio list
const RadioItemBody = (props: RadioItemProps): React.ReactElement | null => {
  const { psp } = props;
  const imgDimensions = useImageResize(
    PSP_LOGO_MAX_WIDTH,
    PSP_LOGO_MAX_HEIGHT,
    psp.logoUrl
  );
  const pspInfoBottomSheet = useIOBottomSheetRaw(460);
  const handleInfoPress = () => {
    void pspInfoBottomSheet.present(
      <PspInfoBottomSheetContent
        onButtonPress={pspInfoBottomSheet.dismiss}
        pspFee={psp.fee}
        pspName={psp.name}
        pspPrivacyUrl={psp.privacyUrl}
      />,
      I18n.t("wallet.onboarding.paypal.selectPsp.infoBottomSheet.title", {
        pspName: psp.name
      })
    );
  };
  return (
    <View style={styles.radioItemBody}>
      {/* show the psp name while its image is loading */}
      {imgDimensions.fold<React.ReactNode>(
        <H4 weight={"SemiBold"} color={"bluegreyDark"}>
          {psp.name}
        </H4>,
        imgDim => (
          <Image
            source={{ uri: psp.logoUrl }}
            style={[styles.pspLogo, { width: imgDim[0], height: imgDim[1] }]}
            resizeMode={"contain"}
          />
        )
      )}
      <View style={styles.radioItemRightContainer}>
        <TouchableDefaultOpacity
          onPress={handleInfoPress}
          style={styles.radioItemRight}
        >
          <IconFont name={"io-info"} size={24} color={IOColors.blue} />
        </TouchableDefaultOpacity>
      </View>
    </View>
  );
};

const getPspListRadioItems = (
  pspList: ReadonlyArray<PayPalPsp>
): ReadonlyArray<RadioItem<PayPalPsp["id"]>> =>
  pspList.map(psp => ({
    id: psp.id,
    body: {
      kind: "node",
      element: <RadioItemBody psp={psp} />
    }
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

/**
 * This screen is where the user picks a PSP that will be used to handle PayPal transactions
 */
const PayPalPpsSelectionScreen = (props: Props): React.ReactElement | null => {
  const locales = getLocales();
  const pspList = getValueOrElse(props.pspList, []);
  // auto select if the psp list has 1 element
  const [selectedPsp, setSelectedPsp] = useState<PayPalPsp["id"] | undefined>(
    pspList.length === 1 ? pspList[0].id : undefined
  );

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
    disabled: selectedPsp === undefined,
    // TODO replace with the effective handler
    onPress: undefined,
    title: I18n.t("global.buttons.continue")
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
            leftButton={cancelButtonProps}
            rightButton={continueButtonProps}
          />
        </SafeAreaView>
      ) : (
        <LoadingErrorComponent
          isLoading={!isError(props.pspList)}
          loadingCaption={I18n.t("global.remoteStates.loading")}
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
