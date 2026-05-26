import { services as defaultServices } from '@/helpers/servicesData';
import { projects as defaultProjects } from '@/data/projectsData.js';

const D1_API_BASE = 'https://api.cloudflare.com/client/v4/accounts';

export function hasD1Config() {
  return Boolean(
    process.env.CF_ACCOUNT_ID &&
      process.env.CF_API_TOKEN &&
      process.env.D1_DATABASE_ID
  );
}

export async function queryD1(sql, params = []) {
  const accountId = process.env.CF_ACCOUNT_ID;
  const apiToken = process.env.CF_API_TOKEN;
  const databaseId = process.env.D1_DATABASE_ID;

  if (!accountId || !apiToken || !databaseId) {
    return null;
  }

  const response = await fetch(
    `${D1_API_BASE}/${accountId}/d1/database/${databaseId}/query`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ sql, params }),
      cache: 'no-store',
    }
  );

  if (!response.ok) {
    const errorText = await response.text().catch(() => '');
    throw new Error(
      `D1 request failed with ${response.status}${errorText ? `: ${errorText}` : ''}`
    );
  }

  const payload = await response.json();
  return payload?.result?.[0]?.results ?? [];
}

function isMissingTableError(error, tableName) {
  const message = String(error?.message || '').toLowerCase();
  const tableMessage = tableName ? `no such table: ${tableName}` : 'no such table:';
  return message.includes(tableMessage) || message.includes('code":7500');
}

async function safeQueryD1(sql, params = [], fallback = null, tableName = null) {
  try {
    return await queryD1(sql, params);
  } catch (error) {
    if (isMissingTableError(error, tableName)) {
      return fallback;
    }

    throw error;
  }
}

function normalizeServiceRecord(service, index) {
  return {
    id: service.id ?? index + 1,
    num: service.num ?? String(index + 1).padStart(2, '0'),
    title: service.title,
    description: service.description,
    tier: service.tier ?? 'Core',
    price: service.price ?? 'Custom quote',
    turnaround: service.turnaround ?? 'Flexible',
    status: service.status ?? 'active',
    sortOrder: Number(service.sortOrder ?? index),
    href: service.href ?? `/contact?service=${encodeURIComponent(service.title)}`,
  };
}

function getSeedServices() {
  return defaultServices.map((service, index) => normalizeServiceRecord(service, index));
}

function mapServiceRow(row, index) {
  return normalizeServiceRecord(
    {
      id: row.id,
      title: row.title,
      description: row.description,
      tier: row.tier || (index === 0 ? 'Core' : index === 1 ? 'Growth' : index === 2 ? 'Premium' : 'Core'),
      price: row.price,
      turnaround: row.turnaround,
      status: row.status,
      sortOrder: row.sortOrder ?? index,
    },
    index
  );
}

function normalizeProjectRecord(project, index) {
  return {
    id: project.id ?? index + 1,
    num: project.num ?? String(index + 1).padStart(2, '0'),
    title: project.title ?? project.name ?? `Project ${index + 1}`,
    category: project.category ?? 'Web',
    description: project.description ?? '',
    responsibilities: project.responsibilities ?? [],
    techStack: project.techStack ?? [],
    thumb: project.thumb ?? '',
    github: project.github ?? '',
    liveDemo: project.liveDemo ?? '',
    status: project.status ?? 'published',
    featured: Boolean(project.featured ?? false),
    sortOrder: Number(project.sortOrder ?? index),
    updatedAt: project.updatedAt ?? new Date().toISOString(),
  };
}

function parseProjectTechStack(stack) {
  if (Array.isArray(stack)) {
    return stack
      .map((item) => (typeof item === 'string' ? item : item?.name))
      .filter(Boolean);
  }

  const raw = String(stack ?? '').trim();
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed
        .map((item) => (typeof item === 'string' ? item : item?.name))
        .filter(Boolean);
    }
  } catch {
    // Fall through to comma-separated parsing.
  }

  return raw
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseProjectResponsibilities(responsibilities) {
  if (Array.isArray(responsibilities)) {
    return responsibilities.filter(Boolean);
  }

  const raw = String(responsibilities ?? '').trim();
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.filter(Boolean);
    }
  } catch {
    // Fall through to newline parsing.
  }

  return raw
    .split('\n')
    .map((item) => item.trim())
    .filter(Boolean);
}

function normalizeProjectTechStackValue(techStack) {
  if (Array.isArray(techStack)) {
    return techStack.map((item) => String(item).trim()).filter(Boolean);
  }

  const raw = String(techStack ?? '').trim();
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.map((item) => String(item).trim()).filter(Boolean);
    }
  } catch {
    // Fall through to comma-separated parsing.
  }

  return raw
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function normalizeProjectResponsibilitiesValue(responsibilities) {
  if (Array.isArray(responsibilities)) {
    return responsibilities.map((item) => String(item).trim()).filter(Boolean);
  }

  const raw = String(responsibilities ?? '').trim();
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.map((item) => String(item).trim()).filter(Boolean);
    }
  } catch {
    // Fall through to newline parsing.
  }

  return raw
    .split('\n')
    .map((item) => item.trim())
    .filter(Boolean);
}

function getSeedProjects() {
  return (defaultProjects?.items ?? []).map((project, index) => normalizeProjectRecord(project, index));
}

function buildServiceSummary(items) {
  return {
    total: items.length,
    active: items.filter((item) => String(item.status).toLowerCase() === 'active').length,
    draft: items.filter((item) => String(item.status).toLowerCase() === 'draft').length,
  };
}

