# mixwith.ts

A fork of Justin Fagnani's mixwith.js to add TypeScript compatibility and design time completions.

`mixwith` differs from other mixin approaches because it does not copy properties from one object to another. Instead, `mixwith` works with "subclass factories" which create a new class that extends a superclass with the mixin - this is called a _mixin_ _application_.

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


### Changes from mixwith.js

#### API & Functional changes

The builder `MixinBuilder` and its supporting method `mix()` were modified:

- `mix()` uses a default empty class from the library if no base is specified. 
- `MixinBuilder.with()` accepts **up to four mixins** rather than an array. This change was made to enable design time completions.  The source code can be modified if more mixins are needed.
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

### mixwith.ts  

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

## Advantages of subclass factories over typical JavaScript mixins

Subclass factory style mixins preserve the object-oriented inheritance properties that classes provide, like method overriding and `super` calls, while letting you compose classes out of mixins without being constrained to a single inheritance hierarchy, and without monkey-patching or copying.

#### Method overriding that just works

Methods in subclasses can naturally override methods in the mixin or superclass, and mixins override methods in the superclass. This means that precedence is preserved - the order is: _subclass_ -> _mixin__1_ -> ... -> _mixin__N_ -> _superclass_.

#### `super` works

Subclasses and mixins can use `super` normally, as defined in standard Javascript, and without needing the mixin library to do special chaining of functions.

#### Mixins can have constructors

Since `super()` works, mixins can define constructors. Combined with ES6 rest arguments and the spread operator, mixins can have generic constructors that work with any super constructor by passing along all arguments.

#### Prototypes and instances are not mutated

Typical JavaScript mixins usually used to either mutate each instance as created, which can be bad for performance and maintainability, or modify a prototype, which means every object inheriting from that prototype gets the mixin. Subclass factories don't mutate objects, they define new classes to subclass, leaving the original superclass intact.

## Usage
 

### Using Mixins

Classes use mixins in their `extends` clause. Classes that use mixins can define and override constructors and methods as usual.  In conflicts, the **right** most Mixin wins.

```typescript
class MyClass extends mix(MySuperClass).with(MyMixin) {

  constructor(a, b) {
    super(a, b); // calls MyMixin(a, b)
  }

  foo() {
    console.log('foo from MyClass');
    super.foo(); // calls MyMixin.foo()
  }

}
```

### A Full Example

In this example, I modeled a 2D war game and took an object oriented approach. I wanted to keep the object hierarchy light, but had common *adjectives* across units (shooters, spawners, etc.).  This is a good use case for mixins.

```typescript
import { Constructable, mix } from "./mod.ts";

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

const bomber = (s : Constructable) => class extends s {
    bomb() { }
}

const shooter = (s : Constructable)=> class extends s {
    shoot() { }
}

//'Position' explicit because this mixin needs the super class
const spawner =(s : Constructable<Position>) => class extends s {
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
let jetFighter = new (mix(AirForce).with(spawner, shooter))
```

# Recommended Usage

I recommend exclusively use the `mix` utility builder and it's supporting `with` method.  The `mix` and `with` combination apply all of the library's goodness (caching, deduplication, instanceOf behavior).


# Full API Documentation

<a name="apply"></a>

## apply(superclass, mixin) ⇒ <code>function</code>
Applies `mixin` to `superclass`.

`apply` stores a reference from the mixin application to the unwrapped mixin
to make `isApplicationOf` and `hasMixin` work.

