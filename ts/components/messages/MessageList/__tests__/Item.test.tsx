import { fireEvent, render } from "@testing-library/react-native";
import React from "react";
import configureMockStore from "redux-mock-store";
import { Provider } from "react-redux";
import { MessageCategory } from "../../../../../definitions/backend/MessageCategory";
import { TagEnum } from "../../../../../definitions/backend/MessageCategoryBase";
import { TagEnum as TagEnumPN } from "../../../../../definitions/backend/MessageCategoryPN";
import { successReloadMessagesPayload } from "../../../../features/messages/__mocks__/messages";
import Item from "../Item";
import { GlobalState } from "../../../../store/reducers/types";
import { applicationChangeState } from "../../../../store/actions/application";
import { appReducer } from "../../../../store/reducers";
import { PaymentByRptIdState } from "../../../../store/reducers/entities/payments";

jest.mock("../../../../config", () => ({
  pnEnabled: true
}));
jest.useFakeTimers();

const messages = successReloadMessagesPayload.messages;

const defaultProps: React.ComponentProps<typeof Item> = {
  category: { tag: "GENERIC" } as MessageCategory,
  isRead: false,
  isSelected: false,
  isSelectionModeEnabled: false,
  message: messages[0],
  onLongPress: jest.fn(),
  onPress: jest.fn()
};

describe("MessageList Item component", () => {
  describe("with all the flags set to false", () => {
    it("should match the snapshot", () => {
      const component = renderComponent(<Item {...defaultProps} />);
      expect(component.toJSON()).toMatchSnapshot();
    });
  });

  describe("when `isRead` is true", () => {
    it("should match the snapshot", () => {
      expect(
        renderComponent(<Item {...defaultProps} isRead={true} />).toJSON()
      ).toMatchSnapshot();
    });
  });

  describe(`when category is ${TagEnum.LEGAL_MESSAGE}`, () => {
    it("should match the snapshot", () => {
      expect(
        renderComponent(
          <Item {...defaultProps} category={{ tag: TagEnum.LEGAL_MESSAGE }} />
        ).toJSON()
      ).toMatchSnapshot();
    });
  });

  describe(`when category is ${TagEnumPN.PN}`, () => {
    it("should match the snapshot", () => {
      expect(
        renderComponent(
          <Item
            {...defaultProps}
            category={{ tag: TagEnumPN.PN } as MessageCategory}
          />
        ).toJSON()
      ).toMatchSnapshot();
    });
  });

  describe("when `isSelectionModeEnabled` is true", () => {
    describe("and `isSelected` is false", () => {
      it("should match the snapshot", () => {
        expect(
          renderComponent(
            <Item {...defaultProps} isSelectionModeEnabled={true} />
          ).toJSON()
        ).toMatchSnapshot();
      });
    });
    describe("and `isSelected` is true", () => {
      it("should match the snapshot", () => {
        expect(
          renderComponent(
            <Item
              {...defaultProps}
              isSelectionModeEnabled={true}
              isSelected={true}
            />
          ).toJSON()
        ).toMatchSnapshot();
      });
    });
  });

  [
    {
      category: { ...defaultProps.category } as MessageCategory,
      rptIds: {} as PaymentByRptIdState,
      rptIdMatches: false
    },
    {
      category: { tag: "PAYMENT", rptId: "rptIdFound" } as MessageCategory,
      rptIds: {
        rptIdFound: {
          kind: "COMPLETED",
          transactionId: 1
        }
      } as PaymentByRptIdState,
      rptIdMatches: true
    },
    {
      category: {
        tag: "PAYMENT",
        rptId: "rptIdNotFound"
      } as MessageCategory,
      rptIds: {} as PaymentByRptIdState,
      rptIdMatches: false
    },
    // with Green Pass
    {
      category: { tag: "EU_COVID_CERT" } as MessageCategory,
      rptIds: {} as PaymentByRptIdState,
      rptIdMatches: false
    }
  ].forEach(testProps => {
    describe(`when category=${testProps.category.tag} and rptId matches=${testProps.rptIdMatches}`, () => {
      it("should match the snapshot", () => {
        expect(
          renderComponent(
            <Item {...defaultProps} {...testProps} />,
            testProps.rptIds
          ).toJSON()
        ).toMatchSnapshot();
      });
    });
  });

  describe("when the user taps on the item", () => {
    it("should call only the `onPress` callback", () => {
      const onPress = jest.fn();
      const onLongPress = jest.fn();
      const component = renderComponent(
        <Item {...defaultProps} onPress={onPress} onLongPress={onLongPress} />
      );
      fireEvent(component.getByText(defaultProps.message.title), "onPress");
      expect(onPress).toHaveBeenCalledTimes(1);
      expect(onLongPress).not.toHaveBeenCalled();
    });
  });

  describe("when the user long-presses the item", () => {
    it("should call only the `onLongPress` callback", () => {
      const onPress = jest.fn();
      const onLongPress = jest.fn();
      const component = renderComponent(
        <Item {...defaultProps} onPress={onPress} onLongPress={onLongPress} />
      );
      fireEvent(component.getByText(defaultProps.message.title), "onLongPress");
      expect(onPress).not.toHaveBeenCalled();
      expect(onLongPress).toHaveBeenCalledTimes(1);
    });
  });
});

const renderComponent = (
  component: JSX.Element,
  rptIds: PaymentByRptIdState = {}
) => {
  const globalState = appReducer(undefined, applicationChangeState("active"));
  const enrichedState = {
    ...globalState,
    entities: {
      ...globalState.entities,
      paymentByRptId: {
        ...globalState.entities.paymentByRptId,
        ...rptIds
      }
    }
  };
  const mockStore = configureMockStore<GlobalState>();
  const store: ReturnType<typeof mockStore> = mockStore(enrichedState);
  return render(<Provider store={store}>{component}</Provider>);
};
