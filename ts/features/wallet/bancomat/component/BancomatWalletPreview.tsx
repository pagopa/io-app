import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import * as React from "react";
import { Image, ImageStyle, StyleProp } from "react-native";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import pagoBancomatImage from "../../../../../img/wallet/cards-icons/pagobancomat.png";
import { Body } from "../../../../components/core/typography/Body";
import { IOStyles } from "../../../../components/core/variables/IOStyles";
import I18n from "../../../../i18n";
import { navigateToBancomatDetailScreen } from "../../../../store/actions/navigation";
import { GlobalState } from "../../../../store/reducers/types";
import { BancomatPaymentMethod } from "../../../../types/pagopa";
import { CardLogoPreview } from "../../component/card/CardLogoPreview";
import { useImageResize } from "../../onboarding/bancomat/screens/hooks/useImageResize";

type OwnProps = { bancomat: BancomatPaymentMethod };

type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps> &
  OwnProps;

const BASE_IMG_W = 160;
const BASE_IMG_H = 20;

/**
 * Render the image (if available) or the bank name (if available)
 * or the generic bancomat string (final fallback).
 * @param props
 * @param size
 */
const renderLeft = (props: Props, size: O.Option<[number, number]>) =>
  pipe(
    size,
    O.fold(
      () => (
        <Body style={IOStyles.flex} numberOfLines={1}>
          {props.bancomat.abiInfo?.name ??
            I18n.t("wallet.methods.bancomat.name")}
        </Body>
      ),
      imgDim => {
        const imageUrl = props.bancomat.abiInfo?.logoUrl;
        const imageStyle: StyleProp<ImageStyle> = {
          width: imgDim[0],
          height: imgDim[1],
          resizeMode: "contain"
        };
        return imageUrl ? (
          <Image source={{ uri: imageUrl }} style={imageStyle} />
        ) : null;
      }
    )
  );

const getAccessibilityRepresentation = (bancomat: BancomatPaymentMethod) => {
  const cardRepresentation = I18n.t("wallet.accessibility.folded.bancomat", {
    bankName: bancomat.caption
  });
  const cta = I18n.t("wallet.accessibility.folded.cta");
  return `${cardRepresentation}, ${cta}`;
};

/**
 * A card preview for a bancomat card
 * @param props
 * @constructor
 */
const BancomatWalletPreview: React.FunctionComponent<Props> = props => {
  const imgDimensions = useImageResize(
    BASE_IMG_W,
    BASE_IMG_H,
    props.bancomat.abiInfo?.logoUrl
  );

  return (
    <CardLogoPreview
      accessibilityLabel={getAccessibilityRepresentation(props.bancomat)}
      left={renderLeft(props, imgDimensions)}
      image={pagoBancomatImage}
      onPress={() => props.navigateToBancomatDetails(props.bancomat)}
    />
  );
};

const mapDispatchToProps = (_: Dispatch) => ({
  navigateToBancomatDetails: (bancomat: BancomatPaymentMethod) =>
    navigateToBancomatDetailScreen(bancomat)
});

const mapStateToProps = (_: GlobalState) => ({});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(BancomatWalletPreview);
