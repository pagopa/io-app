import * as React from "react";
import { GestureResponderEvent, View } from "react-native";
import { Banner, VSpacer } from "@pagopa/io-app-design-system";
import { useIODispatch } from "../../../store/hooks";
import { itwActivationStart } from "../store/actions/itwActivationActions";

/**
 * Common props for the component which are always required.
 */
type CommonProps = {
  title: string;
  content: string;
  action: string;
};

/**
 * Discriminated union props for the component which make the onClose callback optional and labelClose required if onClose is defined.
 */
type TruncateProps =
  | { onClose?: (event: GestureResponderEvent) => void; labelClose?: never }
  | { onClose: (event: GestureResponderEvent) => void; labelClose: string };

type ItwActionBannerProps = CommonProps & TruncateProps;

/**
 * The base graphical component, take a text as input and dispatch onPress when pressed
 * include also a close button
 */
export const ItwActionBanner = ({
  title,
  content,
  action,
  onClose,
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
        color={"turquoise"}
        size="big"
        title={title}
        content={content}
        pictogramName={"itWallet"}
        action={action}
        labelClose={labelClose}
        onPress={() => dispatch(itwActivationStart())}
        onClose={onClose}
      />
    </>
  );
};
