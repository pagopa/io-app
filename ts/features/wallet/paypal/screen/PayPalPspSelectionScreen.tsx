import React, { ReactElement, useState } from "react";
import {
  Dimensions,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet
} from "react-native";
import { Dispatch } from "redux";
import { connect } from "react-redux";
import { View } from "native-base";
import { NonNegativeNumber } from "@pagopa/ts-commons/lib/numbers";
import { constNull } from "fp-ts/lib/function";
import BaseScreenComponent from "../../../../components/screens/BaseScreenComponent";
import { emptyContextualHelp } from "../../../../utils/emptyContextualHelp";
import I18n from "../../../../i18n";
import { IOStyles } from "../../../../components/core/variables/IOStyles";
import { GlobalState } from "../../../../store/reducers/types";
import { H1 } from "../../../../components/core/typography/H1";
import { Body } from "../../../../components/core/typography/Body";
import { Link } from "../../../../components/core/typography/Link";
import FooterWithButtons from "../../../../components/ui/FooterWithButtons";
import { openWebUrl } from "../../../../utils/url";
import {
  RadioButtonList,
  RadioItem
} from "../../../../components/core/selection/RadioButtonList";
import { privacyUrl } from "../../../../config";
import { isReady, remoteReady } from "../../../bonus/bpd/model/RemoteValue";
import { useImageResize } from "../../onboarding/bancomat/screens/hooks/useImageResize";
import { H4 } from "../../../../components/core/typography/H4";
import IconFont from "../../../../components/ui/IconFont";
import { IOColors } from "../../../../components/core/variables/IOColors";
import TouchableDefaultOpacity from "../../../../components/TouchableDefaultOpacity";

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
const PSP_IMAGE_WIDTH = Dimensions.get("window").width;
const PSP_IMAGE_HEIGHT = 32;
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
    logoUrl:
      "https://www.pikpng.com/pngl/m/600-6000675_business-wire-logo-png-intesa-sanpaolo-clipart.png",
    name: "Intesa San Paolo",
    fee: 200 as NonNegativeNumber,
    privacyUrl
  }
];

const RadioListHeader = (props: {
  leftColumnTitle: string;
  rightColumnTitle: string;
}) => (
  <View style={{ flexDirection: "row" }}>
    <H4 color={"bluegrey"} weight={"Regular"}>
      {props.leftColumnTitle}
    </H4>
    <H4
      color={"bluegrey"}
      weight={"Regular"}
      style={{
        flex: 1,
        textAlign: "right"
      }}
    >
      {props.rightColumnTitle}
    </H4>
  </View>
);

// component that represents the item in the radio list
const RadioItemBody = ({ psp }: { psp: PayPalPsp }): ReactElement => {
  const imgDimensions = useImageResize(
    PSP_IMAGE_WIDTH,
    PSP_IMAGE_HEIGHT,
    psp.logoUrl
  );
  return (
    <View style={styles.radioItemBody}>
      {/* show the psp name while its image is loading */}
      {imgDimensions.fold<React.ReactNode>(<H4>psp.name</H4>, imgDim => (
        <Image
          source={{ uri: psp.logoUrl }}
          style={[styles.pspLogo, { width: imgDim[0], height: imgDim[1] }]}
          resizeMode={"contain"}
        />
      ))}
      <View style={styles.radioItemRightContainer}>
        <TouchableDefaultOpacity
          onPress={constNull}
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
 * This screen is the start point to onboard PayPal as payment method
 * It shows the PP logo and some texts
 * At the bottom 2 CTA to cancel or continue
 */
const PayPalPpsSelectionScreen = (props: Props): React.ReactElement | null => {
  const locales = getLocales();
  const [selectedPsp, setSelectedPsp] = useState<PayPalPsp["id"]>("");
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
  return (
    <BaseScreenComponent
      goBack={true}
      contextualHelp={emptyContextualHelp}
      headerTitle={I18n.t("wallet.onboarding.paypal.headerTitle")}
    >
      <SafeAreaView style={IOStyles.flex} testID={"PayPalPpsSelectionScreen"}>
        <View style={[IOStyles.horizontalContentPadding, IOStyles.flex]}>
          <View spacer={true} large={true} />
          <H1>{I18n.t("wallet.onboarding.paypal.selectPsp.title")}</H1>
          <View spacer={true} large={true} />
          <Body>{locales.body}</Body>
          <Link onPress={() => openWebUrl("https://www.google.com")}>
            {locales.link}
          </Link>
          <View spacer={true} large={true} />
          <RadioListHeader
            leftColumnTitle={locales.leftColumnTitle}
            rightColumnTitle={locales.rightColumnTitle}
          />
          {isReady(props.pspList) && (
            <ScrollView>
              <View spacer={true} small={true} />
              <RadioButtonList<PayPalPsp["id"]>
                key="paypal_psp_selection"
                items={getPspListRadioItems(props.pspList.value)}
                selectedItem={selectedPsp}
                onPress={setSelectedPsp}
              />
            </ScrollView>
          )}
        </View>
        <FooterWithButtons
          type={"TwoButtonsInlineThird"}
          leftButton={cancelButtonProps}
          rightButton={continueButtonProps}
        />
      </SafeAreaView>
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
