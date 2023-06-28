import * as React from "react";
import { View } from "react-native";
import { Banner } from "../../../components/Banner";
import { VSpacer } from "../../../components/core/spacer/Spacer";
import { WithTestID } from "../../../types/WithTestID";

type BaseProps = WithTestID<{
  title: string;
  description: string;
  action?: string;
  onPress?: () => void;
  onClose?: () => void;
}>;

/**
 * The base graphical component, take a text as input and dispatch onPress when pressed
 * include also a close button
 * @param props
 * @constructor
 */
export const ItwActionBanner = (props: BaseProps): React.ReactElement => {
  const viewRef = React.createRef<View>();
  return (
    <>
      <VSpacer size={24} />
      <Banner
        testID={"ItwBannerTestID"}
        viewRef={viewRef}
        color={"neutral"}
        variant="big"
        title={props.title}
        content={props.description}
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        pictogramName={"setup"}
        onClose={props.onClose}
        action={props.action}
        onPress={props.onPress}
        labelClose="Nascondi questo banner"
      />
    </>
  );
};
