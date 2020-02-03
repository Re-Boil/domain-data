// @flow
import type { Saga } from 'redux-saga'
import { call, put } from 'redux-saga/effects'

import produce from 'immer'

import type { DomainExtender, SagaCreator } from 'core/domain-factory'
import createMetaAction from 'utils/create-meta-action'
import { createAction, woTransform } from 'utils/common'

export const FETCH_STARTED: '@fetch/STARTED' = '@fetch/STARTED'
export const FETCH_SUCCESS: '@fetch/SUCCESS' = '@fetch/SUCCESS'
export const FETCH_FAILURE: '@fetch/FAILURE' = '@fetch/FAILURE'

export type FetchState<T> = {|
  isFetching: boolean,
  isFetched: boolean,
  data: T | null,
  error: string | null,
  timestamp: Date | null,
|}

type FetchStartAction = {|
  type: typeof FETCH_STARTED,
|}

type FetchSuccessAction<T> = {|
  type: typeof FETCH_SUCCESS,
  payload: T,
|}

type FetchFailAction = {|
  type: typeof FETCH_FAILURE,
  payload: string,
|}

export type FetchActions<T> = FetchSuccessAction<T> | FetchStartAction | FetchFailAction

const createMetaActions = <T>(domain: string) => ({
  started: createMetaAction<typeof FETCH_STARTED, void>(domain, FETCH_STARTED),
  success: createMetaAction<typeof FETCH_SUCCESS, T>(domain, FETCH_SUCCESS),
  failure: createMetaAction<typeof FETCH_FAILURE, string>(domain, FETCH_FAILURE),
})

type TFetchAction<T> = {
  type: string,
  payload: T,
  [string]: any,
}

type HandlerFunction<T> = (T, ...rest?: any[]) => T

type FetchSagaOptions<T> = {|
  api: () => Promise<any> | any,
  handleSuccess?: HandlerFunction<T>,
  handleError?: HandlerFunction<T>,
|}

type Interceptor<T> = (data: T, state?: any, ...rest: any[]) => T | Generator<void, T, empty>
type Transformer<FromT, ToT> = (data: FromT, state?: any, ...rest: any[]) => ToT

type FetchFactoryOptions<T> = {
  trasnformers?: {
    pre?: Transformer<any, any>,
    post?: Transformer<any, T>,
  },
  interceptors?: {
    success?: Interceptor<T>,
    error?: Interceptor<T | void>,
  },
}

const createFetchSaga = <T>(domain: string, getState: any => any, options?: FetchFactoryOptions<T>): SagaCreator => {
  const { started, success, failure } = createMetaActions<T>(domain)
  const preTransform: Transformer<any, T> = options?.trasnformers?.pre ?? woTransform
  const postTransform: Transformer<any, T> = options?.trasnformers?.post ?? woTransform
  const successInterceptor: Interceptor<T> = options?.interceptors?.success ?? woTransform
  const errorInterceptor: Interceptor<T | void> = options?.interceptors?.error ?? woTransform

  return ({ api, handleSuccess = woTransform, handleError = woTransform }: FetchSagaOptions<T>) => {
    // $FlowFixMe Saga<void>
    function* FetchSaga(action: TFetchAction<any>): Saga<void> {
      const { type, payload, ...rest } = action

      yield put(started())
      const state = yield getState()

      try {
        const response = yield call(api, preTransform(payload, state, rest), rest, state)

        let data = postTransform(response, state, rest)

        // $FlowFixMe Saga<void>
        data = yield successInterceptor(data, state, rest)
        data = yield handleSuccess(data, state, rest)

        yield put(success(data))
      } catch (error) {
        let errorData = yield errorInterceptor(error, state, action)

        errorData = yield handleError(errorData, rest, action)

        yield put(failure(errorData))
      }
    }

    return FetchSaga
  }
}

const FetchFactory = <T>(options?: FetchFactoryOptions<T>): DomainExtender<FetchActions<T>> => {
  // $FlowFixMe
  return (domain: string, getState: any => any) => {
    const reducers = {
      [FETCH_STARTED]: produce<FetchState<T>, FetchStartAction>((next: FetchState<T>) => {
        next.isFetching = true
        next.isFetched = false
      }),
      [FETCH_SUCCESS]: produce<FetchState<T>, FetchSuccessAction<T>>(
        (next: FetchState<T>, action: FetchSuccessAction<T>) => {
          next.isFetching = false
          next.isFetched = true
          next.error = null
          next.data = action.payload
          next.timestamp = new Date()
        },
      ),
      [FETCH_FAILURE]: produce<FetchState<T>, FetchFailAction>((next: FetchState<T>, action: FetchFailAction) => {
        next.isFetching = false
        next.isFetched = false
        next.error = action.payload
        next.timestamp = new Date()
      }),
    }

    const initialState: FetchState<T> = {
      isFetching: false,
      isFetched: false,
      data: null,
      error: null,
      timestamp: null,
    }

    const selectors = {
      isFetching: (state: FetchState<T>) => state.isFetching,
      isFetched: (state: FetchState<T>) => state.isFetched,
      data: (state: FetchState<T>) => state.data,
      error: (state: FetchState<T>) => state.error,
      updatedAt: (state: FetchState<T>) => state.timestamp,
    }

    return {
      reducers,
      initialState,
      selectors,
      actions: createAction(`${domain}@FETCH`),
      middlewares: createFetchSaga<T>(domain, getState, options),
    }
  }
}

export default FetchFactory
