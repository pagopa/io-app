import { Option } from "fp-ts/lib/Option";
import * as React from "react";
import { Image, ImageStyle, StyleProp, StyleSheet } from "react-native";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import unknownGdo from "../../../../../img/wallet/unknown-gdo.png";
import { Monospace } from "../../../../components/core/typography/Monospace";
import { IOStyles } from "../../../../components/core/variables/IOStyles";
import { navigateToPrivativeDetailScreen } from "../../../../store/actions/navigation";
import { GlobalState } from "../../../../store/reducers/types";
import { isImageURISource } from "../../../../types/image";
import { PrivativePaymentMethod } from "../../../../types/pagopa";
import { CardLayoutPreview } from "../../component/CardLayoutPreview";
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

const renderRight = (props: Props, size: Option<[number, number]>) =>
  size.fold(fallbackLoyaltyLogo, imgDim => {
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

/**
 * A card preview for a privative card
 * @param props
 * @constructor
 */
const PrivativeWalletPreview: React.FunctionComponent<Props> = props => {
  const rightElement = isImageURISource(props.privative.icon)
    ? renderRight(
        props,
        useImageResize(BASE_IMG_W, BASE_IMG_H, props.privative.icon.uri)
      )
    : fallbackLoyaltyLogo;

  return (
    <CardLayoutPreview
      left={
        <Monospace
          style={IOStyles.flex}
          numberOfLines={1}
          testID={"caption"}
          color={"bluegreyDark"}
        >
          {props.privative.caption}
        </Monospace>
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