This function is usefull for mixin wrappers that want to automatically enable
[hasMixin](#hasMixin) support.

**Kind**: global function  
**Returns**: <code>function</code> - A subclass of `superclass` produced by `mixin`  

| Param | Type | Description |
| --- | --- | --- |
| superclass | <code>function</code> | A class or constructor function |
| mixin | <code>[MixinFunction](#MixinFunction)</code> | The mixin to apply |

**Example**  
```js
const Applier = (mixin) => wrap(mixin, (superclass) => apply(superclass, mixin));

// M now works with `hasMixin` and `isApplicationOf`
const M = Applier((superclass) => class extends superclass {});

class C extends M(Object) {}
let i = new C();
hasMixin(i, M); // true
```
<a name="isApplicationOf"></a>

## isApplicationOf(proto, mixin) ⇒ <code>boolean</code>
Returns `true` iff `proto` is a prototype created by the application of
`mixin` to a superclass.

`isApplicationOf` works by checking that `proto` has a reference to `mixin`
as created by `apply`.

**Kind**: global function  
**Returns**: <code>boolean</code> - whether `proto` is a prototype created by the application of
`mixin` to a superclass  

| Param | Type | Description |
| --- | --- | --- |
| proto | <code>Object</code> | A prototype object created by [apply](#apply). |
| mixin | <code>[MixinFunction](#MixinFunction)</code> | A mixin function used with [apply](#apply). |

<a name="hasMixin"></a>

## hasMixin(o, mixin) ⇒ <code>boolean</code>
Returns `true` iff `o` has an application of `mixin` on its prototype
chain.

**Kind**: global function  
**Returns**: <code>boolean</code> - whether `o` has an application of `mixin` on its prototype
chain  

| Param | Type | Description |
| --- | --- | --- |
| o | <code>Object</code> | An object |
| mixin | <code>[MixinFunction](#MixinFunction)</code> | A mixin applied with [apply](#apply) |

<a name="wrap"></a>

## wrap(mixin, wrapper) ⇒ <code>[MixinFunction](#MixinFunction)</code>
Sets up the function `mixin` to be wrapped by the function `wrapper`, while
allowing properties on `mixin` to be available via `wrapper`, and allowing
`wrapper` to be unwrapped to get to the original function.

`wrap` does two things:
  1. Sets the prototype of `mixin` to `wrapper` so that properties set on
     `mixin` inherited by `wrapper`.
  2. Sets a special property on `mixin` that points back to `mixin` so that
     it can be retreived from `wrapper`

**Kind**: global function  
**Returns**: <code>[MixinFunction](#MixinFunction)</code> - `wrapper`  

| Param | Type | Description |
| --- | --- | --- |
| mixin | <code>[MixinFunction](#MixinFunction)</code> | A mixin function |
| wrapper | <code>[MixinFunction](#MixinFunction)</code> | A function that wraps [mixin](mixin) |

<a name="unwrap"></a>

## unwrap(wrapper) ⇒ <code>[MixinFunction](#MixinFunction)</code>
Unwraps the function `wrapper` to return the original function wrapped by
one or more calls to `wrap`. Returns `wrapper` if it's not a wrapped
function.

**Kind**: global function  
**Returns**: <code>[MixinFunction](#MixinFunction)</code> - The originally wrapped mixin  

| Param | Type | Description |
| --- | --- | --- |
| wrapper | <code>[MixinFunction](#MixinFunction)</code> | A wrapped mixin produced by [wrap](#wrap) |

<a name="Cached"></a>

## Cached(mixin) ⇒ <code>[MixinFunction](#MixinFunction)</code>
Decorates `mixin` so that it caches its applications. When applied multiple
times to the same superclass, `mixin` will only create one subclass, memoize
it and return it for each application.

Note: If `mixin` somehow stores properties its classes constructor (static
properties), or on its classes prototype, it will be shared across all
applications of `mixin` to a super class. It's reccomended that `mixin` only
access instance state.

**Kind**: global function  
**Returns**: <code>[MixinFunction](#MixinFunction)</code> - a new mixin function  

| Param | Type | Description |
| --- | --- | --- |
| mixin | <code>[MixinFunction](#MixinFunction)</code> | The mixin to wrap with caching behavior |

<a name="DeDupe"></a>

## DeDupe(mixin) ⇒ <code>[MixinFunction](#MixinFunction)</code>
Decorates `mixin` so that it only applies if it's not already on the
prototype chain.

**Kind**: global function  
**Returns**: <code>[MixinFunction](#MixinFunction)</code> - a new mixin function  

| Param | Type | Description |
| --- | --- | --- |
| mixin | <code>[MixinFunction](#MixinFunction)</code> | The mixin to wrap with deduplication behavior |

<a name="HasInstance"></a>

## HasInstance(mixin) ⇒ <code>[MixinFunction](#MixinFunction)</code>
Adds [Symbol.hasInstance] (ES2015 custom instanceof support) to `mixin`.

**Kind**: global function  
**Returns**: <code>[MixinFunction](#MixinFunction)</code> - the given mixin function  

| Param | Type | Description |
| --- | --- | --- |
| mixin | <code>[MixinFunction](#MixinFunction)</code> | The mixin to add [Symbol.hasInstance] to |

<a name="BareMixin"></a>

## BareMixin(mixin) ⇒ <code>[MixinFunction](#MixinFunction)</code>
A basic mixin decorator that applies the mixin with [apply](#apply) so that it
can be used with [isApplicationOf](#isApplicationOf), [hasMixin](#hasMixin) and the other
mixin decorator functions.

**Kind**: global function  
**Returns**: <code>[MixinFunction](#MixinFunction)</code> - a new mixin function  

| Param | Type | Description |
| --- | --- | --- |
| mixin | <code>[MixinFunction](#MixinFunction)</code> | The mixin to wrap |

<a name="Mixin"></a>

## Mixin(mixin) ⇒ <code>[MixinFunction](#MixinFunction)</code>
Decorates a mixin function to add deduplication, application caching and
instanceof support.

**Kind**: global function  
**Returns**: <code>[MixinFunction](#MixinFunction)</code> - a new mixin function  

| Param | Type | Description |
| --- | --- | --- |
| mixin | <code>[MixinFunction](#MixinFunction)</code> | The mixin to wrap |

<a name="mix"></a>

## mix([superclass]) ⇒ <code>MixinBuilder</code>
A fluent interface to apply a list of mixins to a superclass.

```javascript
class X extends mix(Object).with(A, B, C) {}
```

The mixins are applied in order to the superclass, so the prototype chain
will be: X->C'->B'->A'->Object.

This is purely a convenience function. The above example is equivalent to:

```javascript
class X extends C(B(A(Object))) {}
```

**Kind**: global function  

| Param | Type | Default |
| --- | --- | --- |
| [superclass] | <code>function</code> | <code>Object</code> |

<a name="MixinFunction"></a>

## MixinFunction ⇒ <code>function</code>
A function that returns a subclass of its argument.

**Kind**: global typedef  
**Returns**: <code>function</code> - A subclass of `superclass`  

| Param | Type |
| --- | --- |
| superclass | <code>function</code> |

**Example**  
```js
const M = (superclass) => class extends superclass {
  getMessage() {
    return "Hello";
  }
}
```

### References 
* https://www.typescriptlang.org/docs/handbook/mixins.html
* https://justinfagnani.com/2015/12/21/real-mixins-with-javascript-classes/
* https://mariusschulz.com/blog/mixin-classes-in-typescript