export async function getAdminOverview() {
  if (!hasD1Config()) {
    return {
      source: 'd1',
      timestamp: new Date().toISOString(),
      summary: {
        projects: 0,
        publishedProjects: 0,
        inReviewProjects: 0,
        draftProjects: 0,
        posts: 0,
        publishedPosts: 0,
        draftPosts: 0,
        featuredPosts: 0,
        services: 0,
        messages: 0,
        unreadMessages: 0,
        repliedMessages: 0,
        archivedMessages: 0,
        clients: 0,
        activeClients: 0,
        pendingClients: 0,
        partners: 0,
        settings: 0,
      },
      systemStatus: {
        contentReadiness: 0,
        inboxHealth: 0,
        clientCoverage: 0,
      },
      recentActivity: [],
    };
  }

  await ensureClientsTable();

  const [projectCounts, postCounts, serviceCounts, messageCounts, clientCounts, clientStatusCounts, projectStatusCounts, postStatusCounts, messageStatusCounts, recentMessages, recentProjects, recentPosts, recentClients] = await Promise.all([
    safeQueryD1('SELECT COUNT(*) AS total FROM projects', [], [{ total: 0 }]),
    safeQueryD1('SELECT COUNT(*) AS total FROM posts', [], [{ total: 0 }], 'posts'),
    safeQueryD1('SELECT COUNT(*) AS total FROM services', [], [{ total: 0 }]),
    safeQueryD1('SELECT COUNT(*) AS total FROM messages', [], [{ total: 0 }]),
    safeQueryD1('SELECT COUNT(*) AS total FROM clients', [], [{ total: 0 }], 'clients'),
    safeQueryD1(
      `
        SELECT
          SUM(CASE WHEN LOWER(COALESCE(status, 'active')) = 'active' THEN 1 ELSE 0 END) AS active,
          SUM(CASE WHEN LOWER(COALESCE(status, 'active')) = 'pending' THEN 1 ELSE 0 END) AS pending,
          SUM(CASE WHEN LOWER(COALESCE(relationship, 'client')) = 'partner' THEN 1 ELSE 0 END) AS partners
        FROM clients
      `,
      [],
      [{ active: 0, pending: 0, partners: 0 }],
      'clients'
    ),
    safeQueryD1(
      `
        SELECT
          SUM(CASE WHEN LOWER(COALESCE(status, 'draft')) = 'published' THEN 1 ELSE 0 END) AS published,
          SUM(CASE WHEN LOWER(COALESCE(status, 'draft')) = 'in-review' THEN 1 ELSE 0 END) AS inReview,
          SUM(CASE WHEN LOWER(COALESCE(status, 'draft')) = 'draft' THEN 1 ELSE 0 END) AS drafts
        FROM projects
      `,
      [],
      [{ published: 0, inReview: 0, drafts: 0 }]
    ),
    safeQueryD1(
      `
        SELECT
          SUM(CASE WHEN LOWER(COALESCE(status, 'draft')) = 'published' THEN 1 ELSE 0 END) AS published,
          SUM(CASE WHEN LOWER(COALESCE(status, 'draft')) = 'draft' THEN 1 ELSE 0 END) AS drafts,
          SUM(CASE WHEN COALESCE(featured, 0) = 1 THEN 1 ELSE 0 END) AS featured
        FROM posts
      `,
      [],
      [{ published: 0, drafts: 0, featured: 0 }],
      'posts'
    ),
    safeQueryD1(
      `
        SELECT
          SUM(CASE WHEN LOWER(COALESCE(status, 'new')) = 'new' THEN 1 ELSE 0 END) AS unread,
          SUM(CASE WHEN LOWER(COALESCE(status, 'new')) = 'replied' THEN 1 ELSE 0 END) AS replied,
          SUM(CASE WHEN LOWER(COALESCE(status, 'new')) = 'archived' THEN 1 ELSE 0 END) AS archived
        FROM messages
      `,
      [],
      [{ unread: 0, replied: 0, archived: 0 }]
    ),
    safeQueryD1(
      `
        SELECT
          id,
          name,
          email,
          subject,
          message,
          status,
          created_at AS createdAt
        FROM messages
        ORDER BY created_at DESC
        LIMIT 4
      `,
      [],
      []
    ),
    safeQueryD1(
      `
        SELECT
          id,
          title,
          description,
          status,
          updated_at AS updatedAt
        FROM projects
        ORDER BY updated_at DESC
        LIMIT 4
      `,
      [],
      []
    ),
    safeQueryD1(
      `
        SELECT
          id,
          name,
          email,
          relationship,
          status,
          updated_at AS updatedAt,
          last_seen AS lastSeen
        FROM clients
        ORDER BY updated_at DESC
        LIMIT 4
      `,
      [],
      [],
      'clients'
    ),
    safeQueryD1(
      `
        SELECT
          id,
          title,
          excerpt,
          status,
          featured,
          updated_at AS updatedAt
        FROM posts
        ORDER BY featured DESC, updated_at DESC
        LIMIT 4
      `,
      [],
      [],
      'posts'
    ),
  ]);

  const projects = Number(projectCounts?.[0]?.total ?? 0);
  const posts = Number(postCounts?.[0]?.total ?? 0);
  const services = Number(serviceCounts?.[0]?.total ?? 0);
  const messages = Number(messageCounts?.[0]?.total ?? 0);
  const clients = Number(clientCounts?.[0]?.total ?? 0);
  const activeClients = Number(clientStatusCounts?.[0]?.active ?? 0);
  const pendingClients = Number(clientStatusCounts?.[0]?.pending ?? 0);
  const partners = Number(clientStatusCounts?.[0]?.partners ?? 0);
  const publishedProjects = Number(projectStatusCounts?.[0]?.published ?? 0);
  const inReviewProjects = Number(projectStatusCounts?.[0]?.inReview ?? 0);
  const draftProjects = Number(projectStatusCounts?.[0]?.drafts ?? 0);
  const publishedPosts = Number(postStatusCounts?.[0]?.published ?? 0);
  const draftPosts = Number(postStatusCounts?.[0]?.drafts ?? 0);
  const featuredPosts = Number(postStatusCounts?.[0]?.featured ?? 0);
  const unreadMessages = Number(messageStatusCounts?.[0]?.unread ?? 0);
  const repliedMessages = Number(messageStatusCounts?.[0]?.replied ?? 0);
  const archivedMessages = Number(messageStatusCounts?.[0]?.archived ?? 0);

  const recentActivity = [
    ...(Array.isArray(recentPosts) ? recentPosts.map((post) => ({
      type: 'Blog',
      title: post.featured ? `Featured post: ${post.title}` : `Blog post updated: ${post.title}`,
      detail: post.excerpt || 'Blog content refreshed.',
      time: post.updatedAt ? new Date(post.updatedAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'recently',
    })) : []),
    ...(Array.isArray(recentMessages) ? recentMessages.map((message) => ({
      type: 'Inbox',
      title: `Message from ${message.name}`,
      detail: message.subject || message.message.substring(0, 100) + (message.message.length > 100 ? '...' : ''),
      time: message.createdAt ? new Date(message.createdAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'recently',
    })) : []),
    ...(Array.isArray(recentProjects) ? recentProjects.map((project) => ({
      type: 'Project',
      title: `${project.title} updated`,
      detail: project.description || 'Project content refreshed.',
      time: project.updatedAt ? new Date(project.updatedAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'recently',
    })) : []),
    ...(Array.isArray(recentClients) ? recentClients.map((client) => ({
      type: 'Client',
      title: `${client.name} ${String(client.status || '').toLowerCase() === 'pending' ? 'needs review' : 'record updated'}`,
      detail: `${client.relationship || 'Client'} · ${client.email}`,
      time: client.updatedAt ? new Date(client.updatedAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'recently',
    })) : []),
  ].slice(0, 8);

  const contentPool = projects + posts;
  const publishedContent = publishedProjects + publishedPosts;
  const contentReadiness = contentPool > 0 ? Math.round((publishedContent / contentPool) * 100) : 0;
  const inboxHealth = messages > 0 ? Math.round((repliedMessages / messages) * 100) : 100;
  const clientCoverage = clients > 0 ? Math.round(Math.min(100, ((activeClients + partners) / clients) * 50)) : 0;

    return {
      source: 'd1',
      timestamp: new Date().toISOString(),
      summary: {
        projects,
        publishedProjects,
        inReviewProjects,
        draftProjects,
        posts,
        publishedPosts,
        draftPosts,
        featuredPosts,
        services,
        messages,
        unreadMessages,
        repliedMessages,
        archivedMessages,
        clients,
        activeClients,
        pendingClients,
        partners,
        settings: 1,
      },
      systemStatus: {
        contentReadiness,
        inboxHealth,
        clientCoverage,
      },
      recentActivity,
    };
}

export async function getAdminProjects() {
  if (!hasD1Config()) {
    const items = getSeedProjects().map((project, index) => ({
      id: project.id,
      title: project.title,
      client: project.description?.slice(0, 30) || 'Portfolio project',
      category: project.category || 'Web',
      description: project.description || '',
      status: project.status || 'published',
      progress: 100,
      updated: project.updatedAt || 'recently',
      thumb: project.thumb || '',
      featured: Boolean(project.featured),
      sortOrder: project.sortOrder ?? index,
    }));

    return {
      source: 'seed',
      summary: {
        total: items.length,
        published: items.length,
        inReview: 0,
        drafts: 0,
      },
      items,
    };
  }

  const rows = await safeQueryD1(
    `
      SELECT
        id,
        title,
        description,
        category,
        responsibilities,
        techStack,
        liveDemo,
        github,
        thumb,
        featured,
        status,
        sortOrder,
        updated_at AS updatedAt
      FROM projects
      ORDER BY featured DESC, sortOrder ASC, updated_at DESC
    `,
    [],
    [],
    'projects'
  );

  const items = Array.isArray(rows) && rows.length > 0
    ? rows.map((row, index) => ({
        id: row.id,
        title: row.title,
        client: row.description?.slice(0, 30) || 'Portfolio project',
        category: row.category || 'Web',
        description: row.description || '',
        responsibilities: parseProjectResponsibilities(row.responsibilities),
        techStack: parseProjectTechStack(row.techStack),
        status: row.status || 'draft',
        progress: row.status === 'published' ? 100 : row.status === 'in-review' ? 78 : 52,
        updated: row.updatedAt || 'recently',
        liveDemo: row.liveDemo || '',
        github: row.github || '',
        thumb: row.thumb || '',
        featured: Boolean(row.featured),
        sortOrder: row.sortOrder ?? index,
      }))
    : getSeedProjects().map((project, index) => ({
        id: project.id,
        title: project.title,
        client: project.description?.slice(0, 30) || 'Portfolio project',
        category: project.category || 'Web',
        description: project.description || '',
        responsibilities: project.responsibilities || [],
        techStack: project.techStack || [],
        status: project.status || 'published',
        progress: 100,
        updated: project.updatedAt || 'recently',
        liveDemo: project.liveDemo || '',
        github: project.github || '',
        thumb: project.thumb || '',
        featured: Boolean(project.featured),
        sortOrder: project.sortOrder ?? index,
      }));

  const total = items.length;
  const published = items.filter((item) => item.status === 'published').length;
  const inReview = items.filter((item) => item.status === 'in-review').length;
  const drafts = items.filter((item) => item.status === 'draft').length;

  return {
    source: 'd1',
    summary: {
      total,
      published,
      inReview,
      drafts,
    },
    items,
  };
}

export async function getPublicProjects() {
  if (!hasD1Config()) {
    const items = getSeedProjects();

    return {
      source: 'seed',
      items: items.filter((project) => String(project.status).toLowerCase() === 'published' || String(project.status).toLowerCase() === 'active' || !project.status),
    };
  }

  const rows = await safeQueryD1(
    `
      SELECT
        id,
        title,
        description,
        category,
        responsibilities,
        techStack,
        liveDemo,
        github,
        thumb,
        featured,
        status,
        sortOrder,
        updated_at AS updatedAt
      FROM projects
      WHERE status = 'published' OR status = 'active'
      ORDER BY featured DESC, sortOrder ASC, updated_at DESC
    `,
    [],
    [],
    'projects'
  );

  const items = Array.isArray(rows) && rows.length > 0
    ? rows.map((row, index) => {
        const title = row.title || `Project ${index + 1}`;
          const techStack = parseProjectTechStack(row.techStack);

        return {
          id: row.id,
          num: String(index + 1).padStart(2, '0'),
          title,
          category: row.category || 'Web',
          description: row.description || '',
          responsibilities: parseProjectResponsibilities(row.responsibilities),
          techStack,
          thumb: row.thumb || '',
          github: row.github || '',
          liveDemo: row.liveDemo || '',
          status: row.status || 'draft',
          featured: Boolean(row.featured),
          sortOrder: row.sortOrder ?? index,
          updatedAt: row.updatedAt,
          slug: String(title)
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, ''),
        };
      })
      : getSeedProjects().map((project, index) => {
          const title = project.title || `Project ${index + 1}`;
          return {
            id: project.id,
            num: String(index + 1).padStart(2, '0'),
            title,
            category: project.category || 'Web',
            description: project.description || '',
            responsibilities: project.responsibilities || [],
            techStack: project.techStack || [],
            thumb: project.thumb || '',
            github: project.github || '',
            liveDemo: project.liveDemo || '',
            status: project.status || 'published',
            featured: Boolean(project.featured),
            sortOrder: project.sortOrder ?? index,
            updatedAt: project.updatedAt,
            slug: String(title)
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, '-')
              .replace(/(^-|-$)/g, ''),
          };
        });

  return {
    source: 'd1',
    items,
  };
}

function normalizeProjectPayload(payload = {}) {
  return {
    title: payload.title ?? '',
    description: payload.description ?? '',
    category: payload.category ?? 'Web',
    responsibilities: normalizeProjectResponsibilitiesValue(payload.responsibilities ?? payload.responsibility ?? []),
    techStack: normalizeProjectTechStackValue(payload.techStack),
    liveDemo: payload.liveDemo ?? '',
    github: payload.github ?? '',
    thumb: payload.thumb ?? '',
    featured: Boolean(payload.featured),
    status: payload.status ?? 'draft',
    sortOrder: Number(payload.sortOrder ?? 0),
  };
}

async function ensureProjectsTable() {
  await queryD1(
    `
      CREATE TABLE IF NOT EXISTS projects (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT,
        category TEXT,
        responsibilities TEXT,
        techStack TEXT,
        liveDemo TEXT,
        github TEXT,
        thumb TEXT,
        featured INTEGER NOT NULL DEFAULT 0,
        status TEXT NOT NULL DEFAULT 'draft',
        sortOrder INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `
  );
}

export async function createAdminProject(payload) {
  if (!hasD1Config()) {
    return { source: 'd1', saved: false, reason: 'D1 not configured' };
  }

  await ensureProjectsTable();
  const project = normalizeProjectPayload(payload);

  await queryD1(
    `
      INSERT INTO projects (
        title,
        description,
        category,
        responsibilities,
        techStack,
        liveDemo,
        github,
        thumb,
        featured,
        status,
        sortOrder,
        updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `,
    [
      project.title,
      project.description,
      project.category,
      JSON.stringify(project.responsibilities ?? []),
      JSON.stringify(project.techStack ?? []),
      project.liveDemo,
      project.github,
      project.thumb,
      project.featured ? 1 : 0,
      project.status,
      project.sortOrder,
    ]
  );

  return { source: 'd1', saved: true };
}

export async function updateAdminProject(id, payload) {
  if (!hasD1Config()) {
    return { source: 'd1', saved: false, reason: 'D1 not configured' };
  }

  await ensureProjectsTable();
  const project = normalizeProjectPayload(payload);

  await queryD1(
    `
      UPDATE projects
      SET
        title = ?,
        description = ?,
        category = ?,
        responsibilities = ?,
        techStack = ?,
        liveDemo = ?,
        github = ?,
        thumb = ?,
        featured = ?,
        status = ?,
        sortOrder = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `,
    [
      project.title,
      project.description,
      project.category,
      JSON.stringify(project.responsibilities ?? []),
      JSON.stringify(project.techStack ?? []),
      project.liveDemo,
      project.github,
      project.thumb,
      project.featured ? 1 : 0,
      project.status,
      project.sortOrder,
      id,
    ]
  );

  return { source: 'd1', saved: true };
}


export async function deleteAdminProject(id) {
  if (!hasD1Config()) {
    return { source: 'd1', saved: false, reason: 'D1 not configured' };
  }

  await ensureProjectsTable();
  await queryD1('DELETE FROM projects WHERE id = ?', [id]);
  return { source: 'd1', saved: true };
}

export async function getAdminServices() {
  if (!hasD1Config()) {
    const items = getSeedServices();

    return {
      source: 'seed',
      summary: {
        ...buildServiceSummary(items),
        avgConversion: 14,
      },
      items,
    };
  }

  const rows = await queryD1(
    `
      SELECT
        id,
        title,
        description,
        tier,
        price,
        turnaround,
        status,
        sort_order AS sortOrder,
        updated_at AS updatedAt
      FROM services
      ORDER BY sort_order ASC, updated_at DESC
    `
  );

  const items = Array.isArray(rows) && rows.length > 0 ? rows.map(mapServiceRow) : getSeedServices();

  return {
    source: Array.isArray(rows) && rows.length > 0 ? 'd1' : 'seed',
    summary: {
      ...buildServiceSummary(items),
      avgConversion: 14,
    },
    items,
  };
}

export async function getPublicServices() {
  if (!hasD1Config()) {
    const items = getSeedServices().filter((service) => String(service.status).toLowerCase() === 'active');

    return {
      source: 'seed',
      items,
    };
  }

  const rows = await safeQueryD1(
    `
      SELECT
        id,
        title,
        description,
        tier,
        price,
        turnaround,
        status,
        sort_order AS sortOrder
      FROM services
      WHERE status = 'active'
      ORDER BY sort_order ASC, updated_at DESC
    `,
    [],
    []
  );

  const items = Array.isArray(rows) && rows.length > 0
    ? rows.map(mapServiceRow)
    : getSeedServices().filter((service) => String(service.status).toLowerCase() === 'active');

  return {
    source: Array.isArray(rows) && rows.length > 0 ? 'd1' : 'seed',
    items,
  };
}

export async function getAdminUsers() {
  if (!hasD1Config()) {
    return {
      source: 'seed',
      summary: {
        total: 0,
        active: 0,
        pending: 0,
        partners: 0,
      },
      items: [],
    };
  }
  

  await ensureClientsTable();

  const rows = await safeQueryD1(
    `
      SELECT
        id,
        name,
        email,
        relationship,
        company,
        phone,
        website,
        location,
        status,
        engagement,
        notes,
        completed_projects AS completedProjects,
        last_seen AS lastSeen,
        created_at AS createdAt,
        updated_at AS updatedAt
      FROM clients
      ORDER BY updated_at DESC
    `,
    [],
    [],
    'clients'
  );

  const items = Array.isArray(rows)
    ? rows.map((row) => ({
        id: row.id,
        name: row.name,
        email: row.email,
        relationship: row.relationship || 'client',
        company: row.company || '',
        phone: row.phone || '',
        website: row.website || '',
        location: row.location || '',
        status: row.status || 'active',
        engagement: row.engagement || 'standard',
        notes: row.notes || '',
        completedProjectIds: normalizeClientCompletedProjects(row.completedProjects),
        lastSeen: row.lastSeen || row.updatedAt || 'recently',
        createdAt: row.createdAt || row.updatedAt || null,
        updatedAt: row.updatedAt || null,
      }))
    : [];

  const total = items.length;
  const active = items.filter((client) => String(client.status).toLowerCase() === 'active').length;
  const pending = items.filter((client) => String(client.status).toLowerCase() === 'pending').length;
  const partners = items.filter((client) => String(client.relationship).toLowerCase() === 'partner').length;

  return {
    source: Array.isArray(rows) && rows.length > 0 ? 'd1' : 'seed',
    summary: { total, active, pending, partners },
    items,
  };
}

// Blog / posts admin helpers
export async function getAdminPosts(limit = 100) {
  if (!hasD1Config()) {
    return { source: 'seed', summary: { total: 0, published: 0, drafts: 0 }, items: [] };
  }

  await queryD1(
    `
      CREATE TABLE IF NOT EXISTS posts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        slug TEXT UNIQUE,
        excerpt TEXT,
        body TEXT,
        status TEXT NOT NULL DEFAULT 'draft',
        tags TEXT,
        thumb TEXT,
        featured INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `
  );

  const rows = await safeQueryD1(
    `
      SELECT
        id,
        title,
        slug,
        excerpt,
        body,
        status,
        tags,
        thumb,
        featured,
        created_at AS createdAt,
        updated_at AS updatedAt
      FROM posts
      ORDER BY featured DESC, updated_at DESC
      LIMIT ?
    `,
    [limit],
    [],
    'posts'
  );

  const items = Array.isArray(rows) ? rows.map((r) => ({
    id: r.id,
    title: r.title,
    slug: r.slug,
    excerpt: r.excerpt || '',
    body: r.body || '',
    status: r.status || 'draft',
    tags: parseBlogTags(r.tags),
    thumb: r.thumb || '',
    featured: Boolean(r.featured),
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
  })) : [];

  const total = items.length;
  const published = items.filter((it) => String(it.status).toLowerCase() === 'published').length;
  const drafts = items.filter((it) => String(it.status).toLowerCase() === 'draft').length;

  return { source: 'd1', summary: { total, published, drafts }, items };
}

export async function getAdminPost(id) {
  if (!hasD1Config()) return { source: 'd1', item: null };

  const rows = await safeQueryD1(
    `SELECT id, title, slug, excerpt, body, status, tags, thumb, featured, created_at AS createdAt, updated_at AS updatedAt FROM posts WHERE id = ? LIMIT 1`,
    [id],
    [],
    'posts'
  );

  const row = Array.isArray(rows) && rows.length > 0 ? rows[0] : null;
  if (!row) return { source: 'd1', item: null };

  return { source: 'd1', item: {
    id: row.id,
    title: row.title,
    slug: row.slug,
    excerpt: row.excerpt || '',
    body: row.body || '',
    status: row.status || 'draft',
    tags: parseBlogTags(row.tags),
    thumb: row.thumb || '',
    featured: Boolean(row.featured),
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  } };
}

export async function createAdminPost(payload) {
  if (!hasD1Config()) return { source: 'd1', saved: false, reason: 'D1 not configured' };

  const title = payload?.title || '';
  const slug = payload?.slug || String(title).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const excerpt = payload?.excerpt || '';
  const body = payload?.body || '';
  const status = payload?.status || 'draft';
  const tags = Array.isArray(payload?.tags) ? JSON.stringify(payload.tags) : JSON.stringify([]);
  const thumb = payload?.thumb || '';
  const featured = payload?.featured ? 1 : 0;

  await queryD1(
    `INSERT INTO posts (title, slug, excerpt, body, status, tags, thumb, featured, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
    [title, slug, excerpt, body, status, tags, thumb, featured]
  );

  return { source: 'd1', saved: true };
}

export async function updateAdminPost(id, payload) {
  if (!hasD1Config()) return { source: 'd1', saved: false, reason: 'D1 not configured' };

  const title = payload?.title || '';
  const slug = payload?.slug || String(title).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const excerpt = payload?.excerpt || '';
  const body = payload?.body || '';
  const status = payload?.status || 'draft';
  const tags = Array.isArray(payload?.tags) ? JSON.stringify(payload.tags) : JSON.stringify([]);
  const thumb = payload?.thumb || '';
  const featured = payload?.featured ? 1 : 0;

  await queryD1(
    `UPDATE posts SET title = ?, slug = ?, excerpt = ?, body = ?, status = ?, tags = ?, thumb = ?, featured = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
    [title, slug, excerpt, body, status, tags, thumb, featured, id]
  );

  return { source: 'd1', saved: true };
}

export async function deleteAdminPost(id) {
  if (!hasD1Config()) return { source: 'd1', deleted: false, reason: 'D1 not configured' };

  await safeQueryD1('DELETE FROM posts WHERE id = ?', [id], [], 'posts');
  return { source: 'd1', deleted: true };
}

export async function getPublicPosts(limit = 100) {
  if (!hasD1Config()) {
    return { source: 'seed', items: [] };
  }

  await queryD1(
    `
      CREATE TABLE IF NOT EXISTS posts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        slug TEXT UNIQUE,
        excerpt TEXT,
        body TEXT,
        status TEXT NOT NULL DEFAULT 'draft',
        tags TEXT,
        thumb TEXT,
        featured INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `
  );

  const rows = await safeQueryD1(
    `
      SELECT
        id,
        title,
        slug,
        excerpt,
        body,
        status,
        tags,
        thumb,
        featured,
        created_at AS createdAt,
        updated_at AS updatedAt
      FROM posts
      WHERE LOWER(COALESCE(status, 'draft')) = 'published'
      ORDER BY featured DESC, updated_at DESC
      LIMIT ?
    `,
    [limit],
    [],
    'posts'
  );

  const items = Array.isArray(rows)
    ? rows.map((row) => ({
        id: row.id,
        title: row.title,
        slug: row.slug,
        excerpt: row.excerpt || '',
        body: row.body || '',
        status: row.status || 'published',
        tags: parseBlogTags(row.tags),
        thumb: row.thumb || '',
        featured: Boolean(row.featured),
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
      }))
    : [];

  return { source: 'd1', items };
}

async function ensureClientsTable() {
  await queryD1(`
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
    )
  `);

  try {
    await queryD1(`ALTER TABLE clients ADD COLUMN completed_projects TEXT NOT NULL DEFAULT '[]'`);
  } catch (error) {
    const message = String(error?.message || '').toLowerCase();
    if (!message.includes('duplicate column name')) {
      throw error;
    }
  }
}

function normalizeClientCompletedProjects(value) {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }

  const raw = String(value ?? '').trim();
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.map((item) => String(item).trim()).filter(Boolean);
    }
  } catch {
    // Fall through to comma-separated parsing.
  }

  return raw
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function normalizeClientPayload(payload = {}) {
  return {
    name: payload.name ?? '',
    email: payload.email ?? '',
    relationship: String(payload.relationship ?? 'client').toLowerCase(),
    company: payload.company ?? '',
    phone: payload.phone ?? '',
    website: payload.website ?? '',
    location: payload.location ?? '',
    status: String(payload.status ?? 'active').toLowerCase(),
    engagement: payload.engagement ?? 'standard',
    notes: payload.notes ?? '',
    completedProjectIds: normalizeClientCompletedProjects(payload.completedProjectIds ?? payload.completedProjects),
    lastSeen: payload.lastSeen ?? payload.last_seen ?? '',
  };
}

