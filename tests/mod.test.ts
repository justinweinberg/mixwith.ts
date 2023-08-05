// deno-lint-ignore-file no-explicit-any no-unused-vars
import { mix  } from "../mod.ts";
import * as mod from "https://deno.land/std@0.195.0/testing/asserts.ts";
import type { mixin, Constructable} from "../types.d.ts";

class Base {
    myArg = ""
    constructor(...arg: any[]) {
        this.myArg = arg[0];
    }
    b(x: number) {
        return `base method with a value of ${x}`
    }

    c(input: string) {
        return `base called with: ${input}`;
    }

    myConstructorArg() {
        return this.myArg;
    }
}

const Mix1 = <c extends Constructable>(s: c) => class Mix1 extends s {
    // mixin methods here
    constructor(...args: any[]) {
        super(...args);
    }

    m1() {
        return "m1";
    }
    replaceMe() {
        return "replace me";
    }
};

/* note - tying ourselves to base type here. Could use an interface instead */
const Mix2 = <c extends Constructable<Base>>(s: c) => class Mix2 extends s {
    // mixin methods here
    constructor(...args: any[]) {
        super(...args);
    }
    m2() {
        return "m2";
    }
    m2super() {
        return super.c("m2");
    }
    replaceMe() {
        return "replaced";
    }
};


const Mix3 = <c extends Constructable>(s: c) => class Mix2 extends s {
    // mixin methods here

    mix3Arg = ""
    constructor(...arg: any[]) {
        super(...arg);
        this.mix3Arg = arg[0];
    }

    m3() {
        return "m3";
     }
    replaceMe() {
        return "not so fast!";
    }
    gotConstructorArg() {
        return `constructor arg from Mix3 ${this.mix3Arg}`
    }

};

const Mix4 = <c extends Constructable>(s: c) => class Mix2 extends s {
    // mixin methods here
    constructor(...args: any[]) {
        super(...args);
    }
    m4() {
        return "m4";
     }

};

const Mix5 = <c extends Constructable>(s: c) => class Mix2 extends s {
    // mixin methods here
    constructor(...args: any[]) {
        super(...args);
    }
    m5() {
        return "m5";
     }

};

const Mix6 = <c extends Constructable>(s: c) => class Mix2 extends s {
    // mixin methods here
    constructor(...args: any[]) {
        super(...args);
    }
    m6() {
        return "m6";
     }

};

const MixNoConstructor = <c extends Constructable>(s: c) => class Mix2 extends s {
};

class mixed extends mix(Base).with(Mix1, Mix2, Mix3, Mix4, Mix5, Mix6) {
    // class methods here
    constructor(...args: any[]) {
        super(...args);
    }

    mixedMethod() {
    }
}

class mixedNoConstruct extends mix(Base).with(MixNoConstructor) {
    constructor(...args: any[]) {
        super(...args);
    }
}

Deno.test("can call super on base even if Mixin doesn't have a constructor", () => {
    const sut = new mixedNoConstruct('my arg');
    mod.assertEquals(sut.myConstructorArg(), "my arg");

});

Deno.test("constructor args flow to all MixIn participants", () => {
    const sut = new mixed("my arg");
    mod.assertEquals(sut.myConstructorArg(), "my arg");
    mod.assertEquals(sut.gotConstructorArg(), `constructor arg from Mix3 my arg`)
});


Deno.test("instanceOf works", () => {
    const sut = new mixed();
    mod.assert(sut instanceof Base);
    mod.assert(sut instanceof Mix1);
    mod.assert(sut instanceof Mix2);
    mod.assert(sut instanceof Mix3);
    mod.assert(sut instanceof Mix4);

});

Deno.test("a mixin to the right overrides a method on a mixin to the left", () => {
    const sut = new mixed();
    mod.assertEquals(sut.replaceMe(), "not so fast!");
});

Deno.test("an implementor can call a method on the Base class", () => {
    const sut = new mixed();
    mod.assertEquals(sut.b(123), `base method with a value of 123`);
});

Deno.test("an implementor can call a method of a Mixin class", () => {
    const sut = new mixed();
    mod.assertEquals(sut.m1(), `m1`);
});

Deno.test("a mixin can call a method on the super class", () => {
    const sut = new mixed("my constructor arg");
    mod.assertEquals(sut.m2super(), "base called with: m2");
});

Deno.test("can access all mixin members", () => {
    const sut = new mixed("my constructor arg");
    mod.assertEquals(sut.m1(), "m1");
    mod.assertEquals(sut.m2(), "m2");
    mod.assertEquals(sut.m3(), "m3");
    mod.assertEquals(sut.m4(), "m4");
    mod.assertEquals(sut.m5(), "m5");
    mod.assertEquals(sut.m6(), "m6");
});
