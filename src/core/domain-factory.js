// @flow

import type { Action } from 'redux'
import type { Saga } from 'redux-saga'
import createMetaReducer, { type MetaReducer } from 'utils/create-meta-reducer'
import { get, reduceWith } from 'utils/common'

export type SagaCreator = any => Saga<*>

type ExtenderConfiguration<Actions> = {|
  actions: any => Action<$ElementType<Actions, 'type'>> | { [string]: (any) => Action<$ElementType<Actions, 'type'>> },
  initialState: any,
  reducers: { [$ElementType<Actions, 'type'>]: MetaReducer<any, any> },
  middlewares: SagaCreator | Saga<*> | { [string]: SagaCreator | Saga<*> },
  selectors: {
    [string]: (any) => any,
  },
|}

export type DomainExtender<Actions> = (domain: string, getState: (any) => any) => ExtenderConfiguration<Actions>

const glueExtenders = (
  domain, //: string,
  extenders, // DomainExtenders<DS, A>,
  getState, // DomainSelector<DS>,
  bindAction,
) =>
  Object.keys(extenders).reduce(
    (result, extName) => {
      const extender = extenders[extName]
      const { reducers = {}, initialState = {}, selectors = {}, actions = {}, middlewares = {} } =
        typeof extender === 'function' ? extender(domain, getState) : extender

      return {
        reducers: {
          ...result.reducers,
          // $FlowFixMe
          ...(typeof reducers === 'function' ? { [extName]: reducers } : reducers),
        },
        initialState: {
          ...result.initialState,
          ...initialState,
        },
        selectors: {
          ...result.selectors,
          ...reduceWith(selectors, selector => () => selector(getState())),
        },
        actions: {
          ...result.actions,
          // $FlowFixMe
          ...(typeof actions === 'function'
            ? { [extName]: bindAction(actions) }
            : reduceWith(actions, action => bindAction(action))),
        },
        middlewares: {
          ...result.middlewares,
          [extName]: middlewares,
        },
      }
    },
    {
      reducers: {},
      initialState: {},
      selectors: {},
      actions: {},
      middlewares: {},
    },
  )

const defaultReducer = state => state

const reducersWrapper = (reducers, initialState) => (state, action) => {
  const reducer = reducers[action.type] || defaultReducer

  return reducer(state || initialState, action)
}

function DomainFactory(extenders: { [string]: DomainExtender<any> } = {}, state: {} = {}) {
  const createDomain = (domain: string, getState: () => any, bindAction: any => any) => {
    const domainSelector = get(domain)
    const selector = () => domainSelector(getState())

    const { reducers, initialState, selectors, actions, middlewares } = glueExtenders(
      domain,
      extenders,
      selector,
      bindAction,
    )

    const wrappedReducer = reducersWrapper(reducers, { ...initialState, ...state })

    const reducer = createMetaReducer<any, any>(wrappedReducer, domain)

    return {
      reducer,
      selectors,
      actions,
      middlewares,
    }
  }

  return createDomain
}

export default DomainFactory
