import { useNavigation } from "@react-navigation/native";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import _ from "lodash";
import React, { ComponentProps, useCallback } from "react";
import { View } from "react-native";
import { connect } from "react-redux";
import { Alert } from "@pagopa/io-app-design-system";
import { LevelEnum } from "../../../definitions/content/SectionStatus";
import I18n from "../../i18n";
import {
  SectionStatusKey,
  sectionStatusSelector
} from "../../store/reducers/backendStatus";
import { GlobalState } from "../../store/reducers/types";
import { getFullLocale } from "../../utils/locale";
import { maybeNotNullyString } from "../../utils/strings";
import { openWebUrl } from "../../utils/url";

type OwnProps = {
  sectionKey: SectionStatusKey;
  onSectionRef?: (ref: React.RefObject<View>) => void;
};

type Props = OwnProps & ReturnType<typeof mapStateToProps>;

export const statusVariantMap: Record<
  LevelEnum,
  ComponentProps<typeof Alert>["variant"]
> = {
  [LevelEnum.normal]: "info",
  [LevelEnum.critical]: "error",
  [LevelEnum.warning]: "warning"
};

export const InnerSectionStatus = (
  props: Omit<Props, "sectionStatus"> & {
    sectionStatus: NonNullable<Props["sectionStatus"]>;
  }
) => {
  const viewRef = React.createRef<View>();
  const { sectionStatus, onSectionRef } = props;
  const locale = getFullLocale();
  const maybeWebUrl = maybeNotNullyString(
    sectionStatus.web_url && sectionStatus.web_url[locale]
  );
  const navigation = useNavigation();

  const handleOnSectionRef = useCallback(() => {
    if (viewRef.current) {
      onSectionRef?.(viewRef);
    }
  }, [onSectionRef, viewRef]);

  React.useEffect(() => {
    handleOnSectionRef();
    navigation?.addListener("focus", handleOnSectionRef);
    return () => navigation?.removeListener("focus", handleOnSectionRef);
  }, [handleOnSectionRef, navigation, viewRef]);

  return pipe(
    maybeWebUrl,
    O.fold(
      () => (
        // render text only
        <Alert
          fullWidth
          content={`${sectionStatus.message[locale]}`}
          variant={statusVariantMap[sectionStatus.level]}
          viewRef={viewRef}
        />
      ),
      webUrl => (
        // render a pressable element with the link
        <Alert
          fullWidth
          content={`${sectionStatus.message[locale]} `}
          variant={statusVariantMap[sectionStatus.level]}
          action={I18n.t("global.sectionStatus.moreInfo")}
          onPress={() => openWebUrl(webUrl)}
          viewRef={viewRef}
        />
      )
    )
  );
};

/**
 * this component shows a full width banner with an icon and text
 * it could be tappable if the web url is defined
 * it renders nothing if for the given props.sectionKey there is no data or it is not visible
 */
const SectionStatus: React.FC<Props> = (props: Props) => {
  if (props.sectionStatus === undefined) {
    return null;
  }
  if (props.sectionStatus.is_visible !== true) {
    return null;
  }
  return <InnerSectionStatus {...props} sectionStatus={props.sectionStatus} />;
};

const mapStateToProps = (state: GlobalState, props: OwnProps) => ({
  sectionStatus: sectionStatusSelector(props.sectionKey)(state)
});

/**
 * the component must be re-render only if the sectionStatus changes
 * this is not ensured by the selector because the backend status (update each 60sec)
 * is overwritten on each request
 */
const component = React.memo(SectionStatus, (prev: Props, curr: Props) =>
  _.isEqual(prev.sectionStatus, curr.sectionStatus)
);

export default connect(mapStateToProps)(component);
