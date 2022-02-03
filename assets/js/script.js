import * as floatinfo from '../../lib/floatinfo.js';
import { nextafter } from '../../lib/nextafter.js';

import { floatToPlainString, plainStringToFloat, fractionalBinaryToDecimal } from './format.js';

const numberInput = document.querySelector('#numberInput');

const expSign = document.querySelector('#expSign');
const expExponent = document.querySelector('#expExponent');
const expBase = document.querySelector('#expBase');
const expSignificand = document.querySelector('#expSignificand');
const expNum = document.querySelector('#expNum');

const bitCheckboxes = document.querySelectorAll('.bit');

const hexHiWord = document.querySelector('#hexHiWord');
const hexLoWord = document.querySelector('#hexLoWord');

const prevFloat = document.querySelector('#prevFloat');
const nextFloat = document.querySelector('#nextFloat');

const presets = {
    '+0': +0,
    '-0': -0,
    '+∞': +Infinity,
    '-∞': -Infinity,
    'NaN': NaN,
    'NaN max': floatinfo.pack(0xffffffff, 0xffffffff),
    'NaN min': floatinfo.pack(0x00000001, 0x7ff00000),
    'EPS': nextafter(1, 2) - 1,
    'π': Math.PI,
    'π/2': Math.PI / 2,
    '2π': Math.PI * 2,
    'φ': (1 + Math.sqrt(5)) / 2,
    'e': Math.E,
    '√2': Math.sqrt(2),
    'sin(1)': Math.sin(1),
    'cos(1)': Math.cos(1)
};

const presetButtons = document.querySelector('#presetButtons');

const expandExponential = document.querySelector('#expandExp');
const binaryExponential = document.querySelector('#binExp');
const displayCheckboxes = document.querySelector('#displayCheckboxes');
const displayMachineOrder = document.querySelector('#displayMachineOrder');

const endianness = document.querySelector('#endianness');

let n = 0;

numberInput.addEventListener('keydown', function (event) {
    const value = this.value;
    const pos = this.selectionStart;

    if (event.key === 'Enter') {
        enterNumberInput(true);
    }

    if (event.key === 'Escape') {
        this.blur();
    }

    if (event.key === 'ArrowUp') {
        this.value = floatToPlainString(parseFloat(value) + 1 || 0);
        this.setSelectionRange(pos, pos);
    }

    if (event.key === 'ArrowDown') {
        this.value = floatToPlainString(parseFloat(value) - 1 || 0);
        this.setSelectionRange(pos, pos);
    }
        
    if (event.key === '-' && value.indexOf('-') === -1) {
        this.value = '-' + value;
        this.setSelectionRange(pos + 1, pos + 1);
    }

    if (event.key === '+' && value.indexOf('-') === 0) {
        this.value = value.slice(1);
        this.setSelectionRange(pos - 1, pos - 1);
    }
    
    if ((event.key === '.' || event.key === ',') && value.indexOf('.') === -1) {
        const left = value.substring(0, pos);
        const right = value.substring(pos, value.length);
        const insert = (left === '' || left === '-') ? '0.' : '.';
        this.value = left + insert + right;
        const newPos = pos + insert.length;
        this.setSelectionRange(newPos, newPos);
    }

    if (['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'].indexOf(event.key) !== -1) {
        return;
    }
    
    event.preventDefault();
});

numberInput.addEventListener('keyup', function () {
    enterNumberInput();
});

numberInput.addEventListener('blur', function () {
    enterNumberInput(true);
});

bitCheckboxes.forEach(function(element) {
    element.addEventListener('change', function () {
        n = floatinfo.pack(getBitsValue(0, 32), getBitsValue(32, 32));
        displayFloat(n);
        updateNumberInput(n);
    });
});

prevFloat.addEventListener('click', function () {
    n = nextafter(n, -Infinity);
    displayFloat(n);
    updateNumberInput(n);
});

nextFloat.addEventListener('click', function () {
    n = nextafter(n, +Infinity);
    displayFloat(n);
    updateNumberInput(n);
});

for (const [key, value] of Object.entries(presets)) {
    const button = document.createElement('button');
    button.innerHTML = key;
    button.addEventListener('click', function () {
        n = value;
        displayFloat(n);
        updateNumberInput(n);
    });
    presetButtons.appendChild(button);
}

expandExponential.addEventListener('change', function () {
    displayFloat(n)
});

binaryExponential.addEventListener('change', function () {
    displayFloat(n)
});

displayCheckboxes.addEventListener('change', function () {
    document.body.classList.toggle('display-checkboxes');
});

displayMachineOrder.addEventListener('change', function () {
    document.body.classList.toggle('little-endian', this.checked && floatinfo.ENDIANNESS === floatinfo.LITTLE_ENDIAN);
});

endianness.innerHTML = floatinfo.ENDIANNESS === floatinfo.BIG_ENDIAN ? 'big' : 'little';

displayFloat(n);
updateNumberInput(n);

function enterNumberInput(validate = false) {
    n = numberInput.value === '' ? 0 : plainStringToFloat(numberInput.value);
    displayFloat(n);
    if (validate) {
        updateNumberInput(n);
    }
}

function updateNumberInput(n) {
    const float = parseFloat(n);
    const zeroSign = floatinfo.isNegativeZero(n) ? '-' : '';
    numberInput.value = `${zeroSign}${isFinite(float) ? floatToPlainString(float) : float}`;
}

function displayFloat(n) {
    const sign = floatinfo.sign(n);

    const exponent = Math.max(floatinfo.exponent(n) - 1023, -1022);
    const binExponent = floatinfo.exponent(n).toString(2).padStart(11, 0);
    const base = binaryExponential.checked ? exponent.toString(2) : exponent;

    const integer = floatinfo.integer(n);
    const fraction = floatinfo.fraction(n);

    const fractionHi = fraction.hi.toString(2).padStart(20, 0);
    const fractionLo = fraction.lo.toString(2).padStart(32, 0);

    const significand = `${integer}.${fractionHi}${fractionLo}`;

    const zeroSign = floatinfo.isNegativeZero(n) ? '-' : '';

    const hexHi = '0x' + floatinfo.unpack(n).hi.toString(16).padStart(8, 0);
    const hexLo = '0x' + floatinfo.unpack(n).lo.toString(16).padStart(8, 0);

    expSign.innerHTML = sign;
    expExponent.innerHTML = base;
    expSignificand.innerHTML = binaryExponential.checked ? significand : floatToPlainString(fractionalBinaryToDecimal(significand));
    expBase.innerHTML = binaryExponential.checked ? 10 : 2;

    expNum.innerHTML = `${zeroSign}${expandExponential.checked ? floatToPlainString(n) : n}`;

    setBits(sign.toString(), 63);
    setBits(binExponent, 52);
    setBits(fractionHi, 32);
    setBits(fractionLo, 0);

    hexHiWord.innerHTML = hexHi;
    hexLoWord.innerHTML = hexLo;
}

function setBits(n, offset) {
    for (let i = 0; i < n.length; i++) {
        document.getElementById(`bit${i + offset}`).checked = n[n.length - 1 - i] > 0;
    }
}

function getBitsValue(offset, length) {
    let value = 0;
    for (let i = 0; i < length; i++) {
        value += document.getElementById(`bit${i + offset}`).checked * (2 ** i);
    }
    return value;
}