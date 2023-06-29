import * as React from "react";
import { View } from "react-native";
import { Banner } from "../../../components/Banner";
import { VSpacer } from "../../../components/core/spacer/Spacer";
import I18n from "../../../i18n";

/**
 * The base graphical component, take a text as input and dispatch onPress when pressed
 * include also a close button
 */
export const ItwActionBanner = (): React.ReactElement => {
  const viewRef = React.createRef<View>();
  return (
    <>
      <VSpacer size={24} />
      <Banner
        testID={"ItwBannerTestID"}
        viewRef={viewRef}
        color={"neutral"}
        variant="big"
        title={I18n.t("features.itWallet.actionBanner.title")}
        content={I18n.t("features.itWallet.actionBanner.description")}
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        pictogramName={"setup"}
        action={I18n.t("features.itWallet.actionBanner.action")}
        labelClose="Nascondi questo banner"
        onPress={() => null}
        onClose={() => null}
      />
    </>
  );
};