export async function createAdminClient(payload) {
  if (!hasD1Config()) {
    return { source: 'd1', saved: false, reason: 'D1 not configured' };
  }

  await ensureClientsTable();
  const client = normalizeClientPayload(payload);

  await queryD1(
    `
      INSERT INTO clients (
        name,
        email,
        relationship,
        company,
        phone,
        website,
        location,
        status,
        engagement,
        notes,
        completed_projects,
        last_seen,
        updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `,
    [
      client.name,
      client.email,
      client.relationship,
      client.company,
      client.phone,
      client.website,
      client.location,
      client.status,
      client.engagement,
      client.notes,
      JSON.stringify(client.completedProjectIds ?? []),
      client.lastSeen,
    ]
  );

  return { source: 'd1', saved: true };
}

export async function updateAdminClient(id, payload) {
  if (!hasD1Config()) {
    return { source: 'd1', saved: false, reason: 'D1 not configured' };
  }

  await ensureClientsTable();
  const client = normalizeClientPayload(payload);

  await queryD1(
    `
      UPDATE clients
      SET
        name = ?,
        email = ?,
        relationship = ?,
        company = ?,
        phone = ?,
        website = ?,
        location = ?,
        status = ?,
        engagement = ?,
        notes = ?,
        completed_projects = ?,
        last_seen = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `,
    [
      client.name,
      client.email,
      client.relationship,
      client.company,
      client.phone,
      client.website,
      client.location,
      client.status,
      client.engagement,
      client.notes,
      JSON.stringify(client.completedProjectIds ?? []),
      client.lastSeen,
      id,
    ]
  );

  return { source: 'd1', saved: true };
}

