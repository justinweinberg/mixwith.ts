// deno-lint-ignore-file no-explicit-any no-unused-vars
import { mix, Constructable } from "../mod.ts";
import * as mod from "https://deno.land/std/testing/asserts.ts";

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
        return super.c("m2");
    }
    replaceMe() {
        return "replaced";
    }
};


const Mix3 = <c extends Constructable>(s: c) => class Mix2 extends s {
    // mixin methods here
    constructor(...args: any[]) {
        super(...args);
    }
    m3() { }
    replaceMe() {
        return "not so fast!";
    }
};

const Mix4 = <c extends Constructable>(s: c) => class Mix2 extends s {
    // mixin methods here
    constructor(...args: any[]) {
        super(...args);
    }
    m3() { }

};

class mixed extends mix(Base).with(Mix1, Mix2, Mix3, Mix4) {
    // class methods here
    constructor(...args: any[]) {
        super(...args);
    }
     
    mixedMethod() {
    }
}

Deno.test("instanceOf works", () => {
    const sut = new mixed();
    mod.assert(sut instanceof Base);
    mod.assert(sut instanceof Mix1);
    mod.assert(sut instanceof Mix2);
    mod.assert(sut instanceof Mix3);
    mod.assert(sut instanceof Mix4);

});

Deno.test("constructor args flows to base class", () => {
    const sut = new mixed("my constructor arg");
    mod.assertEquals(sut.myConstructorArg(), "my constructor arg");
});

Deno.test("the right most mixin overrides a method on a mixin to the left", () => {
    const sut = new mixed();
    mod.assertEquals(sut.replaceMe(), "not so fast!");
});

Deno.test("can call method on base", () => {
    const sut = new mixed();
    mod.assertEquals(sut.b(123), `base method with a value of 123`);
});

Deno.test("mixin can call method on super", () => {
    const sut = new mixed("my constructor arg");
    mod.assertEquals(sut.m2(), "not so fast!");
});