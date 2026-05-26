"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

const emptyClientForm = {
  name: "",
  email: "",
  relationship: "client",
  company: "",
  phone: "",
  website: "",
  location: "",
  status: "active",
  engagement: "standard",
  notes: "",
  completedProjectIds: [],
  lastSeen: "",
};

function normalizeClientStatus(status) {
  return String(status ?? "").toLowerCase();
}

function normalizeClientRelationship(relationship) {
  return String(relationship ?? "client").toLowerCase();
}

function normalizeClientEngagement(engagement) {
  return String(engagement ?? "standard").toLowerCase();
}

function getClientStatusLabel(status) {
  const normalized = normalizeClientStatus(status);
  if (normalized === "active") {
    return "Active";
  }
  if (normalized === "pending") {
    return "Pending";
  }
  return "Inactive";
}

function getClientStatusClasses(status) {
  const normalized = normalizeClientStatus(status);
  if (normalized === "active") {
    return "bg-emerald-50 text-emerald-700";
  }
  if (normalized === "pending") {
    return "bg-amber-50 text-amber-700";
  }
  return "bg-slate-100 text-slate-600";
}

function getRelationshipLabel(relationship) {
  const normalized = normalizeClientRelationship(relationship);
  if (normalized === "partner") {
    return "Partner";
  }
  if (normalized === "other") {
    return "Other";
  }
  return "Client";
}

function getRelationshipClasses(relationship) {
  const normalized = normalizeClientRelationship(relationship);
  if (normalized === "partner") {
    return "bg-violet-50 text-violet-700";
  }
  if (normalized === "other") {
    return "bg-slate-100 text-slate-600";
  }
  return "bg-slate-900 text-white";
}

function getEngagementLabel(engagement) {
  const normalized = normalizeClientEngagement(engagement);
  if (normalized === "enterprise") {
    return "Enterprise";
  }
  if (normalized === "premium") {
    return "Premium";
  }
  if (normalized === "basic") {
    return "Basic";
  }
  return "Standard";
}

function getEngagementClasses(engagement) {
  const normalized = normalizeClientEngagement(engagement);
  if (normalized === "enterprise") {
    return "bg-violet-50 text-violet-700";
  }
  if (normalized === "premium") {
    return "bg-cyan-50 text-cyan-700";
  }
  if (normalized === "basic") {
    return "bg-slate-100 text-slate-600";
  }
  return "bg-indigo-50 text-indigo-700";
}

function buildClientForm(client) {
  const rawLastSeen = client?.lastSeen ?? client?.last_seen ?? "";
  const rawCompletedProjects =
    client?.completedProjectIds ?? client?.completedProjects ?? [];

  return {
    name: client?.name ?? "",
    email: client?.email ?? "",
    relationship: normalizeClientRelationship(client?.relationship) || "client",
    company: client?.company ?? "",
    phone: client?.phone ?? "",
    website: client?.website ?? "",
    location: client?.location ?? "",
    status: normalizeClientStatus(client?.status) || "active",
    engagement: normalizeClientEngagement(client?.engagement) || "standard",
    notes: client?.notes ?? "",
    completedProjectIds: normalizeCompletedProjectIds(rawCompletedProjects),
    lastSeen: formatDateForInput(rawLastSeen),
  };
}