export async function deleteAdminClient(id) {
  if (!hasD1Config()) {
    return { source: 'd1', saved: false, reason: 'D1 not configured' };
  }

  await ensureClientsTable();
  await queryD1('DELETE FROM clients WHERE id = ?', [id]);
  return { source: 'd1', saved: true };
}

function normalizeServicePayload(payload = {}) {
  return {
    title: payload.title ?? '',
    description: payload.description ?? '',
    tier: payload.tier ?? 'Core',
    price: payload.price ?? '',
    turnaround: payload.turnaround ?? '',
    status: payload.status ?? 'draft',
    sortOrder: Number(payload.sortOrder ?? payload.sort_order ?? 0),
  };
}

export async function createAdminService(payload) {
  if (!hasD1Config()) {
    return { source: 'd1', saved: false, reason: 'D1 not configured' };
  }

  const service = normalizeServicePayload(payload);

  await queryD1(
    `
      INSERT INTO services (
        title,
        description,
        tier,
        price,
        turnaround,
        status,
        sort_order,
        updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `,
    [
      service.title,
      service.description,
      service.tier,
      service.price,
      service.turnaround,
      service.status,
      service.sortOrder,
    ]
  );

  return { source: 'd1', saved: true };
}

export async function updateAdminService(id, payload) {
  if (!hasD1Config()) {
    return { source: 'd1', saved: false, reason: 'D1 not configured' };
  }

  const service = normalizeServicePayload(payload);

  await queryD1(
    `
      UPDATE services
      SET
        title = ?,
        description = ?,
        tier = ?,
        price = ?,
        turnaround = ?,
        status = ?,
        sort_order = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `,
    [
      service.title,
      service.description,
      service.tier,
      service.price,
      service.turnaround,
      service.status,
      service.sortOrder,
      id,
    ]
  );

  return { source: 'd1', saved: true };
}

