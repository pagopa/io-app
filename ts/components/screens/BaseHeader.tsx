import { Millisecond } from "@pagopa/ts-commons/lib/units";
import { NavigationEvents } from "@react-navigation/compat";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import { Body as NBBody, Left, Right } from "native-base";
import * as React from "react";
import { FC, Ref } from "react";
import {
  View,
  AccessibilityInfo,
  ColorValue,
  StyleSheet,
  Text
} from "react-native";
import { connect } from "react-redux";
import I18n from "../../i18n";
import { navigateBack } from "../../store/actions/navigation";
import { Dispatch } from "../../store/actions/types";
import { assistanceToolConfigSelector } from "../../store/reducers/backendStatus";
import { isPagoPATestEnabledSelector } from "../../store/reducers/persistedPreferences";
import { isSearchEnabledSelector } from "../../store/reducers/search";
import { GlobalState } from "../../store/reducers/types";
import variables from "../../theme/variables";
import { setAccessibilityFocus } from "../../utils/accessibility";
import { maybeNotNullyString } from "../../utils/strings";
import ButtonDefaultOpacity from "../ButtonDefaultOpacity";
import { Body } from "../core/typography/Body";
import { IOColors } from "../core/variables/IOColors";
import GoBackButton from "../GoBackButton";
import SearchButton, { SearchType } from "../search/SearchButton";
import AppHeader from "../ui/AppHeader";
import { IOIcons, Icon } from "../core/icons/Icon";
import IconButton from "../ui/IconButton";
import { HSpacer } from "../core/spacer/Spacer";
import { IOSpacer } from "../core/variables/IOSpacing";

type HelpButtonProps = {
  dark?: boolean;
  onShowHelp: () => void;
};

const styles = StyleSheet.create({
  noLeft: {
    marginLeft: variables.contentPadding - variables.appHeaderPaddingHorizontal
  },
  body: {
    alignItems: "center"
  }
});

export const ICON_BUTTON_MARGIN: IOSpacer = 16;

const HelpButton: FC<HelpButtonProps> = ({ onShowHelp, dark }) => (
  <View>
    <IconButton
      onPress={onShowHelp}
      accessibilityLabel={I18n.t(
        "global.accessibility.contextualHelp.open.label"
      )}
      accessibilityHint={I18n.t(
        "global.accessibility.contextualHelp.open.hint"
      )}
      testID={"helpButton"}
      color={dark ? "contrast" : "neutral"}
      icon={"help"}
    />
  </View>
);

export type AccessibilityEvents = {
  avoidNavigationEventsUsage?: boolean; // if true NavigationEvents won't be included and the focus will be done on componentDidMount
  disableAccessibilityFocus?: boolean; // if true the setAccessibilityFocus is not triggered
};

interface OwnProps {
  onAccessibilityNavigationHeaderFocus?: () => void;
  accessibilityEvents?: AccessibilityEvents;
  accessibilityLabel?: string; // rendered only if it is defined and a screen reader is active
  dark?: boolean; // Used only for Icons color TODO Think to use titleColor as unique prop for icons color too
  headerTitle?: string;
  backgroundColor?: ColorValue;
  goBack?: React.ComponentProps<typeof GoBackButton>["goBack"];
  primary?: boolean; // Used only for Icons color TODO Think to use titleColor as unique prop for icons color too
  appLogo?: boolean;
  onShowHelp?: () => void;
  // A property to set a custom AppHeader body
  body?: React.ReactNode;
  isSearchAvailable?: {
    enabled: true;
    searchType?: SearchType;
    onSearchTap?: () => void;
  };
  showChat?: boolean;
  customRightIcon?: {
    iconName: IOIcons;
    onPress: () => void;
    accessibilityLabel: string;
  };
  customGoBack?: React.ReactNode;
  titleColor?: IOColors;
  backButtonTestID?: string;
}

type Props = OwnProps &
  ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps>;
type State = {
  isScreenReaderActive: boolean;
  isMounted: boolean;
};
const setAccessibilityTimeout = 0 as Millisecond;
const noReferenceTimeout = 150 as Millisecond;
/** A component representing the properties common to all the screens (and the most of modal/overlay displayed) */
class BaseHeaderComponent extends React.PureComponent<Props, State> {
  private firstElementRef = React.createRef<View>();

  public constructor(props: Props) {
    super(props);
    this.handleFocus = this.handleFocus.bind(this);
    this.state = { isScreenReaderActive: false, isMounted: false };
  }

  // set accessibility focus when component is mounted
  // it should be used paired with avoidNavigationEvents === true (navigation context not available)
  public componentDidMount() {
    this.setState({ isMounted: true });
    void AccessibilityInfo.isScreenReaderEnabled()
      .then(isScreenReaderActive => {
        if (this.state.isMounted) {
          this.setState({ isScreenReaderActive });
        }

        if (
          isScreenReaderActive &&
          pipe(
            this.props.accessibilityEvents,
            O.fromNullable,
            O.fold(
              () => false,
              ({ avoidNavigationEventsUsage }) => avoidNavigationEventsUsage
            )
          )
        ) {
          this.handleFocus();
        }
      })
      .catch(); // do nothing
  }

  public componentWillUnmount() {
    this.setState({ isMounted: false });
  }

  get canHandleFocus() {
    return pipe(
      this.props.accessibilityEvents,
      O.fromNullable,
      O.fold(
        () => true,
        ae => ae.disableAccessibilityFocus !== true
      )
    );
  }

