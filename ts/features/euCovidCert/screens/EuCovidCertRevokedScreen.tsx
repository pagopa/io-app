import * as React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { Image } from "react-native";
import { View } from "native-base";
import { GlobalState } from "../../../store/reducers/types";
import { InfoScreenComponent } from "../../../components/infoScreen/InfoScreenComponent";
import I18n from "../../../i18n";
import revokedImage from "../../../../img/features/euCovidCert/certificate_revoked.png";
import Markdown from "../../../components/ui/Markdown";
import { Link } from "../../../components/core/typography/Link";
import { openWebUrl } from "../../../utils/url";
import { euCovidCertificateUrl } from "../../../urls";
import { BaseEuCovidCertificateLayout } from "./BaseEuCovidCertificateLayout";

type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps> & { revokeInfo?: string };

const EuCovidCertRevokedContentComponent = (props: Props) => (
  <>
    <View spacer extralarge />
    <View spacer extralarge />
    <InfoScreenComponent
      image={
        <Image
          source={revokedImage}
          importantForAccessibility={"no"}
          accessibilityElementsHidden={true}
          style={{ width: 104, height: 104, resizeMode: "contain" }}
        />
      }
      title={I18n.t("features.euCovidCertificate.revoked.title")}
      body={
        <Link
          accessibilityRole={"link"}
          accessibilityHint={I18n.t("global.accessibility.linkHint")}
          onPress={() => openWebUrl(euCovidCertificateUrl)}
        >
          {I18n.t("features.euCovidCertificate.common.learnMore")}
        </Link>
      }
    />
    <View spacer />
    {props.revokeInfo && <Markdown>{props.revokeInfo}</Markdown>}
  </>
);

const EuCovidCertRevokedScreen = (props: Props): React.ReactElement => (
  <BaseEuCovidCertificateLayout
    testID={"EuCovidCertRevokedScreen"}
    content={<EuCovidCertRevokedContentComponent {...props} />}
  />
);

const mapDispatchToProps = (_: Dispatch) => ({});
const mapStateToProps = (_: GlobalState) => ({});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(EuCovidCertRevokedScreen);
