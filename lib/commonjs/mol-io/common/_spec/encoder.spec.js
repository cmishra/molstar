"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const array_encoder_1 = require("../binary-cif/array-encoder");
const decoder_1 = require("../binary-cif/decoder");
const E = array_encoder_1.ArrayEncoding;
test('fixedPoint2', async () => {
    const fixedPoint2 = E.by(E.fixedPoint(100)).and(E.delta).and(E.integerPacking);
    const x = [1.092, 1.960, 0.666, 0.480, 1.267];
    const y = [7.428, 7.026, 6.851, 7.524, 8.333];
    const z = [26.270, 26.561, 25.573, 27.055, 25.881];
    const xEnc = fixedPoint2.encode(new Float32Array(x));
    const yEnc = fixedPoint2.encode(new Float32Array(y));
    const zEnc = fixedPoint2.encode(new Float32Array(z));
    expect(xEnc.data.length).toEqual(6);
    expect(yEnc.data.length).toEqual(5);
    expect(zEnc.data.length).toEqual(6);
    const xDec = (0, decoder_1.decode)(xEnc);
    const yDec = (0, decoder_1.decode)(yEnc);
    const zDec = (0, decoder_1.decode)(zEnc);
    x.forEach((a, i) => expect(xDec[i]).toBeCloseTo(a, 2));
    y.forEach((a, i) => expect(yDec[i]).toBeCloseTo(a, 2));
    z.forEach((a, i) => expect(zDec[i]).toBeCloseTo(a, 2));
});
