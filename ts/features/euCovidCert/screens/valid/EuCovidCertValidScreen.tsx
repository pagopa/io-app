import { View } from "native-base";
import * as React from "react";
import { Dimensions, Image, StyleSheet, TouchableOpacity } from "react-native";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import FooterWithButtons from "../../../../components/ui/FooterWithButtons";
import I18n from "../../../../i18n";
import { GlobalState } from "../../../../store/reducers/types";
import themeVariables from "../../../../theme/variables";
import {
  cancelButtonProps,
  confirmButtonProps
} from "../../../bonus/bonusVacanze/components/buttons/ButtonConfigurations";
import { MarkdownHandleCustomLink } from "../../components/MarkdownHandleCustomLink";
import {
  navigateToEuCovidCertificateMarkdownDetailsScreen,
  navigateToEuCovidCertificateQrCodeFullScreen
} from "../../navigation/actions";
import { ValidCertificate } from "../../types/EUCovidCertificate";
import { BaseEuCovidCertificateLayout } from "../BaseEuCovidCertificateLayout";
import { useIOBottomSheet } from "../../../../utils/bottomSheet";
import ButtonDefaultOpacity from "../../../../components/ButtonDefaultOpacity";
import { IOStyles } from "../../../../components/core/variables/IOStyles";
import { H3 } from "../../../../components/core/typography/H3";
import { H5 } from "../../../../components/core/typography/H5";
import IconFont from "../../../../components/ui/IconFont";
import { IOColors } from "../../../../components/core/variables/IOColors";
import { share } from "../../../../utils/share";
import { showToast } from "../../../../utils/showToast";

type OwnProps = {
  validCertificate: ValidCertificate;
};

const styles = StyleSheet.create({
  qrCode: {
    // TODO: it's preferable to use the hook useWindowDimensions, but we need to upgrade react native
    width: Dimensions.get("window").width - themeVariables.contentPadding * 2,
    height: Dimensions.get("window").width - themeVariables.contentPadding * 2,
    flex: 1
  },
  container: {
    paddingRight: 0,
    paddingLeft: 0,
    marginVertical: 20,
    height: 60,
    backgroundColor: IOColors.white
  },
  flexColumn: {
    flexDirection: "column",
    flex: 1
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between"
  }
});

type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps> &
  OwnProps;

const EuCovidCertValidComponent = (props: Props): React.ReactElement => (
  <View>
    {props.validCertificate.qrCode.mimeType === "image/png" && (
      <TouchableOpacity
        testID={"QRCode"}
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
        <MarkdownHandleCustomLink testID={"markdownPreview"}>
          {props.validCertificate.markdownPreview}
        </MarkdownHandleCustomLink>
        <View spacer={true} />
      </>
    )}
  </View>
);

const showToastError = (error: string = I18n.t("global.genericError")) =>
  showToast(error);
const Footer = (props: Props): React.ReactElement => {
  const saveQRCode = async () => {
    const shared = await share(
      `data:image/png;base64,${props.validCertificate.qrCode.content}`
    ).run();
    shared.mapLeft(_ => showToastError());
  };
  const addItem = (config: {
    title: string;
    subTitle: string;
    onPress: () => void;
  }) => (
    <ButtonDefaultOpacity
      onPress={() => {
        config.onPress();
        dismiss();
      }}
      style={styles.container}
      onPressWithGestureHandler={true}
    >
      <View style={styles.flexColumn}>
        <View style={styles.row}>
          <View style={IOStyles.flex}>
            <H3 color={"bluegreyDark"} weight={"SemiBold"}>
              {config.title}
            </H3>
            <H5 color={"bluegrey"} weight={"Regular"}>
              {config.subTitle}
            </H5>
          </View>
          <IconFont name={"io-right"} color={IOColors.blue} size={24} />
        </View>
      </View>
    </ButtonDefaultOpacity>
  );
  const { present, dismiss } = useIOBottomSheet(
    <View>
      {addItem({
        title: I18n.t(
          "features.euCovidCertificate.save.bottomSheet.saveAsImage.title"
        ),
        subTitle: I18n.t(
          "features.euCovidCertificate.save.bottomSheet.saveAsImage.subTitle"
        ),
        onPress: saveQRCode
      })}
    </View>,
    <View style={IOStyles.flex}>
      <H3 color={"bluegreyDark"} weight={"SemiBold"}>
        {I18n.t("features.euCovidCertificate.save.bottomSheet.title")}
      </H3>
      <H5 color={"bluegrey"} weight={"Regular"}>
        {I18n.t("features.euCovidCertificate.save.bottomSheet.subTitle")}
      </H5>
    </View>,
    260
  );

  const saveButton = confirmButtonProps(
    // TODO: add save function with https://pagopa.atlassian.net/browse/IAGP-17
    present,
    I18n.t("global.genericSave")
  );
  const markdownDetails = props.validCertificate.markdownDetails;

  return markdownDetails ? (
    <FooterWithButtons
      type={"TwoButtonsInlineHalf"}
      leftButton={cancelButtonProps(
        () => props.navigateToMarkdown(markdownDetails),
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
    dispatch(navigateToEuCovidCertificateQrCodeFullScreen({ qrCodeContent })),
  navigateToMarkdown: (markdownDetails: string) =>
    dispatch(
      navigateToEuCovidCertificateMarkdownDetailsScreen({ markdownDetails })
    )
});
const mapStateToProps = (_: GlobalState) => ({});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(EuCovidCertValidScreen);
