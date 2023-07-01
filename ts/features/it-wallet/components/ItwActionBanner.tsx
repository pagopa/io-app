import * as React from "react";
import { View } from "react-native";
import { Banner } from "../../../components/Banner";
import { VSpacer } from "../../../components/core/spacer/Spacer";
import I18n from "../../../i18n";
import { useIODispatch } from "../../../store/hooks";
import { itwActivationStart } from "../store/actions";

/**
 * The base graphical component, take a text as input and dispatch onPress when pressed
 * include also a close button
 */
export const ItwActionBanner = (): React.ReactElement => {
  const viewRef = React.createRef<View>();
  const dispatch = useIODispatch();
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
        labelClose={I18n.t("features.itWallet.actionBanner.hideLabel")}
        onPress={() => dispatch(itwActivationStart())}
        onClose={() => null}
      />
    </>
  );
};
