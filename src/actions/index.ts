import { upload } from './media';
import { create as createLead } from './leads';
import { update as updateConfig } from './config';

export const server = {
    media: {
        upload
    },
    leads: {
        create: createLead
    },
    config: {
        update: updateConfig
    }
};
