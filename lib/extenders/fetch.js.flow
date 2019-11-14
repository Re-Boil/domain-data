// @flow
import type { Saga } from 'redux-saga'
import { put, call } from 'redux-saga/effects'
import produce from 'immer'

import createMetaAction from 'utils/create-meta-action'

const STARTED: 'fetch@STARTED' = `fetch@STARTED`
const SUCCESS: 'fetch@SUCCESS' = `fetch@SUCCESS`
const FAILURE: 'fetch@FAILURE' = `fetch@FAILURE`

type FetchState<T> = {|
  isFetching: boolean,
  isFetched: boolean,
  data: null | T,
  error: null | string,
|}

// type FetchStartAction = {
//   type: typeof STARTED,
// }

type FetchSuccessAction<T> = {
  type: typeof SUCCESS,
  payload: T,
}

type FetchFailAction = {
  type: typeof FAILURE,
  payload: string,
}

export const Fetch = (domain: string) => `${domain}@FETCH`
// export const domainSend = domain => `${domain}@SEND`
// export const domainDelete = domain => `${domain}@DELETE`
// export const domainClear = domain => `${domain}@CLEAR`
// export const domainChangeTable = domain => `${domain}@CHANGE_TABLE`
// export const domainFormAction = domain => `${domain}@FORM_ACTION`

export const FetchAction = (domain: string, rest: any) => ({
  type: Fetch(domain),
  ...rest,
})

const createMetaActions = <T>(domain: string) => ({
  started: createMetaAction<typeof STARTED, null>(domain, STARTED),
  success: createMetaAction<typeof SUCCESS, T>(domain, SUCCESS),
  failure: createMetaAction<typeof FAILURE, string>(domain, FAILURE),
  // clear: createMetaAction(name, CLEAR),
})

type HandlerFunction<T> = (T, ...rest?: any[]) => T

type TFetchAction<T> = {
  type: string,
  payload: T,
  suppressErrorNotification?: boolean,
  [string]: any,
}

const woTransform: HandlerFunction<any> = data => data

type FetchSagaOptions<T> = {|
  api: () => Promise<any> | any,
  handleSuccess?: HandlerFunction<T>,
  handleError?: HandlerFunction<T>,
|}

const createFetchSaga = <T>(domain: string) => {
  const { started, success, failure } = createMetaActions<T>(domain)

  return ({ api, handleSuccess = woTransform, handleError = woTransform }: FetchSagaOptions<T>) => {
    // $FlowFixMe
    function* FetchSaga({ type, payload, suppressErrorNotification, ...rest }: TFetchAction<T>): Saga<void> {
      // $FlowFixMe
      yield put(started()) // FIXME: maybe refactor createMetaAction?

      try {
        const response: { data: T } = yield call(api, payload)
        const data: T = Array.isArray(response) ? response.map(({ data }) => data) : response.data

        const handledData = yield handleSuccess(data, rest)

        yield put(success(handledData))
      } catch (error) {
        const handledError = yield handleError(error, rest)

        yield put(failure(handledError))
      }
    }

    return FetchSaga
  }
}

const FetchFactory = <T>(domain: string) => {
  const reducers = {
    [STARTED]: produce<FetchState<T>>(next => {
      next.isFetching = true
      next.isFetched = false
    }),
    [SUCCESS]: produce<FetchState<T>, FetchSuccessAction<T>>((next, { payload }: FetchSuccessAction<T>) => {
      next.isFetching = false
      next.isFetched = true
      next.error = null
      next.data = payload
    }),
    [FAILURE]: produce<FetchState<T>, FetchFailAction>((next, { payload }: FetchFailAction) => {
      next.isFetching = false
      next.isFetched = true
      next.error = payload
    }),
  }

  const initialState: FetchState<T> = {
    isFetching: false,
    isFetched: false,
    data: null,
    error: null,
  }

  const selectors = {
    isFetching: (state: FetchState<T>) => state.isFetching,
    isFetched: (state: FetchState<T>) => state.isFetching,
    data: (state: FetchState<T>) => state.data,
    error: (state: FetchState<T>) => state.error,
  }

  const actions = {
    fetch: (...rest: any[]) => FetchAction(domain, rest),
  }

  return {
    reducers,
    initialState,
    selectors,
    actions,
    sagas: {
      fetch: createFetchSaga(domain),
    },
  }
}

export default FetchFactory
