import { constUndefined } from "fp-ts/lib/function";
import { ComponentProps } from "react";
import { createStore } from "redux";
import ROUTES from "../../../navigation/routes";
import { applicationChangeState } from "../../../store/actions/application";
import { appReducer } from "../../../store/reducers";
import { GlobalState } from "../../../store/reducers/types";
import { renderScreenWithNavigationStoreContext } from "../../../utils/testWrapper";
import {
  IOScrollViewCentredContent,
  IOScrollViewCentredContentProps
} from "../IOScrollViewCentredContent";
import { IOScrollViewActions } from "../IOScrollView";

const actions: ReadonlyArray<IOScrollViewActions> = [
  {
    type: "SingleButton",
    primary: {
      label: "primary button",
      onPress: constUndefined
    }
  },
  {
    type: "TwoButtons",
    primary: {
      label: "primary button",
      onPress: constUndefined
    },
    secondary: {
      label: "secondary button",
      onPress: constUndefined
    }
  },
  {
    type: "ThreeButtons",
    primary: {
      label: "primary button",
      onPress: constUndefined
    },
    secondary: {
      label: "secondary button",
      onPress: constUndefined
    },
    tertiary: {
      label: "tertiary button",
      onPress: constUndefined
    }
  }
];

const propsFromAction = (
  action: IOScrollViewActions,
  description?: string,
  additionalLink?: IOScrollViewCentredContentProps["additionalLink"]
): IOScrollViewCentredContentProps => ({
  actions: action,
  additionalLink,
  description,
  pictogram: "success",
  title: "This is a title"
});

const availableProps: ReadonlyArray<IOScrollViewCentredContentProps> = [
  ...[...actions].map(action => propsFromAction(action)),
  ...[...actions].map(action =>
    propsFromAction(action, "This is a description")
  ),
  ...[...actions].map(action =>
    propsFromAction(action, undefined, {
      label: "Additional Label",
      onPress: constUndefined
    })
  ),
  ...[...actions].map(action =>
    propsFromAction(action, "This is a description", {
      label: "Additional Label",
      onPress: constUndefined
    })
  )
];

describe("IOScrollViewCentredContent", () => {
  availableProps.forEach(availableProp =>
    it(`should match snapshot, ${
      availableProp.description ? "with    " : "without "
    } description, ${
      availableProp.additionalLink ? "with    " : "without "
    } additional link, ${availableProp.actions.type}`, () =>
      expect(renderComponent(availableProp).toJSON()).toMatchSnapshot())
  );
});

function renderComponent(
  props: ComponentProps<typeof IOScrollViewCentredContent>
) {
  const globalState = appReducer(undefined, applicationChangeState("active"));
  return renderScreenWithNavigationStoreContext<GlobalState>(
    () => <IOScrollViewCentredContent {...props} />,
    ROUTES.WALLET_HOME,
    {},
    createStore(appReducer, globalState as any)
  );
}
