import * as React from "react";
import { View } from "native-base";
import { connect } from "react-redux";
import { SafeAreaView, ScrollView } from "react-native";
import { nullType } from "io-ts";
import { GlobalState } from "../../../../store/reducers/types";
import { Dispatch } from "../../../../store/actions/types";
import { cgnOtpDataSelector } from "../store/reducers/otp";
import { cgnGenerateOtp } from "../store/actions/otp";
import { useActionOnFocus } from "../../../../utils/hooks/useOnFocus";
import LoadingSpinnerOverlay from "../../../../components/LoadingSpinnerOverlay";
import { isLoading, isReady, RemoteValue } from "../../bpd/model/RemoteValue";
import BaseScreenComponent from "../../../../components/screens/BaseScreenComponent";
import { emptyContextualHelp } from "../../../../utils/emptyContextualHelp";
import { IOStyles } from "../../../../components/core/variables/IOStyles";
import { H1 } from "../../../../components/core/typography/H1";
import { OtpCodeComponent } from "../components/otp/OtpCodeComponent";
import FooterWithButtons from "../../../../components/ui/FooterWithButtons";
import { cancelButtonProps } from "../../bonusVacanze/components/buttons/ButtonConfigurations";
import I18n from "../../../../i18n";
import { clipboardSetStringWithFeedback } from "../../../../utils/clipboard";
import { Body } from "../../../../components/core/typography/Body";
import { Link } from "../../../../components/core/typography/Link";
import { H4 } from "../../../../components/core/typography/H4";
import { Otp } from "../../../../../definitions/cgn/Otp";
import { NetworkError } from "../../../../utils/errors";
import useOtpNotWorkingBottomSheet from "../components/otp/OtpNotWorking";
import { navigateToCgnMerchantsList } from "../navigation/actions";

type Props = ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps>;

const getReadableTTL = (
  otp: RemoteValue<Otp, NetworkError>
): string | undefined => {
  if (isReady(otp)) {
    const minutesValue = Math.round(otp.value.ttl / 60);

    return otp.value.ttl > 60
      ? I18n.t("bonus.cgn.otp.code.minutes", {
          defaultValue: I18n.t("bonus.cgn.otp.code.minutes.other", {
            minutes: minutesValue
          }),
          count: minutesValue,
          minutes: minutesValue
        })
      : I18n.t("bonus.cgn.otp.code.seconds", {
          defaultValue: I18n.t("bonus.cgn.otp.code.seconds.other", {
            seconds: otp.value.ttl
          }),
          count: otp.value.ttl,
          seconds: otp.value.ttl
        });
  }
  return undefined;
};

const CgnOtpScreen: React.FunctionComponent<Props> = (props: Props) => {
  useActionOnFocus(props.generateOtp);

  const readableTTL = getReadableTTL(props.otp);

  const { present, bottomSheet } = useOtpNotWorkingBottomSheet(
    props.navigateToMerchants
  );

  return (
    <LoadingSpinnerOverlay isLoading={isLoading(props.otp)}>
      <BaseScreenComponent goBack contextualHelp={emptyContextualHelp}>
        <SafeAreaView style={IOStyles.flex}>
          <ScrollView style={[IOStyles.flex]} bounces={false}>
            <View style={IOStyles.horizontalContentPadding}>
              <H1 accessible={true} accessibilityRole={"header"}>
                {I18n.t("bonus.cgn.otp.screen.title")}
              </H1>
              {isReady(props.otp) && (
                <OtpCodeComponent
                  otp={props.otp.value}
                  onEnd={props.generateOtp}
                  progressConfig={{
                    startPercentage: 100,
                    endPercentage: 0
                  }}
                />
              )}
              <View spacer extralarge />
              {readableTTL && (
                <Body>{`${I18n.t(
                  "bonus.cgn.otp.screen.text1"
                )} ${readableTTL}`}</Body>
              )}
              <View spacer large />
              <Body>
                <H4 weight={"SemiBold"} color={"bluegreyDark"}>
                  {I18n.t("global.genericAlert")}
                </H4>
                {` ${I18n.t("bonus.cgn.otp.screen.text2")}`}
              </Body>
              <View spacer extralarge />
              <Link style={{ textAlign: "center" }} onPress={present}>
                {I18n.t("bonus.cgn.otp.screen.link")}
              </Link>
            </View>
          </ScrollView>
          {isReady(props.otp) && (
            <FooterWithButtons
              type={"SingleButton"}
              leftButton={cancelButtonProps(
                () =>
                  isReady(props.otp)
                    ? clipboardSetStringWithFeedback(props.otp.value.code)
                    : nullType,
                I18n.t("bonus.cgn.otp.screen.cta"),
                "io-copy"
              )}
            />
          )}
          {bottomSheet}
        </SafeAreaView>
      </BaseScreenComponent>
    </LoadingSpinnerOverlay>
  );
};

const mapStateToProps = (state: GlobalState) => ({
  otp: cgnOtpDataSelector(state)
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  generateOtp: () => dispatch(cgnGenerateOtp.request()),
  navigateToMerchants: () => navigateToCgnMerchantsList()
});

export default connect(mapStateToProps, mapDispatchToProps)(CgnOtpScreen);
