// deno-lint-ignore-file no-explicit-any
import {
  apply,
  BareMixin,
  DeDupe,
  HasInstance,
  hasMixin,
  isApplicationOf,
  mix,
  unwrap,
  wrap,
} from "../mod.ts";
import type { Constructable } from "../mod.ts";
import * as mod from "https://deno.land/std@0.224.0/testing/asserts.ts";

/* 'apply() and isApplicationOf()' */

Deno.test("apply() applies a mixin function", () => {
  const M = <c extends Constructable>(s: c) =>
    class extends s {
      test() {
        return true;
      }
    };
  class Test extends apply(Object, M) {}
  const i = new Test();
  mod.assert(i.test());
});

Deno.test("isApplication() returns true for a mixin applied by apply()", () => {
  const M = <c extends Constructable>(s: c) => class extends s {};
  mod.assert(isApplicationOf(apply(Object, M).prototype, M));
});

Deno.test("isApplication() works with wrapped mixins", () => {
  const M = <c extends Constructable>(s: c) => class extends s {};
  const WrappedM = wrap(M, (superclass) => apply(superclass, M));
  mod.assert(isApplicationOf(WrappedM(Object).prototype, WrappedM));
});

Deno.test("isApplication() returns false when it should", () => {
  const M = <c extends Constructable>(s: c) => class extends s {};
  const X = <c extends Constructable>(s: c) => class extends s {};
  mod.assertFalse(isApplicationOf(apply(Object, M).prototype, X));
});

/* hasMixin */

Deno.test("hasMixin() returns true for a mixin applied by apply()", () => {
  const M = <c extends Constructable>(s: c) => class extends s {};

  mod.assert(hasMixin(apply(Object, M).prototype, M));
});

/* 'wrap() and unwrap()' */

Deno.test("wrap() sets the prototype", () => {
  const f = (x: number) => x * x;
  f.test = true;
  const wrapper = (x: number) => f(x);
  wrap(f as any, wrapper as any);
  mod.assert((wrapper as any).test);
  mod.assertEquals(f, Object.getPrototypeOf(wrapper));
});

Deno.test("unwrap() returns the wrapped function", () => {
  const f = (x: number) => x * x;
  const wrapper = (x: number) => f(x);
  wrap(f as any, wrapper as any);
  mod.assertEquals(f, unwrap(wrapper));
});

/* BareMixin */

Deno.test("mixin application is on prototype chain", () => {
  const M = BareMixin((s) => class extends s {});
  class C extends M(Object) {}
  const i = new C();
  mod.assert(hasMixin(i, M));
});

Deno.test("methods on mixin are present", () => {
  const M = BareMixin((s) =>
    class extends s {
      foo() {
        return "foo";
      }
    }
  );
  class C extends M(Object) {}
  const i = new C();
  mod.equal(i.foo(), "foo");
});

Deno.test("methods on superclass are present", () => {
  const M = BareMixin(<c extends Constructable>(s: c) => class extends s {});
  class S {
    foo() {
      return "foo";
    }
  }
  class C extends M(S) {}
  const i = new C();
  mod.equal(i.foo(), "foo");
});

Deno.test("methods on subclass are present", () => {
  const M = BareMixin((s) => class extends s {});
  class C extends M(Object) {
    foo() {
      return "foo";
    }
  }
  const i = new C();
  mod.equal(i.foo(), "foo");
});

Deno.test("methods on mixin override superclass", () => {
  const M = BareMixin((s) =>
    class extends s {
      foo() {
        return "bar";
      }
    }
  );
  class S {
    foo() {
      return "foo";
    }
  }
  class C extends M(S) {}
  const i = new C();
  mod.equal(i.foo(), "bar");
});

Deno.test("methods on mixin can call super", () => {
  class S {
    foo() {
      return "superfoo";
    }
  }
  const M = BareMixin((s: new () => S) =>
    class extends s {
      foo() {
        return super.foo();
      }
    }
  );

  class C extends M(S) {}
  const i = new C();
  mod.equal(i.foo(), "superfoo");
});

Deno.test("methods on subclass override superclass", () => {
  const M = BareMixin((s) => class extends s {});
  class S {
    foo() {
      return "superfoo";
    }
  }
  class C extends M(S) {
    foo() {
      return "subfoo";
    }
  }
  const i = new C();
  mod.equal(i.foo(), "subfoo");
});

Deno.test("methods on subclass override mixin", () => {
  const M = BareMixin((s) =>
    class extends s {
      foo() {
        return "mixinfoo";
      }
    }
  );
  class S {}
  class C extends M(S) {
    foo() {
      return "subfoo";
    }
  }
  const i = new C();
  mod.equal(i.foo(), "subfoo");
});

Deno.test("methods on subclass can call super to superclass", () => {
  const M = BareMixin((s: new () => S) => class extends s {});
  class S {
    foo() {
      return "superfoo";
    }
  }
  class C extends M(S) {
    foo() {
      return super.foo();
    }
  }
  const i = new C();
  mod.equal(i.foo(), "superfoo");
});

/* DeDupe */

Deno.test("applies the mixin the first time", () => {
  const M = DeDupe(BareMixin((superclass) => class extends superclass {}));
  class C extends M(Object) {}
  const i = new C();
  mod.assert(hasMixin(i, M));
});

Deno.test("does'n apply the mixin the second time", () => {
  let applicationCount = 0;
  const M = DeDupe(BareMixin((superclass) => {
    applicationCount++;
    return class extends superclass {};
  }));
  class C extends M(M(Object)) {}
  const i = new C();
  mod.assert(hasMixin(i, M));
  mod.assertEquals(1, applicationCount);
});

/* HasInstance */

Deno.test("subclasses implement mixins", () => {
  const M = HasInstance((s: any) => class extends s {});
  class C extends M(Object) {}
  const i = new C();
  mod.assertInstanceOf(i, C);
});

/* mix().with() */

Deno.test("applies mixins in order", () => {
  const M1 = BareMixin((s) => class extends s {});
  const M2 = BareMixin((s) => class extends s {});
  class S {}
  class C extends mix(S).with(M1, M2) {}
  const i = new C();
  Object.getPrototypeOf(i);
  mod.assert(hasMixin(i, M1));
  mod.assert(hasMixin(i, M2));
  mod.assert(
    isApplicationOf(Object.getPrototypeOf(Object.getPrototypeOf(i)), M2),
  );
  mod.assert(
    isApplicationOf(
      Object.getPrototypeOf(Object.getPrototypeOf(Object.getPrototypeOf(i))),
      M1,
    ),
  );
  mod.assert(
    Object.getPrototypeOf(
      Object.getPrototypeOf(Object.getPrototypeOf(Object.getPrototypeOf(i))),
    ),
    Object.getPrototypeOf(S),
  );
});

Deno.test("mix() can omit the superclass", () => {
  const M = BareMixin((s) =>
    class extends s {
      static staticMixinMethod() {
        return 42;
      }

      foo() {
        return "foo";
      }
    }
  );
  class C extends mix().with(M) {
    static staticClassMethod() {
      return 7;
    }

    bar() {
      return "bar";
    }
  }
  const i = new C();
  mod.assert(hasMixin(i, M), "hasMixin");
  mod.assert(
    isApplicationOf(Object.getPrototypeOf(Object.getPrototypeOf(i)), M),
    "isApplicationOf",
  );
  mod.assertEquals("foo", i.foo());
  mod.assertEquals("bar", i.bar());
  mod.assertEquals(42, C.staticMixinMethod());
  mod.assertEquals(7, C.staticClassMethod());
});
