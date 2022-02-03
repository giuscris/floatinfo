// Constants used to describe endianness
const BIG_ENDIAN = 1;
const LITTLE_ENDIAN = 0;

// The high order word of 1.0
const UNIT_HI = 0x3ff00000;

// Lowest exponent and highest exponent possible
// 1. Number with EXP_LO < exponent < EXP_HI are normal
// 2. Floats with EXP_LO exponent are subnormal
// 3. NaN and ±Infinity have EXP_HI exponent
const EXP_LO = 0;
const EXP_HI = 0x7ff;

// Use typed arrays to handle binary data
const buffer = new ArrayBuffer(8);
const floatView = new Float64Array(buffer);
const uintView = new Uint32Array(buffer);

// 64-bit float numbers are stored in two 32-bit words
// Word order or endianness, is machine dependent

// We'll normalize things and ALWAYS consider the word with sign and exponent
// as the higher one (hi), and the other as the lower one (lo), i.e. as if
// the machine is always big endian

//                     HI WORD                                         LO WORD
// |---|---------------|--------------------------|  |-----------------------------------------|
// | 0 | 000 0000 0000 | 0000 0000 0000 0000 0000 |  | 0000 0000 0000 0000 0000 0000 0000 0000 |
// |---|---------------|--------------------------|  |-----------------------------------------|
//  sign   exponent      fraction (first 20 bits)              fraction (last 32 bits)

// Initialize floatView[0] with 1.0 to test endianness

floatView[0] = 1.0;

// Test which 32-bit word is the most significant of 1.0

// |---|---------------|--------------------------| 
// | 0 | 011 1111 1111 | 0000 0000 0000 0000 0000 | = 0x3ff00000 = UNIT_HI
// |---|---------------|--------------------------|
//  sign   exponent           fraction (hi)

const ENDIANNESS = uintView[0] === UNIT_HI ? BIG_ENDIAN : LITTLE_ENDIAN;

// Word indices based on machine endianness
const WORD_LO = ENDIANNESS === BIG_ENDIAN ? 1 : 0;
const WORD_HI = ENDIANNESS === BIG_ENDIAN ? 0 : 1;

/**
 * Unpack a float into high and low order 32-bit words
 */
function unpack(n) {
    floatView[0] = n;
    return {
        lo: uintView[WORD_LO],
        hi: uintView[WORD_HI]
    };
}

/**
 * Get the sign bit of a float
 */
function sign(n) {
    return unpack(n).hi >>> 31;
}

/**
 * Get the 11-bit biased exponent of a float
 */
function exponent(n) {
    return (unpack(n).hi << 1) >>> 21;
}

/**
 * Get the integer part of a float significand
 */
function integer(n) {
    return isNormal(n) ? 1 : 0;
}

/**
 * Get the fractional part of a float significand as 20-bit higher and 32-bit lower words
 */
function fraction(n) {
    const words = unpack(n);
    return {
        lo: words.lo,
        hi: (words.hi << 12) >>> 12
    };
}

/**
 * Pack high and low order 32-bit words into a float
 */
function pack(lo, hi) {
    uintView[WORD_LO] = lo;
    uintView[WORD_HI] = hi;
    return floatView[0];
}

/**
 * Return whether a float is normal
 */
 function isNormal(n) {
    const exp = exponent(n);
    return exp > EXP_LO && exp < EXP_HI;
}

/**
 * Return whether a float is subnormal
 */
function isSubnormal(n) {
    const exp = exponent(n);
    return exp === EXP_LO;
}

/**
 * Return whether a float is negative zero
 */
function isNegativeZero(n) {
    return n === 0 && sign(n) === 1;
}

export { unpack, sign, exponent, integer, fraction, pack, isNormal, isSubnormal, isNegativeZero, ENDIANNESS, BIG_ENDIAN, LITTLE_ENDIAN };