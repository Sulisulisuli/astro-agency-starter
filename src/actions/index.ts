import { upload, remove } from './media';
import { create as createLead } from './leads';
import { update as updateConfig } from './config';

export const server = {
    media: {
        upload,
        remove
    },
    leads: {
        create: createLead
    },
    config: {
        update: updateConfig
    }
};
