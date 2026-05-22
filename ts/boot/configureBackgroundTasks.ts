import * as TaskManager from "expo-task-manager";

import {
  ITW_STATUS_LIST_FETCH_TASK,
  itwStatusListFetchTaskHandler
} from "../features/itwallet/statusList/tasks";

/**
 * BACKGROUND TASKS
 *
 * Background tasks must be defined in the global scope, outside of any React component.
 * See more details in the Expo documentation: https://docs.expo.dev/versions/latest/sdk/background-task/
 *
 * In case of multiple task definitions, the last registered background task determines the minimum interval
 * for execution (https://docs.expo.dev/versions/latest/sdk/background-task/#multiple-background-tasks)
 *
 */
TaskManager.defineTask(
  ITW_STATUS_LIST_FETCH_TASK,
  itwStatusListFetchTaskHandler
);
