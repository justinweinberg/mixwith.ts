# mixwith.ts

A TypeScript fork of Justin Fagnani's excellent mixwith.js library that  supports TypeScript type completions at design time.

`mixwith` differs from other mixin approaches because it does not copy properties from one object to another. Instead, `mixwith` works with "subclass factories" which create a new class that extends a superclass with the mixin.

my-mixin.ts:

```typescript
const MyMixin = (s: Constructable) => class extends s {
    // mixin methods here
}
```

my-class.ts

```typescript
class MyClass extends mix(MySuperClass).with(MyMixin) {
     // class methods here, go ahead, use super!
}
```
# Installation 

Using npm 
```
npm i mixwith.ts
```

Using deno
```
import {mix, Constructable } from  "https://deno.land/x/mixwithts/mod.ts"
```

# Usage

Classes use mixins in their `extends` clause. Classes that use mixins can define and override constructors and methods as usual.  In conflicts, the **right** most Mixin wins.

```typescript

class MySuperClass   {
    // ...
}

const MyMixin = <c extends Constructable>(s : c) => class extends s {
    foo() {}
}

class MyClass extends mix(MySuperClass).with(MyMixin) { 
    foo() {
        super.foo() // calls MyMixin.foo()
    }
}
```

### Constructor Usage

To use contructors and make sure the base class constructors are called, mixins consume and pass along constructor arguments using a constructor with `...args: any`.  Mixins can optionally consume constructor arguments as well:

``` typescript
class MySuperClass {
    constructor(numArg : number, strArg: string) { 
    }
  }
  
  const MyMixin = <c extends Constructable>(s: c) =>
    class Mix1 extends s {
      constructor(...args: any[]) {
        super(...args);
       }
  
    };
  
  class MixedClass extends mix(MySuperClass).with(MyMixin) {
    constructor(numArg : number, strArg: string) {
      super(numArg, strArg);
     }
  }
  

  const myInstance : MixedClass = new MixedClass(42, "hello world");
  
```

### A Full Example

In this example, I model a 2D war game that has common functionality across units (shooters, spawners, etc.). 

```typescript
// deno-lint-ignore-file no-unused-vars
import type { Constructable } from "./mod.ts";
import {mix } from "./mod.ts";
interface Position {
    xPos: number;
    yPos: number;
}

class AirForce implements Position {
    xPos = 0;
    yPos = 0;
}

class GroundForce implements Position {
    xPos = 0;
    yPos = 0;
}

const bomber = <c extends Constructable>(s : c) => class extends s {
    bomb() { }
}

const shooter = <c extends Constructable>(s : c)=> class extends s {
    shoot() { }
}

//Notice that this takes a 'Position' type since 
//it needs to refer back to its super class (which implements Position)
const spawner = <c extends Constructable<Position>>(s : c) => class extends s {
    spawn() {
        //spawn logic for things that spawn
        this.yPos = Math.random() * 100;
        this.xPos = Math.random() * 100;
    }
}

//airplanes spawn, shoot, and bomb
class Airplane extends mix(AirForce).with(spawner, shooter, bomber) { }
//helicopters spawn and shoot
class Helicopter extends mix(AirForce).with(spawner, shooter) { }
//tanks spawn and shoot
class Tank extends mix(GroundForce).with(spawner, shooter) { }
//fortifications don't spawn in, but do shoot
class fortification extends mix(GroundForce).with(shooter) { }

// You can also skip the final class definition, but intent is less clear
const myJetFighter = new (mix(AirForce).with(spawner, shooter))

```


# Changes from mixwith.js

#### API & Functional changes

The builder `MixinBuilder` and its supporting method `mix()` were modified:


- `MixinBuilder.with()` accepts **up to six mixins** rather than an array. This change was made to enable design time TypeScript completions.  The source code can be modified to support more mixins as needed.
- `MixinBuilder.with()` applies instanceOf support for mixins automatically

### Types

To resolve Mixins at design time, two types were defined.

```typescript 
export type Constructable<T = {}> = new (...args: any[]) => T;
export type mixin<C extends Constructable, T> = (args: C) => T 
```

- `Constructable<T>` defines a constructor function (can be called with new) that creates instances of objects of type `T`. 
- `mixin` defines a function that takes a `Constructable<T>` and returns a new type `T`.