  // set accessibility focus when this view comes visible
  public handleFocus() {
    if (!this.canHandleFocus) {
      return;
    }
    setTimeout(() => {
      // retry until the reference is defined
      if (this.firstElementRef === undefined) {
        this.handleFocus();
        return;
      }
      setAccessibilityFocus(
        this.firstElementRef as React.RefObject<View>,
        setAccessibilityTimeout,
        this.props.onAccessibilityNavigationHeaderFocus
      );
    }, noReferenceTimeout);
  }

  private renderBodyLabel = (label?: string, ref?: Ref<Text>) =>
    pipe(
      maybeNotNullyString(label),
      O.fold(
        () => undefined,
        l => {
          const { titleColor } = this.props;
          return (
            <Body
              ref={ref}
              weight={"Regular"}
              testID={"bodyLabel"}
              numberOfLines={1}
              accessible={true}
              accessibilityRole={"header"}
              color={titleColor === "white" ? "white" : "bluegrey"}
            >
              {/* TODO: titleColor prop is pretty useless because
              we have two colors: dark (bluegrey) and light (white).
              We don't have any color values other than these two. */}
              {l}
            </Body>
          );
        }
      )
    );

  public render() {
    const {
      goBack,
      customGoBack,
      headerTitle,
      backgroundColor,
      body,
      isSearchEnabled,
      dark,
      accessibilityLabel
    } = this.props;

    const maybeAccessibilityLabel = maybeNotNullyString(accessibilityLabel);
    return (
      <AppHeader
        backgroundColor={backgroundColor}
        primary={this.props.primary}
        noShadow={isSearchEnabled}
        dark={dark}
      >
        {this.renderLeft()}

        {/* if screen reader is active and the accessibility label is defined, render the accessibility label
          as placeholder where force focus
        */}
        {!isSearchEnabled && (
          <NBBody style={goBack || customGoBack ? styles.body : styles.noLeft}>
            {this.state.isScreenReaderActive &&
            O.isSome(maybeAccessibilityLabel) ? (
              this.renderBodyLabel(
                maybeAccessibilityLabel.value,
                this.firstElementRef
              )
            ) : (
              <View ref={this.firstElementRef} accessible={true}>
                {body ? body : headerTitle && this.renderBodyLabel(headerTitle)}
              </View>
            )}
          </NBBody>
        )}

        {this.renderRight()}
      </AppHeader>
    );
  }

  private renderRight = () => {
    const {
      isSearchEnabled,
      onShowHelp,
      isSearchAvailable,
      showChat,
      customRightIcon,
      dark
    } = this.props;

    return (
      <Right>
        {isSearchAvailable?.enabled && (
          <SearchButton
            searchType={isSearchAvailable.searchType}
            onSearchTap={isSearchAvailable.onSearchTap}
          />
        )}

        {customRightIcon && !isSearchEnabled && (
          <>
            <IconButton
              icon={customRightIcon.iconName}
              color="neutral"
              onPress={customRightIcon.onPress}
              accessibilityLabel={customRightIcon.accessibilityLabel}
            />
            {onShowHelp && <HSpacer size={ICON_BUTTON_MARGIN} />}
          </>
        )}

        {onShowHelp && !isSearchEnabled && (
          <HelpButton onShowHelp={onShowHelp} dark={dark} />
        )}

        {/* if no right button has been added, add a hidden one in order to make the body always centered on screen */}
        {!customRightIcon && !isSearchAvailable && !onShowHelp && !showChat && (
          <ButtonDefaultOpacity transparent={true} />
        )}

        {pipe(
          this.props.accessibilityEvents,
          O.fromNullable,
          O.fold(
            () => true,
            ({ avoidNavigationEventsUsage }) => !avoidNavigationEventsUsage
          )
        ) && <NavigationEvents onWillFocus={this.handleFocus} />}
      </Right>
    );
  };

  private renderGoBack = () => {
    const { goBack, dark, customGoBack, backButtonTestID } = this.props;
    return customGoBack ? (
      <Left>{customGoBack}</Left>
    ) : (
      goBack && (
        <Left>
          <GoBackButton
            testID={backButtonTestID ?? "back-button"}
            onPress={goBack}
            white={dark}
          />
        </Left>
      )
    );
  };

  private renderAppLogo = () => {
    const { isPagoPATestEnabled, primary, dark } = this.props;

    const iconColor: IOColors = isPagoPATestEnabled
      ? "aqua"
      : primary || dark
      ? "white"
      : "blue";
    return (
      <Left>
        <View
          accessible={true}
          accessibilityElementsHidden={true}
          importantForAccessibility="no-hide-descendants"
        >
          <Icon name="productIOApp" color={iconColor} accessible={false} />
        </View>
      </Left>
    );
  };

  private renderLeft = () => {
    const { isSearchEnabled, appLogo } = this.props;

    if (!isSearchEnabled) {
      if (appLogo) {
        return this.renderAppLogo();
      } else {
        return this.renderGoBack();
      }
    } else {
      return null;
    }
  };
}

const mapStateToProps = (state: GlobalState) => ({
  isSearchEnabled: isSearchEnabledSelector(state),
  isPagoPATestEnabled: isPagoPATestEnabledSelector(state),
  assistanceToolConfig: assistanceToolConfigSelector(state)
});

const mapDispatchToProps = (_: Dispatch) => ({
  navigateBack: () => navigateBack()
});

export const BaseHeader = connect(
  mapStateToProps,
  mapDispatchToProps
)(BaseHeaderComponent);
