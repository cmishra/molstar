"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clip_pixel = void 0;
exports.clip_pixel = `
#if defined(dClipVariant_pixel) && dClipObjectCount != 0
    if (clipTest(vModelPosition))
        discard;
#endif
`;
