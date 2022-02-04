# 🔢 floatinfo

**Get information about JavaScript IEEE 754 double precision floats.** [FLOAT INSPECTOR 🔎](https://giuscris.github.io/floatinfo/inspector.html)

## Usage

The library contains some functions to get information from unpacking floats into 32-bit words:

```js
import * as floatinfo from './lib/floatinfo.js';

const float = 1.0;

// Unpack a float into high and low order 32-bit words (normalized as big endian)
const words = floatinfo.unpack(float); // {lo: 0, hi: 1072693248}

// Get the sign bit
const sign = floatinfo.sign(float); // 1

// Get the 11-bit biased exponent (subtract 1023 to get the actual one)
const exponent = floatinfo.exponent(float); // 1023

// Get the integer part of the significand
const integer = floatinfo.integer(float); // 1

// Get the fractional part of the significand, unpacked as words
const fraction = floatinfo.fraction(float); // {lo: 0, hi: 0}

// Return whether a float is normal, i.e. not subnormal nor +Infinity, -Infinity or NaN
const isNormal = floatinfo.isNormal(float); // true

// Return whether a float is subnormal, i.e. small values near 0
const isSubnormal = floatinfo.isSubnormal(float); // false

// Return whether a float is negative zero (otherwise undetectable, as -0 === 0)
const isNegativeZero = floatinfo.isNegativeZero(float); // false
```

You can also create a float from 32-bit words with `floatinfo.pack(lo, hi)`:

```js
const pi = floatinfo.pack(0x54442d18, 0x400921fb); // 3.141592653589793

console.log(pi === Math.PI); // true
```

`floatinfo.js` does some checks to normalize the endianness of the 32-bit words, you can use the exported constants to determine machine endianness:

```js
const endianness = floatinfo.ENDIANNESS;

// Returns true on big endian hardware
const isBigEndian = floatinfo.ENDIANNESS === floatinfo.BIG_ENDIAN;

// Returns true on little endian hardware
const isLittleEndian = floatinfo.ENDIANNESS == floatinfo.LITTLE_ENDIAN;
```

The module `nextafter` contains a JavaScript implementation of `nextafter()` from C's `math.h`:

```js
import * as floatinfo from './lib/floatinfo.js';

import { nextafter } from './lib/nextafter.js';

const pi = floatinfo.pack(0x54442d18, 0x400921fb); // 3.141592653589793

const floatAfterPi = nextafter(pi, +Infinity); // 3.1415926535897936

const floatBeforePi = nextafter(pi, -Infinity); // 3.1415926535897927

console.log(floatAfterPi === floatinfo.pack(0x54442d19, 0x400921fb)); // true

console.log(floatBeforePi === floatinfo.pack(0x54442d17, 0x400921fb)); // true
```