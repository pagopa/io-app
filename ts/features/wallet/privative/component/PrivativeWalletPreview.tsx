import * as React from "react";
import {
  Image,
  ImageStyle,
  ImageURISource,
  StyleProp,
  StyleSheet
} from "react-native";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import unknownGdo from "../../../../../img/wallet/unknown-gdo.png";
import { IOStyles } from "../../../../components/core/variables/IOStyles";
import I18n from "../../../../i18n";
import { navigateToPrivativeDetailScreen } from "../../../../store/actions/navigation";
import { GlobalState } from "../../../../store/reducers/types";
import { isImageURISource } from "../../../../types/image";
import { PrivativePaymentMethod } from "../../../../types/pagopa";
import { BlurredPan } from "../../component/card/BlurredPan";
import { CardLayoutPreview } from "../../component/card/CardLayoutPreview";
import { useImageResize } from "../../onboarding/bancomat/screens/hooks/useImageResize";

type OwnProps = {
  privative: PrivativePaymentMethod;
};

type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps> &
  OwnProps;

const BASE_IMG_W = 100;
const BASE_IMG_H = 30;

const styles = StyleSheet.create({
  unknownLoyaltyLogo: {
    width: 40,
    height: 40,
    resizeMode: "contain"
  }
});
const fallbackLoyaltyLogo: React.ReactElement = (
  <Image
    source={unknownGdo}
    style={styles.unknownLoyaltyLogo}
    key={"unknownLoyaltyLogo"}
    testID={"unknownLoyaltyLogo"}
  />
);

const Right = (
  props: Props & Pick<ImageURISource, "uri">
): React.ReactElement => {
  const size = useImageResize(BASE_IMG_W, BASE_IMG_H, props.uri);
  return size.fold(fallbackLoyaltyLogo, imgDim => {
    const imageUrl = props.privative.icon;

    const imageStyle: StyleProp<ImageStyle> = {
      width: imgDim[0],
      height: imgDim[1],
      resizeMode: "contain"
    };
    return (
      <Image
        source={imageUrl}
        style={imageStyle}
        key={"loyaltyLogo"}
        testID={"loyaltyLogo"}
      />
    );
  });
};

const getAccessibilityRepresentation = (privative: PrivativePaymentMethod) => {
  const cardRepresentation = I18n.t("wallet.accessibility.folded.privative", {
    blurredNumber: privative.info.blurredNumber
  });
  const cta = I18n.t("wallet.accessibility.folded.cta");
  return `${cardRepresentation}, ${cta}`;
};

/**
 * A card preview for a privative card
 * @param props
 * @constructor
 */
const PrivativeWalletPreview: React.FunctionComponent<Props> = props => {
  const rightElement = isImageURISource(props.privative.icon) ? (
    <Right {...props} uri={props.privative.icon.uri} />
  ) : (
    fallbackLoyaltyLogo
  );

  return (
    <CardLayoutPreview
      accessibilityLabel={getAccessibilityRepresentation(props.privative)}
      left={
        <BlurredPan style={IOStyles.flex} numberOfLines={1} testID={"caption"}>
          {props.privative.caption}
        </BlurredPan>
      }
      right={rightElement}
      onPress={() => props.navigateToPrivativeDetails(props.privative)}
    />
  );
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
  navigateToPrivativeDetails: (privative: PrivativePaymentMethod) =>
    dispatch(navigateToPrivativeDetailScreen(privative))
});

const mapStateToProps = (_: GlobalState) => ({});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(PrivativeWalletPreview);
