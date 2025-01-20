# Background Fetch Feature

This feature provides a wrapper around the [`react-native-background-fetch`](https://github.com/transistorsoft/react-native-background-fetch) package to manage background tasks in the app. It allows scheduling periodic background tasks and handling background fetch events in a type-safe manner.

## Setup

Initialize the background fetch functionality by using the `useBackgroundFetch` hook in the IO app's root component:

```typescript
function RootContainer() {
    useBackgroundFetch();
    // ... rest of your app
}
```

## Usage

### Automatic Background Fetch

The feature automatically configures a periodic background fetch that runs at intervals defined by `backgroundFetchIntervalMinutes` in the app's config. This default task uses the `REACT_NATIVE_BACKGROUND_FETCH` env variable.

### Scheduling Custom Tasks

To schedule a custom background task:

1. Add your task identifier to the `BackgroundFetchTaskId` enum:

```typescript
export enum BackgroundFetchTaskId {
    REACT_NATIVE_BACKGROUND_FETCH = "react-native-background-fetch",
    YOUR_CUSTOM_TASK = "your-custom-task-id"
}
```

2. For iOS, in case there is the need to use a scheduled task, add the task identifiers to `Info.plist` under `BGTaskSchedulerPermittedIdentifiers`:

    ```xml
    <key>BGTaskSchedulerPermittedIdentifiers</key>
    <array>
        <string>it.pagopa.app.io.your-task-identifier</string>
        <!-- Add other task identifiers here -->
    </array>
    ```

2. Dispatch the schedule action with your task configuration:

    ```typescript
    dispatch(
        backgroundFetchScheduleTask({
            taskId: BackgroundFetchTaskId.YOUR_CUSTOM_TASK,
            delay: 5000, // milliseconds
            periodic: true
        })
    );
    ```

3. Handle the task in `handleBackgroundFetchEventSaga.ts`:

```typescript
export function handleBackgroundFetchEventSaga(action: ActionType<typeof backgroundFetchEvent>) {
    switch (action.payload) {
        case BackgroundFetchTaskId.YOUR_CUSTOM_TASK:
            yield call(yourCustomTaskSaga);
            break;
    }

    // Always finish the task
    yield call(BackgroundFetch.finish, action.payload);
}
```


### Canceling Tasks

To cancel a scheduled task:

```typescript
dispatch(
    backgroundFetchCancelTask(BackgroundFetchTaskId.YOUR_CUSTOM_TASK)
);
```


## Important Notes

1. **Task Completion**: Always ensure background tasks call `BackgroundFetch.finish(taskId)` when complete.
2. **iOS Limitations**: 
   - Background fetch events are not guaranteed to run at exact intervals
   - The system may adjust the frequency based on app usage patterns
   - Tasks have limited execution time (30 seconds)
3. **Android Considerations**:
   - Background tasks may be affected by battery optimization settings
   - Some manufacturers implement aggressive battery optimization that may interfere with background tasks
4. **Status Checking**: Before scheduling or canceling tasks, the feature automatically checks if background fetch is available on the device:

    ```typescript
    const isAvailable = yield select(backgroundFetchStatusSelector);
    ```

## TypeScript Support

The feature is fully typed, providing:
- Type-safe task configuration via `BackgroundFetchTaskConfig`
- Enum-based task identification with `BackgroundFetchTaskId`
- Type-safe Redux actions and state