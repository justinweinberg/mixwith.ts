# Documentation

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

## Functions

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
