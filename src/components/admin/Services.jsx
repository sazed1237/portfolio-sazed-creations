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

const emptyServiceForm = {
  title: "",
  description: "",
  tier: "Core",
  price: "",
  turnaround: "",
  status: "draft",
  sortOrder: 0,
};

function normalizeServiceStatus(status) {
  return String(status ?? "").toLowerCase();
}

function getServiceStatusLabel(status) {
  return normalizeServiceStatus(status) === "active" ? "Active" : "Draft";
}

function getServiceStatusClasses(status) {
  return normalizeServiceStatus(status) === "active"
    ? "bg-emerald-50 text-emerald-700"
    : "bg-amber-50 text-amber-700";
}

function buildServiceForm(service) {
  return {
    title: service?.title ?? "",
    description: service?.description ?? "",
    tier: service?.tier ?? "Core",
    price: service?.price ?? "",
    turnaround: service?.turnaround ?? "",
    status: normalizeServiceStatus(service?.status) || "draft",
    sortOrder: Number(service?.sortOrder ?? 0),
  };
}

export default function Services() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [form, setForm] = useState(emptyServiceForm);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    let active = true;

    async function loadServices() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch("/api/admin/services", {
          cache: "no-store",
        });
        const payload = await response.json();

        if (!response.ok) {
          throw new Error(payload?.error || "Failed to load services");
        }

        if (active) {
          setData(payload);
        }
      } catch (fetchError) {
        if (active) {
          setError(
            fetchError instanceof Error
              ? fetchError.message
              : "Failed to load services",
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadServices();

    return () => {
      active = false;
    };
  }, []);

  const services = useMemo(() => data?.items ?? [], [data]);
  const filteredServices = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    return services.filter((service) => {
      const matchesTerm =
        !term ||
        [service.title, service.description, service.tier]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(term));

      const matchesType =
        typeFilter === "all" ||
        String(service.tier ?? "").toLowerCase() === typeFilter;

      return matchesTerm && matchesType;
    });
  }, [services, searchTerm, typeFilter]);

  // Keep selection in sync with search/filter changes: if the current
  // selected service is filtered out, pick the first visible row or clear.
  useEffect(() => {
    if (!filteredServices || filteredServices.length === 0) {
      setEditingId(null);
      return;
    }

    const stillVisible = filteredServices.some(
      (svc) => String(svc.id) === String(editingId),
    );

    if (!stillVisible) {
      // auto-select the first visible service for a smoother UX
      setEditingId(filteredServices[0]?.id ?? null);
    }
  }, [filteredServices]);
  const selectedService = useMemo(
    () =>
      services.find((service) => String(service.id) === String(editingId)) ??
      null,
    [services, editingId],
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

  const metrics = [
    {
      label: "Service Plans",
      value: loading ? "..." : String(data?.summary?.total ?? 0),
      note: data?.source === "d1" ? "Live from D1" : "Local fallback",
    },
    {
      label: "Active Offers",
      value: loading ? "..." : String(data?.summary?.active ?? 0),
      note: "Currently visible on site",
    },
    {
      label: "Drafts",
      value: loading ? "..." : String(data?.summary?.draft ?? 0),
      note: "Waiting for review",
    },
    {
      label: "Avg. Conversion",
      value: loading ? "..." : `${data?.summary?.avgConversion ?? 0}%`,
      note: "From service page visits",
    },
  ];

  const features = [
    "Edit service descriptions and deliverables",
    "Adjust price points and turnaround times",
    "Toggle active, draft, and hidden states",
    "Reorder featured packages for the homepage",
  ];

  const workflow = [
    {
      title: "Package polished",
      detail: "Copy tightened and benefits rewritten for clarity.",
    },
    {
      title: "Pricing approved",
      detail: "Rates validated against current positioning.",
    },
    {
      title: "CTA aligned",
      detail: "Buttons and labels updated for conversion.",
    },
  ];

  function handleFieldChange(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function openCreateService() {
    setEditingId(null);
    setForm(emptyServiceForm);
    setEditorOpen(true);
  }

  function selectService(service) {
    setEditingId(service.id);
  }

  function openEditService(service) {
    setEditingId(service.id);
    setForm(buildServiceForm(service));
    setEditorOpen(true);
  }

  function handleEditorOpenChange(nextOpen) {
    setEditorOpen(nextOpen);
    if (!nextOpen) {
      setEditingId(null);
    }
  }

  async function refreshServices() {
    const response = await fetch("/api/admin/services", { cache: "no-store" });
    const payload = await response.json();
    if (!response.ok) {
      throw new Error(payload?.error || "Failed to reload services");
    }
    setData(payload);
  }

  async function handleSaveService(event) {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");

      const isUpdate = Boolean(editingId);

      const endpoint = editingId
        ? `/api/admin/services/${editingId}`
        : "/api/admin/services";
      const method = isUpdate ? "PATCH" : "POST";

      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload?.error || "Failed to save service");
      }

      setEditorOpen(false);
      setEditingId(null);
      await refreshServices();
      showToast(
        isUpdate
          ? "Service updated successfully."
          : "Service created successfully.",
        "success",
      );
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Failed to save service",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteService(id) {
    // accept either a service object or an id
    if (!id) return;
    const payload = typeof id === "object" ? id : { id };
    setServiceToDelete(payload);
    setIsDeleteModalOpen(true);
  }

  async function deleteSelectedService(id) {
    try {
      setSaving(true);
      setError("");

      const response = await fetch(`/api/admin/services/${id}`, {
        method: "DELETE",
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload?.error || "Failed to delete service");
      }

      if (String(editingId) === String(id)) {
        setEditorOpen(false);
        setEditingId(null);
      }

      await refreshServices();
      setIsDeleteModalOpen(false);
      setServiceToDelete(null);
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : "Failed to delete service",
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
          Offerings & Pricing
        </p>
        <div className="mt-2 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-3xl font-semibold">Services Management</h2>
            <p className="mt-2 max-w-2xl text-sm text-slate-200">
              Control your service catalog, refine packages, and keep your
              offerings aligned with client demand.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() =>
                window.open("/services", "_blank", "noopener,noreferrer")
              }
              className="rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/15"
            >
              Preview Services
            </button>
            <button
              type="button"
              onClick={openCreateService}
              className="rounded-xl bg-white px-4 py-2 text-sm font-medium text-slate-900 transition hover:bg-slate-100"
            >
              Add Service
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
              <h3 className="text-lg font-semibold text-slate-900">
                Service Catalog
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Keep packages organized, visible, and ready to convert visitors
                into leads.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <input
                type="text"
                placeholder="Search services"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="min-w-[220px] rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm outline-none transition placeholder:text-slate-400 focus:border-slate-300 focus:bg-white"
              />
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-700 outline-none transition focus:border-slate-300 focus:bg-white"
              >
                <option value="all">All Types</option>
                <option value="core">Core</option>
                <option value="premium">Premium</option>
                <option value="growth">Growth</option>
                <option value="strategy">Strategy</option>
              </select>
            </div>
          </div>

          {error ? (
            <div className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
              {error}
            </div>
          ) : null}

          <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200">
            <div className="grid grid-cols-[1.4fr_0.9fr_0.8fr_0.8fr_0.8fr_0.8fr] gap-4 border-b border-slate-200 bg-slate-50 px-4 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              <span>Service</span>
              <span>Tier</span>
              <span>Status</span>
              <span>Price</span>
              <span>Turnaround</span>
              <span>Actions</span>
            </div>

            <div className="divide-y divide-slate-100">
              {loading ? (
                <div className="px-4 py-6 text-sm text-slate-500">
                  Loading services...
                </div>
              ) : filteredServices.length > 0 ? (
                filteredServices.map((service) => (
                  <div
                    key={service.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => selectService(service)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        selectService(service);
                      }
                    }}
                    className={`grid cursor-pointer grid-cols-[1.4fr_0.9fr_0.8fr_0.8fr_0.8fr_0.8fr] gap-4 px-4 py-4 text-sm text-slate-700 transition hover:bg-slate-200 ${String(editingId) === String(service.id) ? "bg-slate-200 ring-1 ring-slate-200" : ""}`}
                  >
                    <div>
                      <p className="font-medium text-slate-900">
                        {service.title}
                      </p>
                      {/* <p className="mt-1 text-xs text-slate-500">{service.description}</p> */}
                    </div>

                    <div className="flex items-center">
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                        {service.tier}
                      </span>
                    </div>

                    <div className="flex items-center">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${getServiceStatusClasses(service.status)}`}
                      >
                        {getServiceStatusLabel(service.status)}
                      </span>
                    </div>

                    <div className="flex items-center text-slate-600">
                      {service.price}
                    </div>
                    <div className="flex items-center text-slate-600">
                      {service.turnaround}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          openEditService(service);
                        }}
                        className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-100"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          handleDeleteService(service);
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
                  No services found yet.
                </div>
              )}
            </div>
          </div>
        </article>

        <aside className="space-y-6">
          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">
                  Selected Service
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Quick view and actions for the selected catalog item.
                </p>
              </div>
            </div>

            <div className="mt-4 rounded-2xl bg-slate-50 p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <h4 className="truncate text-sm font-semibold text-slate-900">
                    {selectedService?.title ?? "No service selected"}
                  </h4>
                  <p className="mt-2 text-sm text-slate-500">
                    {selectedService?.description ||
                      "Pick a row to edit it in the popup editor."}
                  </p>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${getServiceStatusClasses(selectedService?.status)}`}
                  >
                    {selectedService
                      ? getServiceStatusLabel(selectedService.status)
                      : "Draft"}
                  </span>
                  <span className="text-xs text-slate-500">
                    {selectedService?.updatedAt
                      ? new Date(selectedService.updatedAt).toLocaleDateString()
                      : ""}
                  </span>
                </div>
              </div>

              <dl className="mt-4 grid grid-cols-2 gap-3 text-sm text-slate-600">
                <div>
                  <dt className="text-xs text-slate-400">Tier</dt>
                  <dd className="mt-1 font-medium text-slate-800">
                    {selectedService?.tier ?? "Core"}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-400">Price</dt>
                  <dd className="mt-1 font-medium text-slate-800">
                    {selectedService?.price ?? "—"}
                  </dd>
                </div>

                <div>
                  <dt className="text-xs text-slate-400">Turnaround</dt>
                  <dd className="mt-1 font-medium text-slate-800">
                    {selectedService?.turnaround || "Flexible"}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-400">Sort Order</dt>
                  <dd className="mt-1 font-medium text-slate-800">
                    {selectedService?.sortOrder ?? "—"}
                  </dd>
                </div>
              </dl>

              <div className="mt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() =>
                    selectedService
                      ? openEditService(selectedService)
                      : openCreateService()
                  }
                  className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                >
                  {selectedService ? "Edit Service" : "Create Service"}
                </button>
                <button
                  type="button"
                  onClick={() =>
                    selectedService && handleDeleteService(selectedService)
                  }
                  disabled={!selectedService || saving}
                  className="rounded-xl bg-rose-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-rose-700 disabled:opacity-60"
                >
                  Delete
                </button>
              </div>
            </div>
          </article>

          {/* <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900">Features</h3>
            <ul className="mt-4 space-y-3 text-sm text-slate-600">
              {features.map((feature) => (
                <li key={feature} className="flex gap-3 rounded-xl bg-slate-50 px-4 py-3 leading-6 text-slate-600">
                  <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-slate-900" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900">Publishing Workflow</h3>
            <div className="mt-4 space-y-3">
              {workflow.map((item, index) => (
                <div key={item.title} className="flex gap-3 rounded-xl bg-slate-50 p-3">
                  <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-900 text-xs font-semibold text-white">
                    {index + 1}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-slate-900">{item.title}</p>
                    <p className="mt-1 text-sm text-slate-500">{item.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </article> */}
        </aside>
      </div>

      {modalRoot && isDeleteModalOpen && serviceToDelete
        ? createPortal(
            <div className="fixed inset-0 z-50 flex h-dvh w-dvw items-center justify-center overflow-y-auto bg-slate-950/60 px-4 py-6 backdrop-blur-sm">
              <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="delete-service-modal-title"
                className="my-auto w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.24em] text-rose-400">
                      Delete confirmation
                    </p>
                    <h3
                      id="delete-service-modal-title"
                      className="mt-2 text-2xl font-semibold text-slate-900"
                    >
                      Delete this service?
                    </h3>
                    <p className="mt-2 text-sm text-slate-500">
                      This will permanently remove the service from the catalog.
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
                    {serviceToDelete.title || `ID: ${serviceToDelete.id}`}
                  </p>
                  {serviceToDelete.price ? (
                    <p className="mt-1 text-sm text-slate-500">
                      {serviceToDelete.price}
                    </p>
                  ) : null}
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
                    onClick={() => deleteSelectedService(serviceToDelete.id)}
                    className="rounded-xl bg-rose-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-rose-700"
                  >
                    Delete Service
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
                {editingId ? "Edit Service" : "New Service"}
              </p>
              <SheetTitle className="text-2xl font-semibold text-slate-900">
                {editingId ? "Update service details" : "Create a new service"}
              </SheetTitle>
              <SheetDescription className="max-w-xl text-sm text-slate-500">
                Keep the service card concise and conversion-focused. This popup
                writes straight into your content data.
              </SheetDescription>
            </SheetHeader>

            <form
              onSubmit={handleSaveService}
              className="flex flex-1 flex-col gap-6 px-6 py-6"
            >
              <div className="grid gap-4 md:grid-cols-2">
                <label className="space-y-2 text-sm text-slate-600 md:col-span-2">
                  <span>Title</span>
                  <input
                    value={form.title}
                    onChange={(e) => handleFieldChange("title", e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-slate-300 focus:bg-white"
                    placeholder="Service title"
                    required
                  />
                </label>
                <label className="space-y-2 text-sm text-slate-600 md:col-span-2">
                  <span>Description</span>
                  <textarea
                    value={form.description}
                    onChange={(e) =>
                      handleFieldChange("description", e.target.value)
                    }
                    rows={4}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-slate-300 focus:bg-white"
                    placeholder="Short service summary"
                    required
                  />
                </label>
                <label className="space-y-2 text-sm text-slate-600">
                  <span>Tier</span>
                  <select
                    value={form.tier}
                    onChange={(e) => handleFieldChange("tier", e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-slate-300 focus:bg-white"
                  >
                    <option value="Core">Core</option>
                    <option value="Premium">Premium</option>
                    <option value="Growth">Growth</option>
                    <option value="Strategy">Strategy</option>
                  </select>
                </label>
                <label className="space-y-2 text-sm text-slate-600">
                  <span>Status</span>
                  <select
                    value={form.status}
                    onChange={(e) =>
                      handleFieldChange("status", e.target.value)
                    }
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-slate-300 focus:bg-white"
                  >
                    <option value="draft">Draft</option>
                    <option value="active">Active</option>
                  </select>
                </label>
                <label className="space-y-2 text-sm text-slate-600">
                  <span>Price</span>
                  <input
                    value={`${form.price}`}
                    onChange={(e) => handleFieldChange("price", e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-slate-300 focus:bg-white"
                    placeholder="$1,200"
                    required
                  />
                </label>
                <label className="space-y-2 text-sm text-slate-600">
                  <span>Turnaround</span>
                  <input
                    value={form.turnaround}
                    onChange={(e) =>
                      handleFieldChange("turnaround", e.target.value)
                    }
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-slate-300 focus:bg-white"
                    placeholder="2-4 weeks"
                    required
                  />
                </label>
                <label className="space-y-2 text-sm text-slate-600">
                  <span>Sort Order</span>
                  <input
                    type="number"
                    value={form.sortOrder}
                    onChange={(e) =>
                      handleFieldChange("sortOrder", Number(e.target.value))
                    }
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-slate-300 focus:bg-white"
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
                    : editingId
                      ? "Update Service"
                      : "Create Service"}
                </button>
              </div>
            </form>
          </div>
        </SheetContent>
      </Sheet>
    </section>
  );
}
