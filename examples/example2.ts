// deno-lint-ignore-file no-explicit-any no-unused-vars
import { Constructable, mix } from "../mod.ts";

class MySuperClass {
    constructor(numArg : number, strArg: string) { 
        console.log(`SuperClass { numArg: ${numArg}, strArg: ${strArg} }`)
    }
  }
  
  const MyMixin = <c extends Constructable>(s: c) =>
    class Mix1 extends s {
      constructor(...args: any[]) {
        super(...args);
        console.log(`MyMixin { ...args: [${args}] }` )
      }
  
    };
  
  class MixedClass extends mix(MySuperClass).with(MyMixin) {
    constructor(numArg : number, strArg: string) {
      super(numArg, strArg);
      console.log(`MixedClass { numArg: ${numArg}, strArg: ${strArg} }`)
    }
  }
  

  const myInstance : MixedClass = new MixedClass(42, "hello world");
  