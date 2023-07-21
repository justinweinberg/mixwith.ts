// deno-lint-ignore-file no-explicit-any no-unused-vars
import { assert } from "https://deno.land/std@0.195.0/assert/assert.ts";
import { mix, Constructable } from "../mod.ts";

class Base {
    constructor(...args: any[]) {

    }
    b() {}
}

const Mix1 = <c extends Constructable>(s : c) => class Mix1 extends s {
    // mixin methods here
    constructor(...args: any[]) {
        super(args);
    }
    m1() {}
    replaceMe() {
        return "replaced";
    }
};

const Mix2 = <c extends Constructable>(s: c) => class Mix2 extends s {
  // mixin methods here
  constructor(...args: any[]) {
    super(args);
    }
    m2() {}
    replaceMe() {
        return "replace me";
    }
};


const Mix3 = <c extends Constructable>(s: c) => class Mix2 extends s {
    // mixin methods here
    constructor(...args: any[]) {
      super(args);
      }
      m3() {}
    
  };

const Mix4 = <c extends Constructable>(s: c) => class Mix2 extends s {
    // mixin methods here
    constructor(...args: any[]) {
      super(args);
      }
      m3() {}
    
  };

class mixed extends mix(Base).with(Mix1, Mix2, Mix3, Mix4) {
    // class methods here
    constructor(...args: any[]) {
        super(args);
    }
    c() {}
}

Deno.test("instanceOf works", () => {
const sut = new mixed();
assert(sut instanceof Base);
assert(sut instanceof Mix1);
});