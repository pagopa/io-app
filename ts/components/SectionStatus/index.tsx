import React from "react";
import { connect } from "react-redux";
import _ from "lodash";
import { Pressable, View } from "react-native";
import { Text } from "native-base";
import { GlobalState } from "../../store/reducers/types";
import {
  SectionStatusKey,
  sectionStatusSelector
} from "../../store/reducers/backendStatus";
import I18n from "../../i18n";
import { maybeNotNullyString } from "../../utils/strings";
import { openWebUrl } from "../../utils/url";
import { getFullLocale } from "../../utils/locale";
import { LevelEnum } from "../../../definitions/content/SectionStatus";
import { useNavigationContext } from "../../utils/hooks/useOnFocus";
import { IOColors } from "../core/variables/IOColors";
import StatusContent from "./StatusContent";

type OwnProps = {
  sectionKey: SectionStatusKey;
  onSectionRef?: (ref: React.RefObject<View>) => void;
};

type Props = OwnProps & ReturnType<typeof mapStateToProps>;

export const statusColorMap: Record<LevelEnum, string> = {
  [LevelEnum.normal]: IOColors.aqua,
  [LevelEnum.critical]: IOColors.red,
  [LevelEnum.warning]: IOColors.orange
};

const statusIconMap: Record<LevelEnum, string> = {
  [LevelEnum.normal]: "io-complete",
  [LevelEnum.critical]: "io-warning",
  [LevelEnum.warning]: "io-info"
};
const color = IOColors.white;

/**
 * this component shows a full width banner with an icon and text
 * it could be tappable if the web url is defined
 * it renders nothing if for the given props.sectionKey there is no data or it is not visible
 * @param props
 */
const SectionStatus: React.FC<Props> = (props: Props) => {
  if (props.sectionStatus === undefined) {
    return null;
  }
  if (props.sectionStatus.is_visible !== true) {
    return null;
  }

  const viewRef = React.createRef<View>();
  const sectionStatus = props.sectionStatus;
  const iconName = statusIconMap[sectionStatus.level];
  const backgroundColor = statusColorMap[sectionStatus.level];
  const locale = getFullLocale();
  const maybeWebUrl = maybeNotNullyString(
    sectionStatus.web_url && sectionStatus.web_url[locale]
  );
  const navigation = useNavigationContext();

  const handleOnSectionRef = () => {
    if (viewRef.current) {
      props.onSectionRef?.(viewRef);
    }
  };

  const accessibilityLabel = maybeWebUrl.fold(
    `${sectionStatus.message[locale]}, ${I18n.t("global.accessibility.alert")}`,
    _ =>
      `${sectionStatus.message[locale]}, ${I18n.t(
        "global.sectionStatus.moreInfo"
      )}`
  );

  const innerSectionChildren = maybeWebUrl.fold(
    <>{sectionStatus.message[locale]}</>,
    _ => (
      <>
        {`${sectionStatus.message[locale]} `}
        <Text
          testID={"SectionStatusComponentMoreInfo"}
          style={{
            color,
            textDecorationLine: "underline",
            fontWeight: "bold"
          }}
        >
          {I18n.t("global.sectionStatus.moreInfo")}
        </Text>
      </>
    )
  );

  React.useEffect(() => {
    handleOnSectionRef();
    const unsubscribe = navigation?.addListener("didFocus", handleOnSectionRef);
    return () => unsubscribe?.remove();
  }, [viewRef]);

  return maybeWebUrl.fold(
    <StatusContent
      accessibilityLabel={accessibilityLabel}
      backgroundColor={backgroundColor}
      iconColor={color}
      iconName={iconName}
      testID={"SectionStatusComponentContent"}
      viewRef={viewRef}
    >
      {innerSectionChildren}
    </StatusContent>,
    webUrl => (
      <Pressable
        testID={"SectionStatusComponentPressable"}
        onPress={() => openWebUrl(webUrl)}
      >
        <StatusContent
          accessibilityLabel={accessibilityLabel}
          accessibilityRole={"link"}
          backgroundColor={backgroundColor}
          iconColor={color}
          iconName={iconName}
          viewRef={viewRef}
        >
          {innerSectionChildren}
        </StatusContent>
      </Pressable>
    )
  );
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