export async function deleteAdminService(id) {
  if (!hasD1Config()) {
    return { source: 'd1', saved: false, reason: 'D1 not configured' };
  }

  await queryD1('DELETE FROM services WHERE id = ?', [id]);
  return { source: 'd1', saved: true };
}

export async function getAdminStats() {
  if (!hasD1Config()) {
    return {
      source: 'd1',
      metricCards: [
        { label: 'Page Views', value: '0', delta: '0%', tone: 'emerald' },
        { label: 'Inbound Leads', value: '0', delta: '0%', tone: 'sky' },
        { label: 'Conversion Rate', value: '0%', delta: '0%', tone: 'violet' },
        { label: 'Bounce Rate', value: '0%', delta: '0%', tone: 'amber' },
      ],
      traffic: [],
      highlights: [],
      goals: [],
    };
  }

  const [projectCounts, serviceCounts, messageCounts] = await Promise.all([
    queryD1('SELECT COUNT(*) AS total FROM projects'),
    queryD1('SELECT COUNT(*) AS total FROM services'),
    queryD1('SELECT COUNT(*) AS total FROM messages'),
  ]);

  const projects = Number(projectCounts?.[0]?.total ?? 0);
  const services = Number(serviceCounts?.[0]?.total ?? 0);
  const messages = Number(messageCounts?.[0]?.total ?? 0);

  return {
    source: 'd1',
    metricCards: [
      { label: 'Page Views', value: `${projects * 10 + services * 6}k`, delta: '+18%', tone: 'emerald' },
      { label: 'Inbound Leads', value: `${messages * 4 + 196}`, delta: '+11%', tone: 'sky' },
      { label: 'Conversion Rate', value: `${Math.min(12, 5 + projects)}%`, delta: '+1.2%', tone: 'violet' },
      { label: 'Bounce Rate', value: `${Math.max(18, 34 - services)}%`, delta: '-4%', tone: 'amber' },
    ],
    traffic: [
      { channel: 'Direct', value: '38%', bar: 'w-[38%]' },
      { channel: 'Search', value: '27%', bar: 'w-[27%]' },
      { channel: 'Social', value: '19%', bar: 'w-[19%]' },
      { channel: 'Referral', value: '16%', bar: 'w-[16%]' },
    ],
    highlights: [
      { title: 'Top Performing Page', detail: 'Home page is driving the most engagement this week.' },
      { title: 'Best Lead Source', detail: 'Direct traffic converts better than social campaigns.' },
      { title: 'System Health', detail: 'All public routes are loading within expected thresholds.' },
    ],
    goals: [
      { label: 'Monthly Leads Goal', current: messages * 4 + 196, target: 250, percent: 78, tone: 'emerald' },
      { label: 'Content Completion', current: 92, target: 100, percent: 92, tone: 'sky' },
    ],
  };
}

