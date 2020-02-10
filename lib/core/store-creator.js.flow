import { createStore, combineReducers } from 'redux'

import { JoinPaths } from 'utils/common'

const bindActionCreator = store => action => {
  const bindedAction = (...args) => store.dispatch(action(...args))

  bindedAction.toString = () => action.toString()
  return bindedAction
}

const ConfigureDomain = (domain, domainName, getState, bindAction) => {
  const { selectors, actions, middlewares, ...rest } = domain(domainName, getState, bindAction)

  return { ...rest, domains: { selectors, actions, middlewares } }
}

const ConfigureDomains = (configuration, { getState, bindAction }, prefix) =>
  Object.keys(configuration).reduce(
    (result, key) => {
      const domain = configuration[key]
      const domainName = JoinPaths(prefix, key)
      const isDomain = typeof domain === 'function'

      const { reducer, domains } = isDomain
        ? ConfigureDomain(domain, domainName, getState, bindAction)
        : ConfigureDomains(domain, { getState, bindAction }, domainName)

      return {
        reducer: {
          ...result.reducer,
          [key]: isDomain ? reducer : combineReducers(reducer),
        },
        domains: {
          ...result.domains,
          [key]: domains,
        },
      }
    },
    {
      reducer: {},
      domains: {},
    },
  )

export const CreateStore = (initialConfiguration, initialState, enhancers) => {
  const store = createStore(combineReducers({}), initialState, enhancers)
  const { getState } = store
  const bindAction = bindActionCreator(store)

  const reconfigureStore = configuration => {
    const { reducer, domains } = ConfigureDomains(configuration, {
      getState,
      bindAction,
    })

    store.replaceReducer(combineReducers(reducer))

    return { store, domains, bindAction, reconfigureStore }
  }

  return reconfigureStore(initialConfiguration)
}

export default CreateStore
