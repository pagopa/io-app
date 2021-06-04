import { View } from "native-base";
import * as React from "react";
import {
  Dimensions,
  Image,
  StyleSheet,
  useWindowDimensions
} from "react-native";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { GlobalState } from "../../../store/reducers/types";
import themeVariables from "../../../theme/variables";
import { ValidCertificate } from "../types/EUCovidCertificate";
import { BaseEuCovidCertificateLayout } from "./BaseEuCovidCertificateLayout";

type OwnProps = {
  validCertificate: ValidCertificate;
};

const styles = StyleSheet.create({
  qrCode: {
    // TODO: the preferred way is use useWindowDimensions, but we need to upgade react native
    width: Dimensions.get("window").width - themeVariables.contentPadding * 2,
    height: Dimensions.get("window").width - themeVariables.contentPadding * 2,
    flex: 1
  }
});

type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps> &
  OwnProps;

const EuCovidCertValidComponent = (props: Props): React.ReactElement => (
  <View style={{ flexDirection: "row" }}>
    {props.validCertificate.qrCode.mimeType === "image/png" && (
      <Image
        source={{
          uri: `data:image/png;base64,${props.validCertificate.qrCode.content}`
        }}
        style={styles.qrCode}
      />
    )}
  </View>
);

const EuCovidCertValidScreen = (props: Props): React.ReactElement => (
  <BaseEuCovidCertificateLayout
    testID={"EuCovidCertValidScreen"}
    content={<EuCovidCertValidComponent {...props} />}
  />
);

const mapDispatchToProps = (_: Dispatch) => ({});
const mapStateToProps = (_: GlobalState) => ({});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(EuCovidCertValidScreen);
