import * as React from "react";
import { Image, ImageStyle, StyleProp } from "react-native";
import { Option } from "fp-ts/lib/Option";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import bPayImage from "../../../../../img/wallet/cards-icons/bPay.png";
import { Body } from "../../../../components/core/typography/Body";
import { IOStyles } from "../../../../components/core/variables/IOStyles";
import { GlobalState } from "../../../../store/reducers/types";
import { CardPreview } from "../../component/CardPreview";
import { navigateToBPayDetailScreen } from "../../../../store/actions/navigation";
import { BPayPaymentMethod } from "../../../../types/pagopa";
import { useImageResize } from "../../onboarding/bancomat/screens/hooks/useImageResize";

type OwnProps = {
  bPay: BPayPaymentMethod;
};

type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps> &
  OwnProps;

const BASE_IMG_W = 160;
const BASE_IMG_H = 20;
/**
 * Render the image (if available) or the bank name (if available)
 * or the generic bancomatPay string (final fallback).
 * @param props
 * @param size
 */
const renderLeft = (props: Props, size: Option<[number, number]>) =>
  size.fold(
    <Body style={IOStyles.flex} numberOfLines={1} testID={"bankLogoFallback"}>
      {props.bPay.caption}
    </Body>,
    imgDim => {
      const imageUrl = props.bPay.abiInfo?.logoUrl;
      const imageStyle: StyleProp<ImageStyle> = {
        width: imgDim[0],
        height: imgDim[1],
        resizeMode: "contain"
      };
      return imageUrl ? (
        <Image
          source={{ uri: imageUrl }}
          style={imageStyle}
          testID={"bankLogo"}
        />
      ) : null;
    }
  );

/**
 * A card preview for a bancomat card
 * @param props
 * @constructor
 */
const BPayWalletPreview: React.FunctionComponent<Props> = props => {
  const imgDimensions = useImageResize(
    BASE_IMG_W,
    BASE_IMG_H,
    props.bPay.abiInfo?.logoUrl
  );
  return (
    <CardPreview
      left={renderLeft(props, imgDimensions)}
      image={bPayImage}
      onPress={() => props.navigateToBPayDetails(props.bPay)}
    />
  );
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
  navigateToBPayDetails: (bPay: BPayPaymentMethod) =>
    dispatch(navigateToBPayDetailScreen(bPay))
});

const mapStateToProps = (_: GlobalState) => ({});

export default connect(mapStateToProps, mapDispatchToProps)(BPayWalletPreview);
