/**
 * Copyright (c) 2020-2021 mol* contributors, licensed under MIT, See LICENSE file for more info.
 * @author Koya Sakuma <koya.sakuma.work@gmail.com>
 * Adapted from MolQL project
**/
import { _transpiler as transpilers } from '../all';
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
testTranspilerExamples('pymol', transpilers.pymol);
testTranspilerExamples('vmd', transpilers.vmd);
testTranspilerExamples('jmol', transpilers.jmol);
