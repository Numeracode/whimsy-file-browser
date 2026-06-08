import { createBrowserOpaqueId } from '../types/browser-item.types';
import type { BrowserFolderTreeNode } from '../types/browser-tree.types';
import { browserSourceFixtures } from './browser-items';

const id = createBrowserOpaqueId;

export const browserFolderTreeFixtures: readonly BrowserFolderTreeNode[] = [
    {
        id: id('tree:private:root'),
        name: 'Private storage',
        source: browserSourceFixtures.privateStorage,
        hasChildren: true,
        children: [
            {
                id: id('tree:private:projects'),
                name: 'Projects',
                source: browserSourceFixtures.privateStorage,
                hasChildren: true,
            },
            {
                id: id('tree:private:archive'),
                name: 'Archive',
                source: browserSourceFixtures.privateStorage,
            },
        ],
    },
    {
        id: id('tree:remote:gdrive:root'),
        name: 'Design Google Drive',
        source: browserSourceFixtures.googleDrive,
        hasChildren: true,
    },
    {
        id: id('tree:remote:dropbox:root'),
        name: 'Marketing Dropbox',
        source: browserSourceFixtures.dropbox,
        hasChildren: true,
    },
];

export const lazyBrowserFolderChildrenFixtures: Readonly<Record<string, readonly BrowserFolderTreeNode[]>> = {
    'tree:private:projects': [
        {
            id: id('tree:private:projects:brand'),
            name: 'Brand',
            source: browserSourceFixtures.privateStorage,
        },
        {
            id: id('tree:private:projects:launch'),
            name: 'Launch',
            source: browserSourceFixtures.privateStorage,
        },
    ],
    'tree:remote:gdrive:root': [
        {
            id: id('tree:remote:gdrive:campaign'),
            name: 'Campaign',
            source: browserSourceFixtures.googleDrive,
        },
    ],
    'tree:remote:dropbox:root': [
        {
            id: id('tree:remote:dropbox:deliveries'),
            name: 'Deliveries',
            source: browserSourceFixtures.dropbox,
        },
    ],
};