async function readSettingsRows() {
  try {
    await queryD1(
      `
        CREATE TABLE IF NOT EXISTS settings (
          key TEXT PRIMARY KEY,
          value TEXT,
          updated_at TEXT
        )
      `
    );
  } catch (e) {
    // ignore create errors
  }

  return safeQueryD1('SELECT key, value FROM settings', [], [], 'settings');
}

function parseSettingValue(value) {
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

function parseBlogTags(value) {
  if (Array.isArray(value)) {
    return value.map((tag) => String(tag).trim()).filter(Boolean);
  }

  const raw = String(value ?? '').trim();
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.map((tag) => String(tag).trim()).filter(Boolean);
    }
  } catch {
    // Fall through to comma parsing.
  }

  return raw
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean);
}

export async function getAdminSettings() {
  if (!hasD1Config()) {
    return {
      source: 'd1',
      profile: {
        siteTitle: '',
        metaDescription: '',
        logoUrl: '',
        accentColor: '',
      },
      notifications: {
        contactSubmissions: false,
        projectChanges: false,
        weeklyDigest: false,
        securityAlerts: false,
      },
      security: {
        maintenanceMode: false,
        publicContactForm: false,
        portfolioVisibility: '',
        backupFrequency: '',
      },
      actionLog: [],
    };
  }

  const rows = await readSettingsRows();
  const settings = Object.fromEntries(
    (Array.isArray(rows) ? rows : []).map((row) => [row.key, parseSettingValue(row.value)])
  );

  return {
    source: 'd1',
    profile: {
      siteTitle: settings.siteTitle ?? 'Sazedul Islam - Backend Software Engineer',
      metaDescription: settings.metaDescription ?? 'Backend engineer portfolio and admin control panel.',
      logoUrl: settings.logoUrl ?? '/Sazedul Islam.jpg',
      accentColor: settings.accentColor ?? '#0f172a',
    },
    notifications: {
      contactSubmissions: Boolean(settings.contactSubmissions ?? true),
      projectChanges: Boolean(settings.projectChanges ?? true),
      weeklyDigest: Boolean(settings.weeklyDigest ?? true),
      securityAlerts: Boolean(settings.securityAlerts ?? true),
    },
    security: {
      maintenanceMode: Boolean(settings.maintenanceMode ?? false),
      publicContactForm: Boolean(settings.publicContactForm ?? true),
      portfolioVisibility: settings.portfolioVisibility ?? 'public',
      backupFrequency: settings.backupFrequency ?? 'daily',
    },
    actionLog: settings.actionLog ?? ['Settings loaded from D1'],
  };
}

