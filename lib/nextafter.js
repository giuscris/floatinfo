import { unpack, pack } from './floatinfo.js';

const SMALLEST_SUBNORMAL = 2 ** -1074;

const UINT_MAX = 0xffffffff;

function nextafter(x, y) {
    switch (true) {
        case isNaN(x) && isNaN(y):
            return NaN;

        case x === y:
            return x;

        case x === 0:
            return y < 0 ? -SMALLEST_SUBNORMAL : SMALLEST_SUBNORMAL;
        
        default:
            const words = unpack(x);
            let lo = words.lo;
            let hi = words.hi;
            
            if ((x > 0 && y > x) || (x <= 0 && y <= x)) {
                if (lo < UINT_MAX) {
                    lo += 1;
                } else {
                    lo = 0;
                    hi += 1;
                }
            } else {
                if (lo > 0) {
                    lo -= 1;
                } else {
                    lo = UINT_MAX;
                    hi -= 1;
                }
            }

            return pack(lo, hi);
    }
}

export { nextafter };