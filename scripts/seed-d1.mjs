#!/usr/bin/env node
/**
 * Seed script for Cloudflare D1 using the same service catalog.
 *
 * Usage (PowerShell):
 *  $env:CF_ACCOUNT_ID="..."; $env:CF_API_TOKEN="..."; $env:D1_DATABASE_ID="..."; node .\scripts\seed-d1.mjs
 *
 * Usage (bash):
 *  CF_ACCOUNT_ID=... CF_API_TOKEN=... D1_DATABASE_ID=... node ./scripts/seed-d1.mjs
 */

import 'dotenv/config';

import { services as seedServices } from '../src/helpers/servicesData.js';
import { projects as seedProjectsBundle } from '../src/data/projectsData.js';

// normalize projects array
const seedProjects = (seedProjectsBundle && Array.isArray(seedProjectsBundle.items)) ? seedProjectsBundle.items : [];

const seedClients = [
  {
    name: 'Northstar Studio',
    email: 'hello@northstarstudio.com',
    relationship: 'client',
    company: 'Northstar Studio',
    phone: '+880 1700 000 001',
    website: 'https://northstarstudio.com',
    location: 'Dhaka, Bangladesh',
    status: 'active',
    engagement: 'enterprise',
    notes: 'Primary product partner for ongoing platform work.',
    completedProjects: [],
    lastSeen: '2 days ago',
  },
  {
    name: 'Apex Commerce',
    email: 'ops@apexcommerce.io',
    relationship: 'partner',
    company: 'Apex Commerce',
    phone: '+880 1700 000 002',
    website: 'https://apexcommerce.io',
    location: 'Singapore',
    status: 'pending',
    engagement: 'standard',
    notes: 'Partner lead for integration and delivery coordination.',
    completedProjects: [],
    lastSeen: '18 min ago',
  },
  {
    name: 'Lumina Media',
    email: 'contact@luminamedia.co',
    relationship: 'client',
    company: 'Lumina Media',
    phone: '+880 1700 000 003',
    website: 'https://luminamedia.co',
    location: 'London, UK',
    status: 'active',
    engagement: 'premium',
    notes: 'Brand and content support for campaign launches.',
    completedProjects: [],
    lastSeen: '1 hour ago',
  },
  {
    name: 'Mosaic Labs',
    email: 'team@mosaiclabs.dev',
    relationship: 'other',
    company: 'Mosaic Labs',
    phone: '+880 1700 000 004',
    website: 'https://mosaiclabs.dev',
    location: 'Remote',
    status: 'inactive',
    engagement: 'basic',
    notes: 'Occasional advisory and project review contact.',
    completedProjects: [],
    lastSeen: 'Yesterday',
  },
];

const accountId = process.env.CF_ACCOUNT_ID;
const apiToken = process.env.CF_API_TOKEN;
const databaseId = process.env.D1_DATABASE_ID;

if (!accountId || !apiToken || !databaseId) {
  console.error('Missing environment variables. Please set CF_ACCOUNT_ID, CF_API_TOKEN, and D1_DATABASE_ID.');
  process.exit(1);
}

const endpoint = `https://api.cloudflare.com/client/v4/accounts/${accountId}/d1/database/${databaseId}/query`;

