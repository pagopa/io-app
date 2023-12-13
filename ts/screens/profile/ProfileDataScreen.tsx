import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import { List } from "native-base";
import * as React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import ListItemComponent from "../../components/screens/ListItemComponent";
import { RNavScreenWithLargeHeader } from "../../components/ui/RNavScreenWithLargeHeader";
import { isNewCduFlow } from "../../config";
import I18n from "../../i18n";
import {
  navigateToEmailInsertScreen,
  navigateToEmailReadScreen
} from "../../store/actions/navigation";
import {
  hasProfileEmailSelector,
  isProfileEmailValidatedSelector,
  profileEmailSelector,
  profileNameSurnameSelector
} from "../../store/reducers/profile";
import { GlobalState } from "../../store/reducers/types";

type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps>;

const ProfileDataScreen: React.FC<Props> = ({
  profileEmail,
  isEmailValidated,
  navigateToEmailReadScreen,
  navigateToEmailInsertScreen,
  hasProfileEmail,
  nameSurname
}): React.ReactElement => {
  const onPressEmail = () => {
    if (hasProfileEmail) {
      if (isNewCduFlow) {
        navigateToEmailInsertScreen();
      } else {
        navigateToEmailReadScreen();
      }
    } else {
      navigateToEmailInsertScreen();
    }
  };
  return (
    <RNavScreenWithLargeHeader
      title={I18n.t("profile.data.title")}
      description={I18n.t("profile.data.subtitle")}
      headerActionsProp={{ showHelp: true }}
      faqCategories={["profile", "privacy", "authentication_SPID"]}
    >
      <List withContentLateralPadding>
        {/* Show name and surname */}
        {nameSurname && (
          <ListItemComponent
            title={I18n.t("profile.data.list.nameSurname")}
            subTitle={nameSurname}
            hideIcon
            testID="name-surname"
          />
        )}
        {/* Insert or edit email */}
        <ListItemComponent
          title={I18n.t("profile.data.list.email")}
          subTitle={pipe(
            profileEmail,
            O.getOrElse(() => I18n.t("global.remoteStates.notAvailable"))
          )}
          titleBadge={
            !isEmailValidated
              ? I18n.t("profile.data.list.need_validate")
              : undefined
          }
          onPress={onPressEmail}
          testID="insert-or-edit-email"
        />
      </List>
    </RNavScreenWithLargeHeader>
  );
};

const mapDispatchToProps = (_: Dispatch) => ({
  navigateToEmailReadScreen: () => navigateToEmailReadScreen(),
  navigateToEmailInsertScreen: () => navigateToEmailInsertScreen()
});

const mapStateToProps = (state: GlobalState) => ({
  profileEmail: profileEmailSelector(state),
  isEmailValidated: isProfileEmailValidatedSelector(state),
  hasProfileEmail: hasProfileEmailSelector(state),
  nameSurname: profileNameSurnameSelector(state)
});

export default connect(mapStateToProps, mapDispatchToProps)(ProfileDataScreen);
