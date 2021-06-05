import { View } from "native-base";
import * as React from "react";
import { Dimensions, Image, StyleSheet, TouchableOpacity } from "react-native";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import FooterWithButtons from "../../../components/ui/FooterWithButtons";
import I18n from "../../../i18n";
import { GlobalState } from "../../../store/reducers/types";
import themeVariables from "../../../theme/variables";
import {
  cancelButtonProps,
  confirmButtonProps
} from "../../bonus/bonusVacanze/components/buttons/ButtonConfigurations";
import { MarkdownHandleCustomLink } from "../components/MarkdownHandleCustomLink";
import { navigateToEuCovidCertificateQrCodeFullScreen } from "../navigation/actions";
import { ValidCertificate } from "../types/EUCovidCertificate";
import { BaseEuCovidCertificateLayout } from "./BaseEuCovidCertificateLayout";

type OwnProps = {
  validCertificate: ValidCertificate;
};

const styles = StyleSheet.create({
  qrCode: {
    // TODO: it's preferable to use the hook useWindowDimensions, but we need to upgrade react native
    width: Dimensions.get("window").width - themeVariables.contentPadding * 2,
    height: Dimensions.get("window").width - themeVariables.contentPadding * 2,
    flex: 1
  }
});

type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps> &
  OwnProps;

const EuCovidCertValidComponent = (props: Props): React.ReactElement => (
  <View>
    {props.validCertificate.qrCode.mimeType === "image/png" && (
      <TouchableOpacity
        accessible={true}
        accessibilityRole={"imagebutton"}
        accessibilityLabel={I18n.t(
          "features.euCovidCertificate.valid.accessibility.qrCode"
        )}
        accessibilityHint={I18n.t(
          "features.euCovidCertificate.valid.accessibility.hint"
        )}
        onPress={() =>
          props.navigateToQrCodeFullScreen(
            props.validCertificate.qrCode.content
          )
        }
      >
        <Image
          source={{
            uri: `data:image/png;base64,${props.validCertificate.qrCode.content}`
          }}
          style={styles.qrCode}
        />
      </TouchableOpacity>
    )}
    {props.validCertificate.markdownPreview && (
      <>
        <MarkdownHandleCustomLink>
          {props.validCertificate.markdownPreview}
        </MarkdownHandleCustomLink>
        <View spacer={true} />
      </>
    )}
  </View>
);

type FooterProps = Props & {};

const Footer = (props: FooterProps): React.ReactElement => {
  const saveButton = confirmButtonProps(
    () => console.log("confirm"),
    I18n.t("global.genericSave")
  );
  return props.validCertificate.markdownDetails ? (
    <FooterWithButtons
      type={"TwoButtonsInlineHalf"}
      leftButton={cancelButtonProps(
        () => console.log("cancel"),
        I18n.t("global.buttons.details")
      )}
      rightButton={saveButton}
    />
  ) : (
    <FooterWithButtons type={"SingleButton"} leftButton={saveButton} />
  );
};

const EuCovidCertValidScreen = (props: Props): React.ReactElement => (
  <BaseEuCovidCertificateLayout
    testID={"EuCovidCertValidScreen"}
    content={<EuCovidCertValidComponent {...props} />}
    footer={<Footer {...props} />}
  />
);

const mapDispatchToProps = (dispatch: Dispatch) => ({
  navigateToQrCodeFullScreen: (qrCodeContent: string) =>
    dispatch(navigateToEuCovidCertificateQrCodeFullScreen(qrCodeContent))
});
const mapStateToProps = (_: GlobalState) => ({});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(EuCovidCertValidScreen);
