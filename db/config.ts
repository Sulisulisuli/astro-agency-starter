import { defineDb, defineTable, column, NOW } from 'astro:db';

const SiteConfig = defineTable({
    columns: {
        key: column.text({ primaryKey: true }),
        value: column.json(),
    }
});

const Leads = defineTable({
    columns: {
        id: column.number({ primaryKey: true }),
        type: column.text(),
        payload: column.json(),
        createdAt: column.date({ default: NOW }),
    }
});

const SystemLogs = defineTable({
    columns: {
        id: column.number({ primaryKey: true }),
        message: column.text(),
        timestamp: column.date({ default: NOW }),
    }
});

export default defineDb({
    tables: { SiteConfig, Leads, SystemLogs }
});
