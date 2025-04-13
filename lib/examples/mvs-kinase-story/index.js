/**
 * Copyright (c) 2025 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import { getMolComponentContext } from './context';
import './index.html';
import './elements/snapshot-markdown';
import './elements/viewer';
import { buildStory } from './kinase-story';
import '../../mol-plugin-ui/skin/light.scss';
import './styles.scss';
import { download } from '../../mol-util/download';
export class MolComponents {
    getContext(name) {
        return getMolComponentContext({ name });
    }
}
window.mc = new MolComponents();
window.buildStory = buildStory;
window.molStarDownload = download;
