function floatToPlainString(num) {
    return num.toString().replace(/(-?)(\d*)\.?(\d*)e([+-]\d+)/,
        function (match, sign, int, frac, exp) {
            return exp < 0
                ? sign + '0.' + '0'.repeat(-exp - int.length) + int + frac
                : sign + int + frac + '0'.repeat(exp - frac.length);
        });
}

function plainStringToFloat(str) {
    const sign = str[0] === '-' ? '-' : '+';
    str = str.replace(/^[0+\-]+/, '');
    const point = str.indexOf('.');
    const trailing = (str.match(/0+$/) || [''])[0].length;
    const digits = str.replace(/\.|0+$/g, '') || '0';
    const exponent = point > -1 ? -(digits.length - point) : trailing;
    return parseFloat(`${sign}${digits}e${exponent}`);
}

function fractionalBinaryToDecimal(b) {
    let result = 0;

    const [int, frac] = b.split('.');

    if (typeof int !== 'undefined') {
        const intDigits = int.length;
        for (let i = 0; i < intDigits; i++) {
            result += 2 ** (intDigits - 1 - i) * int[i];
        }
    }

    if (typeof frac !== 'undefined') {
        const fracDigits = frac.length;
        for (let i = 0; i < fracDigits; i++) {
            result += 2 ** -(i + 1) * frac[i];
        }
    }

    return result;
}

export { floatToPlainString, plainStringToFloat, fractionalBinaryToDecimal };