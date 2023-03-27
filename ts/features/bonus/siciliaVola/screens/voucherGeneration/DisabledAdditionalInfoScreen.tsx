import { useNavigation } from "@react-navigation/native";
import * as React from "react";
import { useState } from "react";
import { SafeAreaView, ScrollView } from "react-native";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { VSpacer } from "../../../../../components/core/spacer/Spacer";
import { Body } from "../../../../../components/core/typography/Body";
import { H1 } from "../../../../../components/core/typography/H1";
import { Link } from "../../../../../components/core/typography/Link";
import { IOStyles } from "../../../../../components/core/variables/IOStyles";
import BaseScreenComponent from "../../../../../components/screens/BaseScreenComponent";
import FooterWithButtons from "../../../../../components/ui/FooterWithButtons";
import I18n from "../../../../../i18n";
import { GlobalState } from "../../../../../store/reducers/types";
import { emptyContextualHelp } from "../../../../../utils/emptyContextualHelp";
import { openWebUrl } from "../../../../../utils/url";
import { DeclarationEntry } from "../../../bpd/screens/onboarding/declaration/DeclarationEntry";
import SV_ROUTES from "../../navigation/routes";
import {
  svGenerateVoucherBack,
  svGenerateVoucherCancel
} from "../../store/actions/voucherGeneration";

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
  const navigation = useNavigation();

  const cancelButtonProps = {
    primary: false,
    bordered: true,
    onPress: props.cancel,
    title: I18n.t("global.buttons.cancel")
  };
  const continueButtonProps = {
    bordered: false,
    onPress: () =>
      navigation.navigate(SV_ROUTES.VOUCHER_GENERATION.SELECT_FLIGHTS_DATA),
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
        <ScrollView style={IOStyles.horizontalContentPadding}>
          <H1>{title}</H1>
          <VSpacer size={40} />
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
  cancel: () => dispatch(svGenerateVoucherCancel())
});
const mapStateToProps = (_: GlobalState) => ({});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(DisabledAdditionalInfoScreen);
