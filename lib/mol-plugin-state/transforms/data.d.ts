/**
 * Copyright (c) 2018-2024 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @author Neli Fonseca <neli@ebi.ac.uk>
 */
import { StateTransformer } from '../../mol-state';
import { ParamDefinition as PD } from '../../mol-util/param-definition';
import { PluginStateObject as SO } from '../objects';
import { Asset } from '../../mol-util/assets';
export { Download };
export { DownloadBlob };
export { DeflateData };
export { RawData };
export { ReadFile };
export { ParseBlob };
export { ParseCif };
export { ParseCube };
export { ParsePsf };
export { ParsePrmtop };
export { ParseTop };
export { ParsePly };
export { ParseCcp4 };
export { ParseDsn6 };
export { ParseDx };
export { ImportString };
export { ImportJson };
export { ParseJson };
export { LazyVolume };
type Download = typeof Download;
declare const Download: StateTransformer<SO.Root, SO.Data.String | SO.Data.Binary, PD.Normalize<{
    url: string | Asset.Url;
    label: string | undefined;
    isBinary: boolean | undefined;
}>>;
type DownloadBlob = typeof DownloadBlob;
declare const DownloadBlob: StateTransformer<SO.Root, SO.Data.Blob, PD.Normalize<{
    sources: PD.Normalize<{
        id: /*elided*/ any;
        url: /*elided*/ any;
        isBinary: /*elided*/ any;
        canFail: /*elided*/ any;
    }>[];
    maxConcurrency: number | undefined;
}>>;
type DeflateData = typeof DeflateData;
declare const DeflateData: StateTransformer<SO.Data.Binary, SO.Data.String | SO.Data.Binary, PD.Normalize<{
    method: string;
    isString: boolean;
    stringEncoding: string | undefined;
    label: string | undefined;
}>>;
type RawData = typeof RawData;
declare const RawData: StateTransformer<SO.Root, SO.Data.String | SO.Data.Binary, PD.Normalize<{
    data: string | ArrayBuffer | Uint8Array<ArrayBufferLike> | number[];
    label: string | undefined;
}>>;
type ReadFile = typeof ReadFile;
declare const ReadFile: StateTransformer<SO.Root, SO.Data.String | SO.Data.Binary, PD.Normalize<{
    file: Asset.File | null;
    label: string | undefined;
    isBinary: boolean | undefined;
}>>;
type ParseBlob = typeof ParseBlob;
declare const ParseBlob: StateTransformer<SO.Data.Blob, SO.Format.Blob, PD.Normalize<{
    formats: PD.Normalize<{
        id: /*elided*/ any;
        format: /*elided*/ any;
    }>[];
}>>;
type ParseCif = typeof ParseCif;
declare const ParseCif: StateTransformer<SO.Data.String | SO.Data.Binary, SO.Format.Cif, PD.Normalize<{}>>;
type ParseCube = typeof ParseCube;
declare const ParseCube: StateTransformer<SO.Data.String, SO.Format.Cube, PD.Normalize<{}>>;
type ParsePsf = typeof ParsePsf;
declare const ParsePsf: StateTransformer<SO.Data.String, SO.Format.Psf, PD.Normalize<{}>>;
type ParsePrmtop = typeof ParsePrmtop;
declare const ParsePrmtop: StateTransformer<SO.Data.String, SO.Format.Prmtop, PD.Normalize<{}>>;
type ParseTop = typeof ParseTop;
declare const ParseTop: StateTransformer<SO.Data.String, SO.Format.Top, PD.Normalize<{}>>;
type ParsePly = typeof ParsePly;
declare const ParsePly: StateTransformer<SO.Data.String, SO.Format.Ply, PD.Normalize<{}>>;
type ParseCcp4 = typeof ParseCcp4;
declare const ParseCcp4: StateTransformer<SO.Data.Binary, SO.Format.Ccp4, PD.Normalize<{}>>;
type ParseDsn6 = typeof ParseDsn6;
declare const ParseDsn6: StateTransformer<SO.Data.Binary, SO.Format.Dsn6, PD.Normalize<{}>>;
type ParseDx = typeof ParseDx;
declare const ParseDx: StateTransformer<SO.Data.String | SO.Data.Binary, SO.Format.Dx, PD.Normalize<{}>>;
type ImportString = typeof ImportString;
declare const ImportString: StateTransformer<SO.Root, SO.Data.String, PD.Normalize<{
    data: string;
    label: string | undefined;
}>>;
type ImportJson = typeof ImportJson;
declare const ImportJson: StateTransformer<SO.Root, SO.Format.Json, PD.Normalize<{
    data: any;
    label: string | undefined;
}>>;
type ParseJson = typeof ParseJson;
declare const ParseJson: StateTransformer<SO.Data.String, SO.Format.Json, PD.Normalize<{}>>;
type LazyVolume = typeof LazyVolume;
declare const LazyVolume: StateTransformer<SO.Root, SO.Volume.Lazy, PD.Normalize<{
    url: string | Asset.Url;
    isBinary: boolean;
    format: string;
    entryId: string | string[];
    isovalues: PD.Normalize<{
        type: /*elided*/ any;
        value: /*elided*/ any;
        color: /*elided*/ any;
        alpha: /*elided*/ any;
        volumeIndex: /*elided*/ any;
    }>[];
}>>;
