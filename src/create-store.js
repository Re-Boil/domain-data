// @flow

import { createStore, applyMiddleware } from 'redux'
import createSagaMiddleware from 'redux-saga'
// import asyncCatch from 'redux-async-catch'
import thunkMiddleware from 'redux-thunk'
import { composeWithDevTools } from 'redux-devtools-extension'

export default (reducers, initialState, middlewares, sagas) => {

  const sagaMiddleware = createSagaMiddleware()

  // export const fetchError = (error, lastAction) => () => {
  //   console.error('[REDUX/ERROR] in action %s\n%O', lastAction, error)
  // }

  const storeMiddlewares = applyMiddleware(
    // asyncCatch(fetchError),
    thunkMiddleware,
    sagaMiddleware,
    ...middlewares,
  )

  const enhancers =
    process.env.BROWSER && process.env.DEVELOPMENT
      ? composeWithDevTools(middlewares)
      : middlewares

  const store = createStore(reducers, initialState, enhancers)
  const bindActionCreator = action => (...args) => store.dispatch(action(...args))

  sagas.forEach(saga => sagaMiddleware.run(saga))

  return { store, bindActionCreator }
}
