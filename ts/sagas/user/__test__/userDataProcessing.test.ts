import { testSaga } from "redux-saga-test-plan"
import { manageUserDataProcessingSaga, upsertUserDataProcessingSaga } from '../userDataProcessing'
import { UserDataProcessingChoiceEnum } from '../../../../definitions/backend/UserDataProcessingChoice';
import { loadUserDataProcessing } from '../../../store/actions/userDataProcessing';
import { right, left } from 'fp-ts/lib/Either';
import { UserDataProcessing } from '../../../../definitions/backend/UserDataProcessing';
import { UserDataProcessingStatusEnum } from '../../../../definitions/backend/UserDataProcessingStatus';

describe('manageUserDataProcessingSaga', () => {
    const getUserDataProcessing = jest.fn();
    const createOrUpdateUserDataProcessing = jest.fn();
    const choice = UserDataProcessingChoiceEnum.DOWNLOAD;
    
    it('while managing the first request of data export, check if previous request are WIP and, otherwise, submit a new request', () => {
        
        const nextData: UserDataProcessing = {
            choice,
            status: UserDataProcessingStatusEnum.PENDING,
            version: 1
        }
        const get404Response = right({status: 404});

        testSaga(
            manageUserDataProcessingSaga, 
            getUserDataProcessing, 
            createOrUpdateUserDataProcessing, 
            choice)
        .next()
        .put(loadUserDataProcessing.request(choice))
        .next()
        .call(getUserDataProcessing, { userDataProcessingChoiceParam: choice})
        .next(get404Response)
        .put(loadUserDataProcessing.success({choice, value: undefined}))
        .next()
        .call(upsertUserDataProcessingSaga, createOrUpdateUserDataProcessing, nextData)
        .next()
    });

    it('while managing a new request of data export, if the previous request elaboration has been completed submit a new request', () => {
       
        const currentData: UserDataProcessing = {
            choice,
            status: UserDataProcessingStatusEnum.CLOSED,
            version: 1
        }
        const get200Response = right({status: 200, value: currentData})

        const nextData: UserDataProcessing = {
            choice,
            status: UserDataProcessingStatusEnum.PENDING,
            version: 2
        }

        testSaga(
            manageUserDataProcessingSaga, 
            getUserDataProcessing, 
            createOrUpdateUserDataProcessing, 
            choice)
        .next()
        .put(loadUserDataProcessing.request(choice))
        .next()
        .call(getUserDataProcessing, { userDataProcessingChoiceParam: choice})
        .next(get200Response)
        .put(loadUserDataProcessing.success({choice, value: currentData}))
        .next()
        .call(upsertUserDataProcessingSaga, createOrUpdateUserDataProcessing, nextData)
        .next()
    });

    it('while managing a new request of data export, if the previous request elaboration has not been completed does nothing', () => {
       
        const choice = UserDataProcessingChoiceEnum.DOWNLOAD;
        const currentData: UserDataProcessing = {
            choice,
            status: UserDataProcessingStatusEnum.PENDING,
            version: 2
        }
        const get200Response = right({status: 200, value: currentData})

        testSaga(
            manageUserDataProcessingSaga, 
            getUserDataProcessing, 
            createOrUpdateUserDataProcessing, 
            choice)
        .next()
        .put(loadUserDataProcessing.request(choice))
        .next()
        .call(getUserDataProcessing, { userDataProcessingChoiceParam: choice})
        .next(get200Response)
        .put(loadUserDataProcessing.success({choice, value: currentData}))
        .next()
    });

    it('while managing a new request of data export, if the previous request elaboration has not been completed does nothing', () => {
        const choice = UserDataProcessingChoiceEnum.DOWNLOAD;
        const mokedError = new Error('An error occurs while fetching data on user data processisng status')
        const getError = left({value: 'Generic Error'})

        testSaga(
            manageUserDataProcessingSaga, 
            getUserDataProcessing, 
            createOrUpdateUserDataProcessing, 
            choice)
        .next()
        .put(loadUserDataProcessing.request(choice))
        .next()
        .call(getUserDataProcessing, { userDataProcessingChoiceParam: choice})
        .next(getError)
        .put(loadUserDataProcessing.failure({choice, error: mokedError}))
        .next()
    });


})