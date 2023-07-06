import * as React from "react";
import { View } from "react-native";
import { Banner } from "../../../components/Banner";
import { VSpacer } from "../../../components/core/spacer/Spacer";
import { useIODispatch } from "../../../store/hooks";
import { itwActivationStart } from "../store/actions";

export type ItwActionBannerProps = {
  title: string;
  content: string;
  action: string;
  labelClose: string;
};

/**
 * The base graphical component, take a text as input and dispatch onPress when pressed
 * include also a close button
 */
export const ItwActionBanner = ({
  title,
  content,
  action,
  labelClose
}: ItwActionBannerProps): React.ReactElement => {
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
        title={title}
        content={content}
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        pictogramName={"setup"}
        action={action}
        labelClose={labelClose}
        onPress={() => dispatch(itwActivationStart())}
        onClose={() => null}
      />
    </>
  );
};