TypeScript will infer both `T` and `C` implicitly.  However, if you want to refer to a super's properties from a mixin without red squigglies, reference it.

```typescript
//open ended mixin.  Use to add new functionality to any type
const openMix = (s: Constructable) => class extends s...

//closed mixin.  Use to apply to a specific interface or class
const closedMix = (s: Constructable<MyInterface>) => class extends s... 

```

# Why Mixin.ts

The subclass factory pattern does not require a library. This library makes working with the pattern more powerful and easier to use.

  * Determine if an object or class has had a particular mixin applied to it.
  * Cache mixin applications so that a mixin repeatedly applied to the same superclass reuses its resulting subclass.
  * De-duplicate mixin application so that including a mixin multiple times in a class hierarchy only applies it once to the prototype type chain.
  * Add `instanceof` support to mixin functions.  That is, the following test passes

```typescript 
class MyClass extends mix(MySuperClass).with(MyMixin) {
    // class methods here, go ahead, use super!
}

const foo = new MyClass();

assert(foo instanceof MySuperClass); //true
assert(foo instanceof MyMixin); //true
```

### Advantages of subclass factories over typical JavaScript mixins

Subclass factory style mixins preserve the object-oriented inheritance properties that classes provide, like method overriding and `super` calls, while letting you compose classes out of mixins without being constrained to a single inheritance hierarchy, and without monkey-patching or copying.

#### Method overriding that just works

Methods in subclasses can naturally override methods in the mixin or superclass, and mixins override methods in the superclass. This means that precedence is preserved - the order is: _subclass_ -> _mixin__1_ -> ... -> _mixin__N_ -> _superclass_.

#### `super` works

Subclasses and mixins can use `super` normally, as defined in standard Javascript, and without needing the mixin library to do special chaining of functions.

#### Mixins can have constructors

Since `super()` works, mixins can define constructors. Combined with ES6 rest arguments and the spread operator, mixins can have generic constructors that work with any super constructor by passing along all arguments.

#### Prototypes and instances are not mutated

Typical JavaScript mixins usually used to either mutate each instance as created, which can be bad for performance and maintainability, or modify a prototype, which means every object inheriting from that prototype gets the mixin. Subclass factories don't mutate objects, they define new classes to subclass, leaving the original superclass intact.

### References 
* https://www.typescriptlang.org/docs/handbook/mixins.html
* https://justinfagnani.com/2015/12/21/real-mixins-with-javascript-classes/
* https://mariusschulz.com/blog/mixin-classes-in-typescript



# Full API Documentation

## Classes

### MixinBuilder

• **MixinBuilder**: Class MixinBuilder<Base\>

MixinBuilder helper class (returned by mix()).

#### Type parameters

| Name | Type |
| :------ | :------ |
| `Base` | extends Constructable |

#### Defined in

