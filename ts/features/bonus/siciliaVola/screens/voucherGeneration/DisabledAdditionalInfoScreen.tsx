import * as React from "react";
import { useState } from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { SafeAreaView, ScrollView } from "react-native";
import { View } from "native-base";
import BaseScreenComponent from "../../../../../components/screens/BaseScreenComponent";
import { emptyContextualHelp } from "../../../../../utils/emptyContextualHelp";
import { IOStyles } from "../../../../../components/core/variables/IOStyles";
import { H1 } from "../../../../../components/core/typography/H1";
import { GlobalState } from "../../../../../store/reducers/types";
import {
  svGenerateVoucherBack,
  svGenerateVoucherCancel
} from "../../store/actions/voucherGeneration";
import FooterWithButtons from "../../../../../components/ui/FooterWithButtons";
import { navigateToSvSelectFlightsDateScreen } from "../../navigation/actions";
import I18n from "../../../../../i18n";
import { DeclarationEntry } from "../../../bpd/screens/onboarding/declaration/DeclarationEntry";
import { Link } from "../../../../../components/core/typography/Link";
import { openWebUrl } from "../../../../../utils/url";
import { Body } from "../../../../../components/core/typography/Body";

type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps>;

// TODO: update with the correct disclaimer: https://pagopa.atlassian.net/browse/IASV-40
const disclaimerLink =
  "https://www.normattiva.it/uri-res/N2Ls?urn:nir:stato:decreto.del.presidente.della.repubblica:2000-12-28;445";

const loadLocales = () => ({
  headerTitle: I18n.t("bonus.sv.headerTitle"),
  title: I18n.t("bonus.sv.voucherGeneration.disabled.additionalInfo.title"),
  disclaimer: {
    normal: I18n.t(
      "bonus.sv.voucherGeneration.disabled.additionalInfo.disclaimer.normal"
    ),
    link: I18n.t(
      "bonus.sv.voucherGeneration.disabled.additionalInfo.disclaimer.link"
    )
  }
});

const DisabledAdditionalInfoScreen = (props: Props): React.ReactElement => {
  const [acceptedDisclaimer, setAcceptedDisclaimer] = useState<boolean>(false);

  const cancelButtonProps = {
    primary: false,
    bordered: true,
    onPress: props.cancel,
    title: I18n.t("global.buttons.cancel")
  };
  const continueButtonProps = {
    bordered: false,
    onPress: props.navigateToSelectFlightsDateScreen,
    title: I18n.t("global.buttons.continue"),
    disabled: !acceptedDisclaimer
  };

  const { title, disclaimer, headerTitle } = loadLocales();
  return (
    <BaseScreenComponent
      goBack={true}
      contextualHelp={emptyContextualHelp}
      headerTitle={headerTitle}
    >
      <SafeAreaView
        style={IOStyles.flex}
        testID={"DisabledAdditionalInfoScreen"}
      >
        <ScrollView style={[IOStyles.horizontalContentPadding]}>
          <H1>{title}</H1>
          <View spacer={true} extralarge={true} />
          <DeclarationEntry
            text={
              <Body>
                {disclaimer.normal}
                <Link onPress={() => openWebUrl(disclaimerLink)}>
                  {disclaimer.link}
                </Link>
              </Body>
            }
            onValueChange={setAcceptedDisclaimer}
          />
        </ScrollView>
        <FooterWithButtons
          type={"TwoButtonsInlineHalf"}
          leftButton={cancelButtonProps}
          rightButton={continueButtonProps}
        />
      </SafeAreaView>
    </BaseScreenComponent>
  );
};
const mapDispatchToProps = (dispatch: Dispatch) => ({
  back: () => dispatch(svGenerateVoucherBack()),
  cancel: () => dispatch(svGenerateVoucherCancel()),
  navigateToSelectFlightsDateScreen: () => navigateToSvSelectFlightsDateScreen()
});
const mapStateToProps = (_: GlobalState) => ({});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(DisabledAdditionalInfoScreen);
