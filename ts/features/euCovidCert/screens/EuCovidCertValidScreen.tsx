import { View } from "native-base";
import { useContext } from "react";
import * as React from "react";
import {
  Dimensions,
  Image,
  Pressable,
  StyleSheet,
  TouchableOpacity
} from "react-native";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import FooterWithButtons from "../../../components/ui/FooterWithButtons";
import { LightModalContext } from "../../../components/ui/LightModal";
import { GlobalState } from "../../../store/reducers/types";
import themeVariables from "../../../theme/variables";
import {
  cancelButtonProps,
  confirmButtonProps
} from "../../bonus/bonusVacanze/components/buttons/ButtonConfigurations";
import TosBonusComponent from "../../bonus/bonusVacanze/components/TosBonusComponent";
import { MarkdownHandleCustomLink } from "../components/MarkdownHandleCustomLink";
import { navigateToEuCovidCertificateQrCodeFullScreen } from "../navigation/actions";
import { ValidCertificate } from "../types/EUCovidCertificate";
import { BaseEuCovidCertificateLayout } from "./BaseEuCovidCertificateLayout";

type OwnProps = {
  validCertificate: ValidCertificate;
};

const styles = StyleSheet.create({
  qrCode: {
    // TODO: it's preferable to use useWindowDimensions, but we need to upgrade react native
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

const Footer = (props: FooterProps): React.ReactElement =>
  props.validCertificate.markdownDetails ? (
    <FooterWithButtons
      type={"TwoButtonsInlineHalf"}
      leftButton={cancelButtonProps(() => console.log("cancel"))}
      rightButton={confirmButtonProps(() => console.log("confirm"))}
    />
  ) : (
    <FooterWithButtons
      type={"SingleButton"}
      leftButton={confirmButtonProps(console.log("confirm"))}
    />
  );

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
