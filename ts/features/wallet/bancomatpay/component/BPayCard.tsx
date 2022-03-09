import * as React from "react";
import { Image, ImageStyle, StyleProp, StyleSheet } from "react-native";
import { connect } from "react-redux";
import { fromNullable } from "fp-ts/lib/Option";
import { View } from "native-base";
import BaseCardComponent from "../../component/card/BaseCardComponent";
import bancomatLogoMin from "../../../../../img/wallet/payment-methods/bancomatpay-logo.png";
import { GlobalState } from "../../../../store/reducers/types";
import { profileNameSurnameSelector } from "../../../../store/reducers/profile";
import { useImageResize } from "../../onboarding/bancomat/screens/hooks/useImageResize";
import { H3 } from "../../../../components/core/typography/H3";
import IconFont from "../../../../components/ui/IconFont";
import { H4 } from "../../../../components/core/typography/H4";
import I18n from "../../../../i18n";

type Props = {
  phone?: string;
  bankName: string;
  abiLogo?: string;
} & ReturnType<typeof mapStateToProps>;

const styles = StyleSheet.create({
  bpayLogo: {
    width: 80,
    height: 40,
    resizeMode: "contain"
  },
  bankName: { textTransform: "capitalize" }
});

const BASE_IMG_W = 160;
const BASE_IMG_H = 40;

/**
 * Generate the accessibility label for the card.
 */
const getAccessibilityRepresentation = (
  bankName: string,
  holder?: string,
  phone?: string
) => {
  const cardRepresentation = I18n.t("wallet.accessibility.folded.bancomatPay", {
    bankName
  });

  const computedHolder =
    typeof holder !== "undefined"
      ? `, ${I18n.t("wallet.accessibility.cardHolder")} ${holder}`
      : "";

  const computedPhone = typeof phone !== "undefined" ? `, ${phone}` : "";

  return `${cardRepresentation}${computedHolder}${computedPhone}`;
};

const BPayCard: React.FunctionComponent<Props> = (props: Props) => {
  const imgDimensions = useImageResize(BASE_IMG_W, BASE_IMG_H, props.abiLogo);

  const imageStyle: StyleProp<ImageStyle> | undefined = imgDimensions.fold(
    undefined,
    imgDim => ({
      width: imgDim[0],
      height: imgDim[1],
      resizeMode: "contain"
    })
  );
  return (
    <BaseCardComponent
      accessibilityLabel={getAccessibilityRepresentation(
        props.bankName,
        props.nameSurname,
        props.phone
      )}
      topLeftCorner={
        props.abiLogo && imageStyle ? (
          <Image
            source={{ uri: props.abiLogo }}
            style={imageStyle}
            testID={"abiLogo"}
          />
        ) : (
          <H3 style={styles.bankName} testID={"bankName"}>
            {props.bankName}
          </H3>
        )
      }
      bottomLeftCorner={
        <View>
          {props.phone && (
            <>
              <View style={{ flexDirection: "row" }}>
                <IconFont name={"io-phone"} size={22} />
                <View hspacer small />
                <H4 weight={"Regular"} testID="phone">
                  {props.phone}
                </H4>
              </View>
              <View spacer small />
            </>
          )}
          {fromNullable(props.nameSurname).fold(undefined, nameSurname => (
            <H4 weight={"Regular"} testID={"nameSurname"}>
              {nameSurname.toLocaleUpperCase()}
            </H4>
          ))}
        </View>
      }
      bottomRightCorner={
        <View style={{ justifyContent: "flex-end", flexDirection: "column" }}>
          <Image style={styles.bpayLogo} source={bancomatLogoMin} />
        </View>
      }
    />
  );
};

const mapStateToProps = (state: GlobalState) => ({
  nameSurname: profileNameSurnameSelector(state)
});

export default connect(mapStateToProps)(BPayCard);
