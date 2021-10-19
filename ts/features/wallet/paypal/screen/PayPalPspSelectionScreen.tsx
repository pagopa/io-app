import React, { useState } from "react";
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

type PayPalPsp = {
  id: string;
  logoUrl: string;
  name: string;
  fee: NonNegativeNumber;
  privacyUrl: string;
};
const IMAGE_WIDTH = Dimensions.get("window").width;
const IMAGE_HEIGHT = 32;
const styles = StyleSheet.create({
  pspLogo: {
    height: 32,
    flex: 1,
    flexDirection: "row",
    justifyContent: "flex-start"
  }
});

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

const RadioItemBody = ({ psp }: { psp: PayPalPsp }) => {
  const imgDimensions = useImageResize(IMAGE_WIDTH, IMAGE_HEIGHT, psp.logoUrl);

  return (
    <View
      style={{
        alignItems: "flex-start",
        justifyContent: "space-between",
        flexDirection: "row"
      }}
    >
      {imgDimensions.fold<React.ReactNode>(<H4>psp.name</H4>, imgDim => (
        <Image
          source={{ uri: psp.logoUrl }}
          style={[styles.pspLogo, { width: imgDim[0], height: imgDim[1] }]}
          resizeMode={"contain"}
        />
      ))}
      <View
        style={{
          flex: 1,
          flexDirection: "column",
          alignItems: "flex-end"
        }}
      >
        <TouchableDefaultOpacity
          onPress={() => console.log("pressed")}
          style={{
            flex: 1,
            flexDirection: "column",
            alignItems: "flex-end"
          }}
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

type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps>;

const getLocales = () => ({
  title: I18n.t("bonus.bpd.iban.insertion.title"),
  body: I18n.t("bonus.bpd.iban.insertion.body1"),
  bodyLinkTitle: "a link title"
});

/**
 * This screen is the start point to onboard PayPal as payment method
 * It shows the PP logo and some texts
 * At the bottom 2 CTA to cancel or continue
 */
const PayPalPpsSelectionScreen = (props: Props): React.ReactElement | null => {
  const { title, body, bodyLinkTitle } = getLocales();
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
          <H1>{title}</H1>
          <View spacer={true} large={true} />
          <Body>{body}</Body>
          <Link onPress={() => openWebUrl("https://www.google.com")}>
            {bodyLinkTitle}
          </Link>
          <View spacer={true} large={true} />

          {isReady(props.pspList) && (
            <ScrollView>
              <View style={{ flexDirection: "row" }}>
                <H4 color={"bluegreyDark"} weight={"Regular"}>
                  {"ciao"}
                </H4>
                <H4
                  color={"bluegreyDark"}
                  weight={"Regular"}
                  style={{
                    flex: 1,
                    textAlign: "right"
                  }}
                >
                  {"zio"}
                </H4>
              </View>

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
