// @flow

import type { Action } from 'redux'
import type { Saga } from 'redux-saga'
import createMetaReducer, { type MetaReducer } from 'utils/create-meta-reducer'
import { get, reduceWith, createAction } from 'utils/common'

export type SagaCreator = any => Saga<*>

type ActionCreator<Actions> = any => Action<$ElementType<Actions, 'type'>>

type ExtenderConfiguration<Actions> = {|
  actions: string | { [string]: string | ActionCreator<Actions> } | ActionCreator<Actions>,
  initialState: any,
  reducers: { [$ElementType<Actions, 'type'>]: MetaReducer<any, any> },
  middlewares: SagaCreator | Saga<*> | { [string]: SagaCreator | Saga<*> },
  selectors: {
    [string]: (any) => any,
  },
|}

export type DomainExtender<Actions> = (domain: string, getState: (any) => any) => ExtenderConfiguration<Actions>

const bindActions = (actions, bindAction, domain) => {
  if (typeof actions === 'function') {
    return bindAction(actions)
  }

  if (typeof actions === 'string') {
    return bindAction(createAction(`${domain}${actions}`))
  }

  return reduceWith(actions, action => bindActions(action, bindAction, domain))
}

const glueExtenders = (
  domain, //: string,
  extenders, // DomainExtenders<DS, A>,
  domainSelector, // DomainSelector<DS>,
  bindAction,
) =>
  Object.keys(extenders).reduce(
    (result, extName) => {
      const extender = extenders[extName]
      const { reducers, initialState, selectors, actions, middlewares } =
        typeof extender === 'function' ? extender(domain, domainSelector) : extender

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
          ...reduceWith(selectors || {}, selector => state => selector(domainSelector(state))),
        },
        actions: {
          ...result.actions,
          [extName]: bindActions(actions || {}, bindAction, domain),
        },
        middlewares: {
          ...result.middlewares,
          [extName]: middlewares || {},
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

const reducersWrapper = (reducers, initialState) => (state, action: Action<any>) => {
  const reducer: MetaReducer<any, any> = reducers[action.type] || defaultReducer

  return reducer(state || initialState, action)
}

function DomainFactory(extenders: { [string]: DomainExtender<any> } = {}, domainState: {} = {}) {
  const createDomain = (domain: string, getState: () => any, bindAction: any => any) => {
    const domainSelector = get(domain)
    const selector = (state: {}) => domainSelector(state || getState())

    const { reducers, initialState, selectors, actions, middlewares } = glueExtenders(
      domain,
      extenders,
      selector,
      bindAction,
    )

    const wrappedReducer = reducersWrapper(reducers, { ...initialState, ...domainState })

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
