 
// deno-lint-ignore no-explicit-any
export type Constructable<T = {}> = new (...args: any[]) => T;
export type mixin<C extends Constructable, T> = (args: C)=> T 