[mixwith.ts:237](https://github.com/justinweinberg/mixwith.ts/blob/557402b/mixwith.ts#L237)

## Method


 Method: with()

```ts
with<A, B, C, D, E, F>(
  a, 
  b?, 
  c?, 
  d?, 
  e?, 
  f?): Base & A & B & C & D & E & F
```

Applies a chain of mixins to a base class. The method supports up to six mixins. 
The mixins are applied in reverse sequence (e.g. the right most mixin is applied first, etc.)


## Type parameters


| Parameter |
| :------ |
| `A` *extends* `Constructable` |
| `B` *extends* `Constructable` |
| `C` *extends* `Constructable` |
| `D` *extends* `Constructable` |
| `E` *extends* `Constructable` |
| `F` *extends* `Constructable` |


## Parameters


| Parameter | Type | Description |
| :------ | :------ | :------ |
| `a` | `mixin`\< `Base`, `A` \> | A mixin to apply. |
| `b`? | `mixin`\< `A`, `B` \>  | A mixin to apply (optional). |
| `c`? | `mixin`\< `B`, `C` \>  | A mixin to apply (optional). |
| `d`? | `mixin`\< `C`, `D` \>  | A mixin to apply (optional). |
| `e`? | `mixin`\< `D`, `E` \>  | A mixin to apply (optional). |
| `f`? | `mixin`\< `E`, `F` \>  | A mixin to apply (optional). |


## Returns

`Base` & `A` & `B` & `C` & `D` & `E` & `F`

- A new class constructor that includes the functionalities
                                          of all mixins and the base class.

### BareMixin

▸ **BareMixin**<`C`, `T`\>(`mixin`): mixin<C, T\>

A basic mixin decorator that applies the mixin using the apply function so that it
can be used with isApplicationOf, hasMixin, and other mixin decorator functions.

#### Type parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `C` | extends Constructable | The constructor type representing the original superclass. |
| `T` | `T` | The return type of the mixin function. |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `mixin` | mixin<C, T\> | The mixin to wrap. |

#### Returns

mixin<C, T\>

- A new mixin function.

#### Defined in

[mixwith.ts:196](https://github.com/justinweinberg/mixwith.ts/blob/557402b/mixwith.ts#L196)

___

### Cached

▸ **Cached**<`C`, `T`\>(`mixin`): mixin<C, any\>

Decorates `mixin` so that it caches its applications. When applied multiple
times to the same superclass, `mixin` will only create one subclass, memoize
it and return it for each application.

Note: If `mixin` somehow stores properties its classes constructor (static
properties), or on its classes prototype, it will be shared across all
applications of `mixin` to a super class. It's reccomended that `mixin` only
access instance state.

#### Type parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `C` | extends Constructable | The type of the constructor of the mixin. |
| `T` | `T` | The type of the mixin instance. |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `mixin` | mixin<C, T\> | The mixin to be cached. |

#### Returns

mixin<C, any\>

- Returns the cached mixin application.

#### Defined in

[mixwith.ts:125](https://github.com/justinweinberg/mixwith.ts/blob/557402b/mixwith.ts#L125)

___

### DeDupe

▸ **DeDupe**<`C`, `T`\>(`mixin`): mixin<C, T\>

Decorates `mixin` so that it only applies if it's not already on the
prototype chain.

#### Type parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `C` | extends Constructable | The constructor type representing the original superclass. |
| `T` | `T` | The return type of the mixin function. |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `mixin` | mixin<C, T\> | The mixin function to be deduplicated. |

#### Returns

mixin<C, T\>

- A deduplicated mixin that extends the original superclass if needed.

#### Defined in

[mixwith.ts:154](https://github.com/justinweinberg/mixwith.ts/blob/557402b/mixwith.ts#L154)

___

### HasInstance

▸ **HasInstance**<`T`\>(`mixin`): T

Adds a Symbol.hasInstance implementation to the provided mixin object to enable the use of the
`instanceof` operator with instances of classes that include the mixin.

#### Type parameters

| Name | Description |
| :------ | :------ |
| `T` | The type of the mixin object. |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `mixin` | T | The mixin object to be enhanced with the Symbol.hasInstance implementation. |

#### Returns

T

- The mixin object with the Symbol.hasInstance implementation.

#### Defined in

[mixwith.ts:174](https://github.com/justinweinberg/mixwith.ts/blob/557402b/mixwith.ts#L174)

___

### Mixin

▸ **Mixin**<`C`, `T`\>(`mixin`): mixin<C, T\>

Decorates a mixin function to add deduplication, application caching, and instanceof support.

#### Type parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `C` | extends Constructable | The constructor type representing the original superclass. |
| `T` | `T` | The return type of the mixin function. |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `mixin` | mixin<C, T\> | The mixin to wrap. |

#### Returns

mixin<C, T\>

- A new mixin function.

#### Defined in

[mixwith.ts:206](https://github.com/justinweinberg/mixwith.ts/blob/557402b/mixwith.ts#L206)

___

### apply

▸ **apply**<`C`, `T`\>(`superclass`, `mixin`): T

Applies `mixin` to `superclass`.

`apply` stores a reference from the mixin application to the unwrapped mixin
to make `isApplicationOf` and `hasMixin` work.

This function is useful for mixin wrappers that want to automatically enable
hasMixin support.

#### Type parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `C` | extends Constructable | The constructor type of the superclass. |
| `T` | `T` | The resulting type of the mixin. |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `superclass` | C | The superclass to which the mixin will be applied. |
| `mixin` | mixin<C, T\> | The mixin function that provides additional behavior to the superclass. |

#### Returns

T

- A new class with the mixin's behavior applied.

#### Defined in

[mixwith.ts:28](https://github.com/justinweinberg/mixwith.ts/blob/557402b/mixwith.ts#L28)

___

### hasMixin

▸ **hasMixin**<`T`\>(`o`, `mixin`): boolean

Checks if the provided mixin has been applied to the given prototype object.

#### Type parameters

| Name | Description |
| :------ | :------ |
| `T` | The type of the mixin. |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `o` | object | - |
| `mixin` | T | A mixin function used with apply. |

#### Returns

boolean

- Returns true if the mixin has been applied, otherwise false.

#### Defined in

[mixwith.ts:59](https://github.com/justinweinberg/mixwith.ts/blob/557402b/mixwith.ts#L59)

___

### isApplicationOf

▸ **isApplicationOf**<`T`\>(`proto`, `mixin`): boolean

Returns `true` iff `proto` is a prototype created by the application of
`mixin` to a superclass.

`isApplicationOf` works by checking that `proto` has a reference to `mixin`
as created by `apply`.

#### Type parameters

| Name | Description |
| :------ | :------ |
| `T` | The type of the mixin. |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `proto` | object | A prototype object created by apply. |
| `mixin` | T | A mixin function used with apply. |

#### Returns

boolean

whether `proto` is a prototype created by the application of
`mixin` to a superclass

#### Defined in

[mixwith.ts:47](https://github.com/justinweinberg/mixwith.ts/blob/557402b/mixwith.ts#L47)

___

### mix

▸ **mix**<`C`\>(`superclass?`): MixinBuilder<C\>

A fluent interface to apply a list of mixins to a superclass.

```typescript
class X extends mix(Object).with(A, B, C) {}
```

The mixins are applied in order to the superclass, so the prototype chain
will be: X->C'->B'->A'->Object.

This is purely a convenience function. The above example is equivalent to:

```typescript
C = Mixin(C)
B = Mixin(B)
A = Mixin(A)
class X extends C(B(A(Object))) {}
```

**`Function`**

#### Type parameters

| Name | Type |
| :------ | :------ |
| `C` | extends Constructable |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `superclass?` | C | The superclass to which the mixin will be applied. If not defined, it defaults to `class {}`. |

#### Returns

MixinBuilder<C\>

- A builder object to apply mixins to the superclass.

#### Defined in

[mixwith.ts:231](https://github.com/justinweinberg/mixwith.ts/blob/557402b/mixwith.ts#L231)

___

### unwrap

▸ **unwrap**<`T`\>(`wrapper`): T

Unwraps the function `wrapper` to return the original function wrapped by
one or more calls to `wrap`. Returns `wrapper` if it's not a wrapped
function.

#### Type parameters

| Name | Description |
| :------ | :------ |
| `T` | The type of the wrapped mixin. |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `wrapper` | T | The wrapped mixin. |

#### Returns

T

- Returns the original mixin if available, otherwise the wrapper itself.

#### Defined in

[mixwith.ts:106](https://github.com/justinweinberg/mixwith.ts/blob/557402b/mixwith.ts#L106)

___

### wrap

▸ **wrap**<`C`, `T`\>(`mixin`, `wrapper`): mixin<C, T\>

Sets up the function `mixin` to be wrapped by the function `wrapper`, while
allowing properties on `mixin` to be available via `wrapper`, and allowing
`wrapper` to be unwrapped to get to the original function.

`wrap` does two things:
  1. Sets the prototype of `mixin` to `wrapper` so that properties set on
     `mixin` inherited by `wrapper`.
  2. Sets a special property on `mixin` that points back to `mixin` so that
     it can be retreived from `wrapper`

**`Function`**

#### Type parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `C` | extends Constructable | The type of the constructor of the mixin. |
| `T` | `T` | The type of the mixin instance. |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `mixin` | mixin<C, T\> | The mixin to be wrapped. |
| `wrapper` | mixin<C, T\> | The wrapper mixin. |

#### Returns

mixin<C, T\>

- Returns the wrapper mixin.

#### Defined in

[mixwith.ts:89](https://github.com/justinweinberg/mixwith.ts/blob/557402b/mixwith.ts#L89)
