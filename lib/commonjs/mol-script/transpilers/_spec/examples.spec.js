"use strict";
/**
 * Copyright (c) 2020-2021 mol* contributors, licensed under MIT, See LICENSE file for more info.
 * @author Koya Sakuma <koya.sakuma.work@gmail.com>
 * Adapted from MolQL project
**/
Object.defineProperty(exports, "__esModule", { value: true });
const all_1 = require("../all");
function testTranspilerExamples(name, transpiler) {
    describe(`${name} examples`, () => {
        const examples = require(`../${name}/examples`).examples;
        //        console.log(examples);
        for (const e of examples) {
            it(e.name, () => {
                // check if it transpiles and compiles/typechecks.
                transpiler(e.value);
            });
        }
    });
}
testTranspilerExamples('pymol', all_1._transpiler.pymol);
testTranspilerExamples('vmd', all_1._transpiler.vmd);
testTranspilerExamples('jmol', all_1._transpiler.jmol);
