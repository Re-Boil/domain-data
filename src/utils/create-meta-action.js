// @flow
import { createAction } from 'redux-actions'

export const createMetaAction = <Type, Payload>(name: string, type: Type) => createAction<Type, Payload, { name: string }>(type, undefined, (): { name: string } => ({ name }))
// export const createMetaAction = (name: string, type: string) => {
//
//   const actionCreator = ({ meta?: {}, ...payload}) => ({
//     type,
//     payload,
//     meta: {
//       ...meta,
//         name,
//     }
//   })
//
//   actionCreator.toString = () => type.toString()
//
//   return actionCreator
// }
