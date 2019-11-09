// @flow

import { put, call } from 'redux-saga/effects'
import { produce } from 'immer'

import createMetaAction from 'utils/create-meta-action'

type FetchState<T> = {|
  isFetching: boolean,
  isFetched: boolean,
  data: null | T,
  error: null | string,
|}

const PREFIX = 'fetch'

const STARTED = `${PREFIX}@STARTED`
const SUCCESS = `${PREFIX}@SUCCESS`
const FAILURE = `${PREFIX}@FAILURE`


const createMetaActions = name => ({
  started: createMetaAction(name, STARTED),
  success: createMetaAction(name, SUCCESS),
  failure: createMetaAction(name, FAILURE),
  clear: createMetaAction(name, CLEAR),
})

export const domainFetch = domain => `${domain}@FETCH`
export const domainSend = domain => `${domain}@SEND`
export const domainDelete = domain => `${domain}@DELETE`
export const domainClear = domain => `${domain}@CLEAR`
export const domainChangeTable = domain => `${domain}@CHANGE_TABLE`
export const domainFormAction = domain => `${domain}@FORM_ACTION`

export const domainFetchAction = (domain, rest) => ({
  type: domainFetch(domain),
  ...rest,
})

export const createFetchSaga = ({
  type,
  apiMethod,
  handleSuccess,
  handleError,
}) => {
  const { started, success, failure } = createMetaActions(type)

  return function*({ type, payload, suppressErrorNotification, ...rest }) {
    yield put(started())

    try {
      const response = yield call(apiMethod, payload)
      const data = Array.isArray(response)
        ? response.map(({ data }) => data)
        : response.data

      const handledData = typeof handleSuccess === 'function' ? yield handleSuccess(data, rest) : data

      yield put(success(handledData))
    } catch (error) {

      const handledError = typeof handleError === 'function'? yield handleError(error, rest) : error

      yield put(failure(handledError))
    }
  }
}

export default <T>(domain: string) => {

  const reducers = {
    [STARTED]: produce((next: FetchState<T>) => {
      next.isFetching = true
      next.isFetched = false
    }),
    [SUCCESS]: produce((next: FetchState<T>, { payload: T }) => {
      next.isFetching = false
      next.isFetched = true
      next.error = null
      next.data = payload
    }),
    [FAILURE]: produce((next: FetchState<T>, { payload: T }) => {
      next.isFetching = false
      next.isFetched = true
      next.error = payload
    }),
    [CLEAR]: produce((next: FetchState<T>: FetchSate<T>) => {
      next.error = null
      next.data = null
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

  return {
    reducers,
    initialState,
    selectors,
  }
}
