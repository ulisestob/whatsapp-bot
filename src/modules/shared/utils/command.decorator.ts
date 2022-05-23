import { MessageData } from "../domain/interfaces/types";

export type Command = { pattern: string, fn: (data: MessageData) => void, fnName: string }

export function command(pattern: string) {
    return function ( target: any, key: string, descriptor: PropertyDescriptor) {
      if(!target[`commands`]) target[`commands`] = []
      target[`commands`].push(<Command>{pattern, fn: descriptor.value, fnName: key})
      return descriptor;
    };
}