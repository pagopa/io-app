import {
  applicationChangeState,
  startApplicationInitialization
} from "../../../../../store/actions/application";
import { GlobalState } from "../../../../../store/reducers/types";
import { setMessageSagasRegisteredAction } from "../../actions";
import {
  areMessageSagasRegisteredSelector,
  messageSectionStatusInitialState,
  messageSectionStatusReducer
} from "../messageSectionStatus";

describe("messageSectionStatus", () => {
  describe("initial state", () => {
    it("should match expected properties", () => {
      expect(messageSectionStatusInitialState).toEqual({
        messageSagasRegistered: false
      });
    });
  });
  describe("reducer", () => {
    it("should match expected output when undefined state is received", () => {
      const output = messageSectionStatusReducer(
        undefined,
        applicationChangeState("active")
      );
      expect(output).toEqual(messageSectionStatusInitialState);
    });
    it("should set 'messageSagasRegistered' to true after receiving action 'setMessageSagasRegisteredAction'", () => {
      const action = setMessageSagasRegisteredAction();
      const output = messageSectionStatusReducer(
        messageSectionStatusInitialState,
        action
      );
      expect(output).toEqual({
        messageSagasRegistered: true
      });
    });
    it("should set 'messageSagasRegistered' to false after receiving action 'startApplicationInitialization'", () => {
      const initialState = {
        ...messageSectionStatusInitialState,
        messageSagasRegistered: true
      };
      const action = startApplicationInitialization();
      const output = messageSectionStatusReducer(initialState, action);
      expect(output).toEqual({
        messageSagasRegistered: false
      });
    });
  });

  [false, true].forEach(messageSagasRegistered => {
    describe("areMessageSagasRegisteredSelector", () => {
      it(`should return '${messageSagasRegistered}' when 'messageSagasRegistered' is ${messageSagasRegistered}`, () => {
        const state = {
          entities: {
            messages: {
              sectionStatus: {
                messageSagasRegistered
              }
            }
          }
        } as GlobalState;
        const output = areMessageSagasRegisteredSelector(state);
        expect(output).toBe(messageSagasRegistered);
      });
    });
  });
});
