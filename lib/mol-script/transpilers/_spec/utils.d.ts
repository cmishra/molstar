/**
 * Copyright (c) 2020-2021 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @author Panagiotis Tourlas <panangiot_tourlov@hotmail.com>
 * @author Koya Sakuma <koya.sakuma.work@gmail.com>
 */
import { Transpiler } from '../transpiler';
import { KeywordDict, PropertyDict, OperatorList } from '../types';
export declare function testKeywords(keywords: KeywordDict, transpiler: Transpiler): void;
export declare function testProperties(properties: PropertyDict, transpiler: Transpiler): void;
export declare function testOperators(operators: OperatorList, transpiler: Transpiler): void;