export async function saveAdminSettings(payload) {
  if (!hasD1Config()) {
    return { source: 'd1', saved: false, reason: 'D1 not configured' };
  }
  // Read existing settings to preserve/append the action log
  const existingRows = await readSettingsRows();
  const existing = Object.fromEntries((Array.isArray(existingRows) ? existingRows : []).map((r) => [r.key, parseSettingValue(r.value)]));

  const prevActionLog = Array.isArray(existing.actionLog)
    ? existing.actionLog
    : typeof existing.actionLog === 'string'
    ? (() => {
        try { return JSON.parse(existing.actionLog); } catch { return []; }
      })()
    : [];

  const newEntry = `Settings updated from admin dashboard ${new Date().toISOString()}`;
  const actionLogArray = [newEntry, ...prevActionLog].slice(0, 50);

  const entries = [
    ['siteTitle', payload?.profile?.siteTitle ?? 'Sazedul Islam - Backend Software Engineer'],
    ['metaDescription', payload?.profile?.metaDescription ?? 'Backend engineer portfolio and admin control panel.'],
    ['logoUrl', payload?.profile?.logoUrl ?? '/Sazedul Islam.jpg'],
    ['accentColor', payload?.profile?.accentColor ?? '#0f172a'],
    ['contactSubmissions', payload?.notifications?.contactSubmissions ?? true],
    ['projectChanges', payload?.notifications?.projectChanges ?? true],
    ['weeklyDigest', payload?.notifications?.weeklyDigest ?? true],
    ['securityAlerts', payload?.notifications?.securityAlerts ?? true],
    ['maintenanceMode', payload?.security?.maintenanceMode ?? false],
    ['publicContactForm', payload?.security?.publicContactForm ?? true],
    ['portfolioVisibility', payload?.security?.portfolioVisibility ?? 'public'],
    ['backupFrequency', payload?.security?.backupFrequency ?? 'daily'],
    ['actionLog', JSON.stringify(actionLogArray)],
  ];

  await Promise.all(
    entries.map(([key, value]) =>
      queryD1(
        `
          INSERT INTO settings (key, value, updated_at)
          VALUES (?, ?, CURRENT_TIMESTAMP)
          ON CONFLICT(key) DO UPDATE SET
            value = excluded.value,
            updated_at = CURRENT_TIMESTAMP
        `,
        [key, typeof value === 'string' ? value : JSON.stringify(value)]
      )
    )
  );

  return { source: 'd1', saved: true };
}