async function run() {
  console.log(`Seeding ${seedServices.length} services into D1 database ${databaseId}...`);

  let created = 0;
  let updated = 0;

  try {
    const resetSql = `
      DROP TABLE IF EXISTS projects;
      DROP TABLE IF EXISTS services;
      DROP TABLE IF EXISTS clients;
    `;

    const resetRes = await fetch(endpoint, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ sql: resetSql }),
    });

    if (!resetRes.ok) {
      const errBody = await resetRes.json().catch(() => null);
      console.warn('Warning: failed to reset seeded tables', errBody || (await resetRes.text()));
    } else {
      console.log('Reset `projects`, `services`, and `clients` tables.');
    }
  } catch (err) {
    console.warn('Warning: error while resetting seeded tables:', err?.message || err);
  }

  // Ensure services table exists (idempotent)
  try {
    const createSql = `
      CREATE TABLE IF NOT EXISTS services (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        tier TEXT NOT NULL DEFAULT 'Core',
        price TEXT NOT NULL,
        turnaround TEXT NOT NULL DEFAULT 'Flexible',
        status TEXT NOT NULL DEFAULT 'active',
        sort_order INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `;

    const createRes = await fetch(endpoint, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ sql: createSql }),
    });

    if (!createRes.ok) {
      const errBody = await createRes.json().catch(() => null);
      console.warn('Warning: failed to ensure services table exists', errBody || (await createRes.text()));
    } else {
      console.log('Ensured `services` table exists (or already did).');
    }
  } catch (err) {
    console.warn('Warning: error while creating services table:', err?.message || err);
  }

  // Ensure clients table exists (idempotent)
  try {
    const createClientsSql = `
      CREATE TABLE IF NOT EXISTS clients (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        relationship TEXT NOT NULL DEFAULT 'client',
        company TEXT,
        phone TEXT,
        website TEXT,
        location TEXT,
        status TEXT NOT NULL DEFAULT 'active',
        engagement TEXT NOT NULL DEFAULT 'standard',
        notes TEXT,
        completed_projects TEXT NOT NULL DEFAULT '[]',
        last_seen TEXT,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `;

    const createClientsRes = await fetch(endpoint, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ sql: createClientsSql }),
    });

    if (!createClientsRes.ok) {
      const errBody = await createClientsRes.json().catch(() => null);
      console.warn('Warning: failed to ensure clients table exists', errBody || (await createClientsRes.text()));
    } else {
      console.log('Ensured `clients` table exists (or already did).');
    }
  } catch (err) {
    console.warn('Warning: error while creating clients table:', err?.message || err);
  }

  let cCreated = 0;
  let cUpdated = 0;

  for (let i = 0; i < seedClients.length; i++) {
    const c = seedClients[i];

    try {
      const selectRes = await fetch(endpoint, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sql: 'SELECT id FROM clients WHERE email = ? LIMIT 1', params: [c.email] }),
      });

      const selectBody = await selectRes.json().catch(() => null);
      const rows = Array.isArray(selectBody?.result?.[0]?.results) ? selectBody.result[0].results : selectBody?.results || [];
      const existing = rows && rows.length > 0 ? rows[0] : null;

      if (existing && existing.id) {
        const updateSql = `UPDATE clients SET name = ?, relationship = ?, company = ?, phone = ?, website = ?, location = ?, status = ?, engagement = ?, notes = ?, completed_projects = ?, last_seen = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
        const updateParams = [c.name, c.relationship, c.company, c.phone, c.website, c.location, c.status, c.engagement, c.notes, JSON.stringify(c.completedProjects || []), c.lastSeen, existing.id];

        const updRes = await fetch(endpoint, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${apiToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ sql: updateSql, params: updateParams }),
        });

        if (!updRes.ok) {
          const errBody = await updRes.json().catch(() => null);
          console.error(`Failed to update client: ${c.name}`, errBody || (await updRes.text()));
        } else {
          cUpdated += 1;
          console.log(`Updated client: ${c.name}`);
        }
      } else {
        const insertSql = `INSERT INTO clients (name, email, relationship, company, phone, website, location, status, engagement, notes, completed_projects, last_seen) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        const insertParams = [c.name, c.email, c.relationship, c.company, c.phone, c.website, c.location, c.status, c.engagement, c.notes, JSON.stringify(c.completedProjects || []), c.lastSeen];

        const insRes = await fetch(endpoint, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${apiToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ sql: insertSql, params: insertParams }),
        });

        if (!insRes.ok) {
          const errBody = await insRes.json().catch(() => null);
          console.error(`Failed to insert client: ${c.name}`, errBody || (await insRes.text()));
        } else {
          cCreated += 1;
          console.log(`Inserted client: ${c.name}`);
        }
      }
    } catch (err) {
      console.error('Error upserting client', c.name, err?.message || err);
    }
  }

  console.log(`Clients seeding done. Inserted ${cCreated}, Updated ${cUpdated}, Total ${seedClients.length}.`);

  for (let i = 0; i < seedServices.length; i++) {
    const s = seedServices[i];

    try {
      // Check for an existing service with the same title
      const selectRes = await fetch(endpoint, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sql: 'SELECT id FROM services WHERE title = ? LIMIT 1', params: [s.title] }),
      });

      const selectBody = await selectRes.json().catch(() => null);
      const rows = Array.isArray(selectBody?.result?.[0]?.results) ? selectBody.result[0].results : selectBody?.results || [];
      const existing = rows && rows.length > 0 ? rows[0] : null;

      if (existing && existing.id) {
        // Update existing record
        const updateSql = `UPDATE services SET description = ?, tier = ?, price = ?, turnaround = ?, status = ?, sort_order = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
        const updateParams = [s.description, s.tier ?? 'Core', s.price ?? '', s.turnaround ?? '', s.status ?? 'active', i, existing.id];

        const updRes = await fetch(endpoint, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${apiToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ sql: updateSql, params: updateParams }),
        });

        if (!updRes.ok) {
          const errBody = await updRes.json().catch(() => null);
          console.error(`Failed to update: ${s.title}`, errBody || (await updRes.text()));
        } else {
          updated += 1;
          console.log(`Updated: ${s.title}`);
        }
      } else {
        // Insert new record
        const insertSql = `INSERT INTO services (title, description, tier, price, turnaround, status, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?)`;
        const insertParams = [s.title, s.description, s.tier ?? 'Core', s.price ?? '', s.turnaround ?? '', s.status ?? 'active', i];

        const insRes = await fetch(endpoint, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${apiToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ sql: insertSql, params: insertParams }),
        });

        if (!insRes.ok) {
          const errBody = await insRes.json().catch(() => null);
          console.error(`Failed to insert: ${s.title}`, errBody || (await insRes.text()));
        } else {
          created += 1;
          console.log(`Inserted: ${s.title}`);
        }
      }
    } catch (err) {
      console.error('Error upserting', s.title, err?.message || err);
    }
  }

  console.log(`Done. Inserted ${created}, Updated ${updated}, Total ${seedServices.length}.`);

  // Now seed projects (idempotent)
  if (seedProjects.length > 0) {
    let pCreated = 0;
    let pUpdated = 0;

    try {
      const createProjSql = `
        CREATE TABLE IF NOT EXISTS projects (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title TEXT NOT NULL,
          description TEXT NOT NULL,
          category TEXT NOT NULL DEFAULT 'Web',
          responsibilities TEXT NOT NULL DEFAULT '[]',
          techStack TEXT NOT NULL DEFAULT '[]',
          liveDemo TEXT,
          github TEXT,
          thumb TEXT,
          featured INTEGER NOT NULL DEFAULT 0,
          status TEXT NOT NULL DEFAULT 'draft',
          sortOrder INTEGER NOT NULL DEFAULT 0,
          created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
      `;

      const createProjRes = await fetch(endpoint, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sql: createProjSql }),
      });

      if (!createProjRes.ok) {
        const errBody = await createProjRes.json().catch(() => null);
        console.warn('Warning: failed to ensure projects table exists', errBody || (await createProjRes.text()));
      } else {
        console.log('Ensured `projects` table exists (or already did).');
      }

      const addProjectColumns = [
        [`ALTER TABLE projects ADD COLUMN category TEXT NOT NULL DEFAULT 'Web';`, 'category'],
        [`ALTER TABLE projects ADD COLUMN responsibilities TEXT NOT NULL DEFAULT '[]';`, 'responsibilities'],
        [`ALTER TABLE projects ADD COLUMN techStack TEXT NOT NULL DEFAULT '[]';`, 'techStack'],
        [`ALTER TABLE projects ADD COLUMN liveDemo TEXT;`, 'liveDemo'],
        [`ALTER TABLE projects ADD COLUMN github TEXT;`, 'github'],
        [`ALTER TABLE projects ADD COLUMN thumb TEXT;`, 'thumb'],
        [`ALTER TABLE projects ADD COLUMN sortOrder INTEGER NOT NULL DEFAULT 0;`, 'sortOrder'],
      ];

      for (const [sql, columnName] of addProjectColumns) {
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${apiToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ sql }),
        });

        if (!res.ok) {
          const errBody = await res.json().catch(() => null);
          const errorText = errBody || (await res.text());
          const normalized = String(JSON.stringify(errorText || '')).toLowerCase();
          if (!normalized.includes('duplicate column name')) {
            console.warn(`Warning: failed to ensure projects.${columnName} exists`, errorText);
          }
        } else {
          console.log(`Ensured projects.${columnName} exists (or already did).`);
        }
      }
    } catch (err) {
      console.warn('Warning: error while creating projects table:', err?.message || err);
    }

    for (let i = 0; i < seedProjects.length; i++) {
      const p = seedProjects[i];
      const title = p.name || p.title || `Project ${i + 1}`;
      const description = p.description || '';
      const category = p.category || 'Web';
      const responsibilities = JSON.stringify(Array.isArray(p.responsibilities) ? p.responsibilities : []);
      const techStack = JSON.stringify(Array.isArray(p.techStack) ? p.techStack : Array.isArray(p.stack) ? p.stack : []);
      const liveDemo = p.liveDemo || p.live || p.live_url || null;
      const github = p.github || p.repo || p.repo_url || null;
      const thumb = p.thumb || p.imageUrl || p.image_key || '';
      const featured = p.featured ? 1 : 0;

      try {
        const selectRes = await fetch(endpoint, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${apiToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ sql: 'SELECT id FROM projects WHERE title = ? LIMIT 1', params: [title] }),
        });

        const selectBody = await selectRes.json().catch(() => null);
        const rows = Array.isArray(selectBody?.result?.[0]?.results) ? selectBody.result[0].results : selectBody?.results || [];
        const existing = rows && rows.length > 0 ? rows[0] : null;

        if (existing && existing.id) {
          const updateSql = `UPDATE projects SET description = ?, category = ?, responsibilities = ?, techStack = ?, liveDemo = ?, github = ?, thumb = ?, featured = ?, status = ?, sortOrder = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
          const updateParams = [description, category, responsibilities, techStack, liveDemo, github, thumb, featured, 'published', i, existing.id];

          const updRes = await fetch(endpoint, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${apiToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ sql: updateSql, params: updateParams }),
          });

          if (!updRes.ok) {
            const errBody = await updRes.json().catch(() => null);
            console.error(`Failed to update project: ${title}`, errBody || (await updRes.text()));
          } else {
            pUpdated += 1;
            console.log(`Updated project: ${title}`);
          }
        } else {
          const insertSql = `INSERT INTO projects (title, description, category, responsibilities, techStack, liveDemo, github, thumb, featured, status, sortOrder) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
          const insertParams = [title, description, category, responsibilities, techStack, liveDemo, github, thumb, featured, 'published', i];

          const insRes = await fetch(endpoint, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${apiToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ sql: insertSql, params: insertParams }),
          });

          if (!insRes.ok) {
            const errBody = await insRes.json().catch(() => null);
            console.error(`Failed to insert project: ${title}`, errBody || (await insRes.text()));
          } else {
            pCreated += 1;
            console.log(`Inserted project: ${title}`);
          }
        }
      } catch (err) {
        console.error('Error upserting project', title, err?.message || err);
      }
    }

    console.log(`Projects seeding done. Inserted ${pCreated}, Updated ${pUpdated}, Total ${seedProjects.length}.`);
  } else {
    console.log('No default projects data found to seed.');
  }
}

run().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