function normalizeCompletedProjectIds(value) {
  if (Array.isArray(value)) {
    return value.map((item) => String(item)).filter(Boolean);
  }

  const raw = String(value ?? "").trim();
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.map((item) => String(item)).filter(Boolean);
    }
  } catch {
    // Fall through to comma parsing.
  }

  return raw
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function formatClientTime(value) {
  if (!value) {
    return "recently";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();

  if (diffMs < 0) {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  const dayMs = 24 * 60 * 60 * 1000;
  const diffDays = Math.floor(diffMs / dayMs);

  if (diffDays === 0) {
    return "today";
  }

  if (diffDays === 1) {
    return "1 day ago";
  }

  if (diffDays < 7) {
    return `${diffDays} days ago`;
  }

  if (diffDays < 35) {
    const weeks = Math.floor(diffDays / 7);
    return `${weeks} week${weeks > 1 ? "s" : ""} ago`;
  }

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatDateForInput(value) {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export default function Users() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editorMode, setEditorMode] = useState("add");
  const [editorOpen, setEditorOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [relationshipFilter, setRelationshipFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [form, setForm] = useState(emptyClientForm);
  const [projectOptions, setProjectOptions] = useState([]);
  const [toast, setToast] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState(null);

  useEffect(() => {
    let active = true;

    async function loadClients() {
      try {
        setLoading(true);
        setError("");

        const [clientsResponse, projectsResponse] = await Promise.all([
          fetch("/api/admin/users", {
            cache: "no-store",
          }),
          fetch("/api/admin/projects", {
            cache: "no-store",
          }),
        ]);

        const clientsPayload = await clientsResponse.json();
        const projectsPayload = await projectsResponse.json();

        if (!clientsResponse.ok) {
          throw new Error(clientsPayload?.error || "Failed to load clients");
        }

        if (!projectsResponse.ok) {
          throw new Error(projectsPayload?.error || "Failed to load projects");
        }

        if (active) {
          setData(clientsPayload);
          setProjectOptions(projectsPayload?.items ?? []);
        }
      } catch (fetchError) {
        if (active) {
          setError(
            fetchError instanceof Error
              ? fetchError.message
              : "Failed to load clients",
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadClients();

    return () => {
      active = false;
    };
  }, []);

  const clients = useMemo(() => data?.items ?? [], [data]);
  const filteredClients = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    return clients.filter((client) => {
      const matchesTerm =
        !term ||
        [
          client.name,
          client.email,
          client.company,
          client.location,
          client.relationship,
          client.engagement,
          client.notes,
        ]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(term));

      const matchesRelationship =
        relationshipFilter === "all" ||
        normalizeClientRelationship(client.relationship) === relationshipFilter;

      const matchesStatus =
        statusFilter === "all" ||
        normalizeClientStatus(client.status) === statusFilter;

      return matchesTerm && matchesRelationship && matchesStatus;
    });
  }, [clients, searchTerm, relationshipFilter, statusFilter]);

  const selectedClient = useMemo(
    () =>
      clients.find((client) => String(client.id) === String(editingId)) ??
      null,
    [clients, editingId],
  );

  const completedProjectOptions = useMemo(
    () =>
      projectOptions.filter(
        (project) =>
          normalizeClientStatus(project.status) === "published" ||
          Number(project.progress ?? 0) >= 100,
      ),
    [projectOptions],
  );

  const selectedCompletedProjects = useMemo(() => {
    if (!selectedClient) {
      return [];
    }

    const selectedIds = normalizeCompletedProjectIds(
      selectedClient.completedProjectIds,
    );

    return completedProjectOptions.filter((project) =>
      selectedIds.includes(String(project.id)),
    );
  }, [selectedClient, completedProjectOptions]);

  const formCompletedProjectIds = useMemo(
    () => normalizeCompletedProjectIds(form.completedProjectIds),
    [form.completedProjectIds],
  );

  const modalRoot = typeof document !== "undefined" ? document.body : null;

  function showToast(message, variant = "success") {
    setToast({ id: Date.now(), message, variant });
  }

  useEffect(() => {
    if (!toast) return undefined;

    const timeoutId = window.setTimeout(() => {
      setToast(null);
    }, 3000);

    return () => window.clearTimeout(timeoutId);
  }, [toast]);

  useEffect(() => {
    if (!filteredClients.length) {
      setEditingId(null);
      return;
    }

    const stillVisible = filteredClients.some(
      (client) => String(client.id) === String(editingId),
    );

    if (!stillVisible) {
      setEditingId(filteredClients[0]?.id ?? null);
    }
  }, [filteredClients, editingId]);

  const metrics = [
    {
      label: "Total Clients",
      value: loading ? "..." : String(data?.summary?.total ?? 0),
      note: data?.source === "d1" ? "Live from D1" : "Local fallback",
    },
    {
      label: "Active",
      value: loading ? "..." : String(data?.summary?.active ?? 0),
      note: "Currently engaged",
    },
    {
      label: "Pending",
      value: loading ? "..." : String(data?.summary?.pending ?? 0),
      note: "Needs admin review",
    },
    {
      label: "Partners",
      value: loading ? "..." : String(data?.summary?.partners ?? 0),
      note: "Working relationships",
    },
  ];

  function handleFieldChange(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function toggleCompletedProject(projectId) {
    setForm((current) => {
      const currentIds = normalizeCompletedProjectIds(current.completedProjectIds);
      const nextId = String(projectId);
      const exists = currentIds.includes(nextId);

      return {
        ...current,
        completedProjectIds: exists
          ? currentIds.filter((id) => id !== nextId)
          : [...currentIds, nextId],
      };
    });
  }

  function openCreateClient() {
    setEditingId(null);
    setEditorMode("add");
    setForm(emptyClientForm);
    setEditorOpen(true);
  }

  function openEditClient(client) {
    setEditingId(client.id);
    setEditorMode("edit");
    setForm(buildClientForm(client));
    setEditorOpen(true);
  }

  function handleEditorOpenChange(nextOpen) {
    setEditorOpen(nextOpen);
    if (!nextOpen) {
      setEditingId(null);
      setEditorMode("add");
    }
  }

  function openDeleteClientModal(client) {
    setClientToDelete(client);
    setIsDeleteModalOpen(true);
  }

  async function refreshClients() {
    const response = await fetch("/api/admin/users", { cache: "no-store" });
    const payload = await response.json();
    if (!response.ok) {
      throw new Error(payload?.error || "Failed to reload clients");
    }
    setData(payload);
  }

  async function handleSaveClient(event) {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");

      const endpoint = editingId ? `/api/admin/users/${editingId}` : "/api/admin/users";
      const method = editingId ? "PATCH" : "POST";

      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload?.error || "Failed to save client");
      }

      setEditorOpen(false);
      setEditingId(null);
      await refreshClients();
      showToast(
        editorMode === "edit"
          ? `Client updated to ${getClientStatusLabel(form.status)}.`
          : `Client created as ${getClientStatusLabel(form.status)}.`,
        "success",
      );
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Failed to save client",
      );
    } finally {
      setSaving(false);
    }
  }

  async function deleteSelectedClient(id) {
    try {
      setSaving(true);
      setError("");

      const response = await fetch(`/api/admin/users/${id}`, {
        method: "DELETE",
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload?.error || "Failed to delete client");
      }

      if (String(editingId) === String(id)) {
        setEditorOpen(false);
        setEditingId(null);
      }

      await refreshClients();
      showToast("Client deleted.", "success");
      setIsDeleteModalOpen(false);
      setClientToDelete(null);
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : "Failed to delete client",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="space-y-6">
      {toast ? (
        <div className="fixed left-1/2 top-5 z-50 w-[min(92vw,28rem)] -translate-x-1/2">
          <div
            className={`rounded-2xl border px-4 py-3 text-sm shadow-2xl backdrop-blur ${
              toast.variant === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                : toast.variant === "error"
                  ? "border-rose-200 bg-rose-50 text-rose-800"
                  : "border-slate-200 bg-white text-slate-800"
            }`}
          >
            {toast.message}
          </div>
        </div>
      ) : null}

      <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 p-6 text-white shadow-lg">
        <p className="text-xs uppercase tracking-[0.24em] text-slate-300">
          Client Relationship Studio
        </p>
        <div className="mt-2 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-3xl font-semibold">Client Management</h2>
            <p className="mt-2 max-w-2xl text-sm text-slate-200">
              Manage clients, partners, and collaborators from one admin-only record system.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={openCreateClient}
              className="rounded-xl bg-white px-4 py-2 text-sm font-medium text-slate-900 transition hover:bg-slate-100"
            >
              Add Client
            </button>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <article
            key={metric.label}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <p className="text-sm text-slate-500">{metric.label}</p>
            <p className="mt-2 text-3xl font-semibold text-slate-900">
              {metric.value}
            </p>
            <p className="mt-1 text-xs text-slate-400">{metric.note}</p>
          </article>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.6fr_0.9fr]">
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Client Directory</h3>
              <p className="mt-1 text-sm text-slate-500">
                Filter clients by relationship and status, then open any record to view full details.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <input
                type="text"
                placeholder="Search clients"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="min-w-[220px] rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm outline-none transition placeholder:text-slate-400 focus:border-slate-300 focus:bg-white"
              />
              <select
                value={relationshipFilter}
                onChange={(e) => setRelationshipFilter(e.target.value)}
                className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-700 outline-none transition focus:border-slate-300 focus:bg-white"
              >
                <option value="all">All Relationships</option>
                <option value="client">Client</option>
                <option value="partner">Partner</option>
                <option value="other">Other</option>
              </select>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-700 outline-none transition focus:border-slate-300 focus:bg-white"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          {error ? (
            <div className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
              {error}
            </div>
          ) : null}

          <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200">
            <div className="grid grid-cols-[1.5fr_0.9fr_0.8fr_1fr_0.9fr_0.8fr] gap-4 border-b border-slate-200 bg-slate-50 px-4 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              <span>Client</span>
              <span>Relationship</span>
              <span>Status</span>
              <span>Company</span>
              <span>Last Seen</span>
              <span>Actions</span>
            </div>

            <div className="divide-y divide-slate-100">
              {loading ? (
                <div className="px-4 py-6 text-sm text-slate-500">
                  Loading clients...
                </div>
              ) : filteredClients.length > 0 ? (
                filteredClients.map((client) => (
                  <div
                    key={client.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => setEditingId(client.id)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        setEditingId(client.id);
                      }
                    }}
                    className="grid cursor-pointer grid-cols-[1.5fr_0.9fr_0.8fr_1fr_0.9fr_0.8fr] gap-4 px-4 py-4 text-sm text-slate-700 transition hover:bg-slate-50"
                  >
                    <div>
                      <p className="font-medium text-slate-900">{client.name}</p>
                      <p className="mt-1 text-xs text-slate-500">{client.email}</p>
                    </div>

                    <div className="flex items-center">
                      <span className={`rounded-full px-3 py-1 text-xs font-medium ${getRelationshipClasses(client.relationship)}`}>
                        {getRelationshipLabel(client.relationship)}
                      </span>
                    </div>

                    <div className="flex items-center">
                      <span className={`rounded-full px-3 py-1 text-xs font-medium ${getClientStatusClasses(client.status)}`}>
                        {getClientStatusLabel(client.status)}
                      </span>
                    </div>

                    <div className="flex items-center text-slate-600">
                      {client.company || "—"}
                    </div>

                    <div className="flex items-center text-slate-500">
                      {formatClientTime(client.lastSeen)}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          openEditClient(client);
                        }}
                        className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-100"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          openDeleteClientModal(client);
                        }}
                        disabled={saving}
                        className="rounded-full border border-rose-200 px-3 py-1.5 text-xs font-medium text-rose-700 transition hover:bg-rose-50 disabled:opacity-60"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="px-4 py-6 text-sm text-slate-500">
                  No clients found yet.
                </div>
              )}
            </div>
          </div>
        </article>

        <aside className="space-y-6">
          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900">Selected Client</h3>
            {selectedClient ? (
              <div className="mt-4 rounded-2xl bg-slate-50 p-4">
                <p className="text-sm font-medium text-slate-900">{selectedClient.name}</p>
                <p className="mt-1 text-sm text-slate-500">{selectedClient.email}</p>

                <div className="mt-4 flex flex-wrap gap-2">
                  <span className={`rounded-full px-3 py-1 text-xs font-medium ${getRelationshipClasses(selectedClient.relationship)}`}>
                    {getRelationshipLabel(selectedClient.relationship)}
                  </span>
                  <span className={`rounded-full px-3 py-1 text-xs font-medium ${getClientStatusClasses(selectedClient.status)}`}>
                    {getClientStatusLabel(selectedClient.status)}
                  </span>
                  <span className={`rounded-full px-3 py-1 text-xs font-medium ${getEngagementClasses(selectedClient.engagement)}`}>
                    {getEngagementLabel(selectedClient.engagement)}
                  </span>
                </div>

                <div className="mt-4 space-y-3 text-sm text-slate-600">
                  <div className="flex justify-between gap-3">
                    <span>Company</span>
                    <span className="font-medium text-slate-800">{selectedClient.company || "—"}</span>
                  </div>
                  <div className="flex justify-between gap-3">
                    <span>Phone</span>
                    <span className="font-medium text-slate-800">{selectedClient.phone || "—"}</span>
                  </div>
                  <div className="flex justify-between gap-3">
                    <span>Website</span>
                    <span className="font-medium text-slate-800">{selectedClient.website || "—"}</span>
                  </div>
                  <div className="flex justify-between gap-3">
                    <span>Location</span>
                    <span className="font-medium text-slate-800">{selectedClient.location || "—"}</span>
                  </div>
                  <div className="flex justify-between gap-3">
                    <span>Last contact</span>
                    <span className="font-medium text-slate-800">{formatClientTime(selectedClient.lastSeen)}</span>
                  </div>
                </div>

                <div className="mt-4">
                  <p className="text-xs uppercase tracking-wide text-slate-400">
                    Linked Completed Projects
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {selectedCompletedProjects.length > 0 ? (
                      selectedCompletedProjects.map((project) => (
                        <span
                          key={project.id}
                          className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700"
                        >
                          {project.title}
                        </span>
                      ))
                    ) : (
                      <span className="text-sm text-slate-500">
                        No completed projects linked.
                      </span>
                    )}
                  </div>
                </div>

                {selectedClient.notes ? (
                  <div className="mt-4 rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-600">
                    {selectedClient.notes}
                  </div>
                ) : null}
              </div>
            ) : (
              <div className="mt-4 rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-500">
                Select a client row to view full details.
              </div>
            )}

            <div className="mt-4 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => (selectedClient ? openEditClient(selectedClient) : openCreateClient())}
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                {selectedClient ? "Edit Client" : "Create Client"}
              </button>
              <button
                type="button"
                onClick={() => {
                  if (selectedClient) {
                    openDeleteClientModal(selectedClient);
                  }
                }}
                disabled={!selectedClient}
                className="rounded-xl border border-rose-200 px-4 py-2 text-sm font-medium text-rose-700 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Delete Selected Client
              </button>
            </div>
          </article>

          {/* <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900">Client Notes</h3>
            <ul className="mt-4 space-y-3 text-sm text-slate-600">
              <li className="rounded-xl bg-slate-50 px-4 py-3 leading-6 text-slate-600">
                Admin-only records let you keep client, partner, and collaborator details in one controlled space.
              </li>
              <li className="rounded-xl bg-slate-50 px-4 py-3 leading-6 text-slate-600">
                Use relationship and engagement to separate long-term clients from partners and occasional contacts.
              </li>
              <li className="rounded-xl bg-slate-50 px-4 py-3 leading-6 text-slate-600">
                Notes and last contact fields help you track communication history without leaving the dashboard.
              </li>
            </ul>
          </article> */}
        </aside>
      </div>

      {modalRoot && isDeleteModalOpen && clientToDelete
        ? createPortal(
            <div className="fixed inset-0 z-50 flex h-dvh w-dvw items-center justify-center overflow-y-auto bg-slate-950/60 px-4 py-6 backdrop-blur-sm">
              <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="delete-client-modal-title"
                className="my-auto w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.24em] text-rose-400">
                      Delete confirmation
                    </p>
                    <h3
                      id="delete-client-modal-title"
                      className="mt-2 text-2xl font-semibold text-slate-900"
                    >
                      Delete this client record?
                    </h3>
                    <p className="mt-2 text-sm text-slate-500">
                      This will permanently remove the client from the management list.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsDeleteModalOpen(false)}
                    className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:bg-white"
                  >
                    Close
                  </button>
                </div>

                <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm font-medium text-slate-900">
                    {clientToDelete.name || `ID: ${clientToDelete.id}`}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    {clientToDelete.email}
                  </p>
                </div>

                <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={() => setIsDeleteModalOpen(false)}
                    className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteSelectedClient(clientToDelete.id)}
                    className="rounded-xl bg-rose-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-rose-700"
                  >
                    Delete Client
                  </button>
                </div>
              </div>
            </div>,
            modalRoot,
          )
        : null}

      <Sheet open={editorOpen} onOpenChange={handleEditorOpenChange}>
        <SheetContent
          side="right"
          className="w-full overflow-y-auto bg-white p-0 text-slate-900 sm:max-w-2xl"
        >
          <div className="flex min-h-full flex-col">
            <SheetHeader className="border-b border-slate-200 px-6 py-6 text-left">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
                {editorMode === "edit" ? "Edit Client" : "Add Client"}
              </p>
              <SheetTitle className="text-2xl font-semibold text-slate-900">
                {editorMode === "edit" ? "Update client details" : "Add a new client details"}
              </SheetTitle>
              <SheetDescription className="max-w-xl text-sm text-slate-500">
                Store partner, client, and collaborator details here. This is an admin-only record system.
              </SheetDescription>
            </SheetHeader>

            <form onSubmit={handleSaveClient} className="flex flex-1 flex-col gap-6 px-6 py-6">
              <div className="grid gap-4 md:grid-cols-2">
                <label className="space-y-2 text-sm text-slate-600 md:col-span-2">
                  <span>Full Name</span>
                  <input
                    value={form.name}
                    onChange={(e) => handleFieldChange("name", e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-slate-300 focus:bg-white"
                    placeholder="Client name"
                    required
                  />
                </label>

                <label className="space-y-2 text-sm text-slate-600 md:col-span-2">
                  <span>Email</span>
                  <input
                    value={form.email}
                    onChange={(e) => handleFieldChange("email", e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-slate-300 focus:bg-white"
                    placeholder="name@company.com"
                    type="email"
                    required
                  />
                </label>

                <label className="space-y-2 text-sm text-slate-600">
                  <span>Relationship</span>
                  <select
                    value={form.relationship}
                    onChange={(e) => handleFieldChange("relationship", e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-slate-300 focus:bg-white"
                  >
                    <option value="client">Client</option>
                    <option value="partner">Partner</option>
                    <option value="other">Other</option>
                  </select>
                </label>

                <label className="space-y-2 text-sm text-slate-600">
                  <span>Status</span>
                  <select
                    value={form.status}
                    onChange={(e) => handleFieldChange("status", e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-slate-300 focus:bg-white"
                  >
                    <option value="active">Active</option>
                    <option value="pending">Pending</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </label>

                <label className="space-y-2 text-sm text-slate-600">
                  <span>Engagement</span>
                  <select
                    value={form.engagement}
                    onChange={(e) => handleFieldChange("engagement", e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-slate-300 focus:bg-white"
                  >
                    <option value="basic">Basic</option>
                    <option value="standard">Standard</option>
                    <option value="premium">Premium</option>
                    <option value="enterprise">Enterprise</option>
                  </select>
                </label>

                <label className="space-y-2 text-sm text-slate-600">
                  <span>Company</span>
                  <input
                    value={form.company}
                    onChange={(e) => handleFieldChange("company", e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-slate-300 focus:bg-white"
                    placeholder="Company or organization"
                  />
                </label>

                <label className="space-y-2 text-sm text-slate-600">
                  <span>Phone</span>
                  <input
                    value={form.phone}
                    onChange={(e) => handleFieldChange("phone", e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-slate-300 focus:bg-white"
                    placeholder="Phone number"
                  />
                </label>

                <label className="space-y-2 text-sm text-slate-600">
                  <span>Website</span>
                  <input
                    value={form.website}
                    onChange={(e) => handleFieldChange("website", e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-slate-300 focus:bg-white"
                    placeholder="https://example.com"
                  />
                </label>

                <label className="space-y-2 text-sm text-slate-600">
                  <span>Location</span>
                  <input
                    value={form.location}
                    onChange={(e) => handleFieldChange("location", e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-slate-300 focus:bg-white"
                    placeholder="City, country"
                  />
                </label>

                <label className="space-y-2 text-sm text-slate-600 md:col-span-2">
                  <span>Last Contact / Last Seen</span>
                  <input
                    value={form.lastSeen}
                    onChange={(e) => handleFieldChange("lastSeen", e.target.value)}
                    type="date"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-slate-300 focus:bg-white"
                  />
                </label>

                <label className="space-y-2 text-sm text-slate-600 md:col-span-2">
                  <span>Linked Completed Projects</span>
                  {completedProjectOptions.length > 0 ? (
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                      <div className="max-h-64 space-y-2 overflow-y-auto rounded-xl border border-slate-300 bg-white p-2">
                        {completedProjectOptions.map((project) => {
                          const projectId = String(project.id);
                          const selected = formCompletedProjectIds.includes(projectId);

                          return (
                            <button
                              key={projectId}
                              type="button"
                              onClick={() => toggleCompletedProject(projectId)}
                              className={`flex w-full items-center justify-between rounded-lg border px-3 py-2 text-left text-sm transition ${
                                selected
                                  ? "border-slate-900 bg-slate-900 text-white"
                                  : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                              }`}
                              aria-pressed={selected}
                            >
                              <span className="truncate pr-3">{project.title}</span>
                              <span
                                className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                                  selected
                                    ? "bg-white/20 text-white"
                                    : "bg-slate-100 text-slate-500"
                                }`}
                              >
                                {selected ? "Selected" : "Select"}
                              </span>
                            </button>
                          );
                        })}
                      </div>

                      <p className="mt-2 text-xs text-slate-500">
                        Click each project to add or remove it from this client.
                      </p>

                      {formCompletedProjectIds.length > 0 ? (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {completedProjectOptions
                            .filter((project) =>
                              formCompletedProjectIds.includes(String(project.id)),
                            )
                            .map((project) => (
                              <span
                                key={`selected-${project.id}`}
                                className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700"
                              >
                                {project.title}
                              </span>
                            ))}
                        </div>
                      ) : null}
                    </div>
                  ) : (
                    <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500">
                      No completed projects available to link yet.
                    </div>
                  )}
                </label>

                <label className="space-y-2 text-sm text-slate-600 md:col-span-2">
                  <span>Notes</span>
                  <textarea
                    value={form.notes}
                    onChange={(e) => handleFieldChange("notes", e.target.value)}
                    rows={4}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-slate-300 focus:bg-white"
                    placeholder="Project context, communication notes, or relationship history"
                  />
                </label>
              </div>

              <div className="mt-auto flex flex-col gap-3 border-t border-slate-200 pt-4 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => handleEditorOpenChange(false)}
                  className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-slate-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-slate-800 disabled:opacity-60"
                >
                  {saving
                    ? "Saving..."
                    : editorMode === "edit"
                      ? "Update Client"
                      : "Add Client"}
                </button>
              </div>
            </form>
          </div>
        </SheetContent>
      </Sheet>
    </section>
  );
}