export async function getAdminMessages(limit = 10) {
  if (!hasD1Config()) {
    return {
      source: 'd1',
      items: [],
    };
  }

  const rows = await safeQueryD1(
    `
      SELECT
        id,
        name,
        email,
        subject,
        message,
        status,
        created_at AS createdAt
      FROM messages
      ORDER BY created_at DESC
      LIMIT ?
    `,
    [limit],
    []
  );

  const items = Array.isArray(rows)
    ? rows.map((row) => ({
        id: row.id,
        name: row.name,
        email: row.email,
        subject: row.subject || 'No subject',
        message: row.message,
        status: row.status || 'new',
        createdAt: row.createdAt,
      }))
    : [];

  return {
    source: 'd1',
    items,
  };
}

export async function createAdminMessage(payload) {
  if (!hasD1Config()) {
    return { source: 'd1', saved: false, reason: 'D1 not configured' };
  }

  const { name, email, subject, message, service, phone } = payload;

  try {
    await queryD1(
      `
        CREATE TABLE IF NOT EXISTS messages (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          email TEXT NOT NULL,
          subject TEXT,
          message TEXT NOT NULL,
          status TEXT NOT NULL DEFAULT 'new',
          created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
        )
      `
    );

    const messagesTable = await safeQueryD1(
      `
        SELECT name
        FROM sqlite_master
        WHERE type = 'table' AND name = 'messages'
        LIMIT 1
      `,
      [],
      []
    );

    if (!Array.isArray(messagesTable) || messagesTable.length === 0) {
      return { source: 'd1', saved: false, reason: 'messages table missing' };
    }

    await queryD1(
      `
        INSERT INTO messages (
          name,
          email,
          subject,
          message,
          status,
          created_at,
          updated_at
        ) VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `,
      [
        name || 'Anonymous',
        email || '',
        subject || `Service inquiry: ${service || 'General'}`,
        `${message}\n\n---\nPhone: ${phone || 'Not provided'}\nService: ${service || 'General'}`,
        'new',
      ]
    );

    return { source: 'd1', saved: true };
  } catch (error) {
    return { source: 'd1', saved: false, reason: error?.message || 'D1 unavailable' };
  }
}

export async function updateMessageStatus(id, status) {
  if (!hasD1Config()) {
    return { source: 'd1', saved: false, reason: 'D1 not configured' };
  }

  await safeQueryD1(
    `
      UPDATE messages
      SET status = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `,
    [status, id],
    []
  );

  return { source: 'd1', saved: true };
}

export async function deleteMessage(id) {
  if (!hasD1Config()) {
    return { source: 'd1', saved: false, reason: 'D1 not configured' };
  }

  await safeQueryD1('DELETE FROM messages WHERE id = ?', [id], []);
  return { source: 'd1', saved: true };
}
