"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";

const statusOptions = ["all", "new", "read", "replied", "archived"];

function normalizeStatus(status) {
  return String(status ?? "").toLowerCase();
}

function getMessageBody(message) {
  return String(message ?? "")
    .split("\n\n---\n")[0]
    .trim();
}

function getMessageMeta(message, key) {
  const match = String(message ?? "").match(new RegExp(`${key}:\\s*(.*)`, "i"));
  return match?.[1]?.split("\n")[0]?.trim() ?? "";
}

function getServiceLabel(message) {
  return getMessageMeta(message, "Service");
}

function getContactNumber(message) {
  return getMessageMeta(message, "Phone");
}

function getDisplayService(message) {
  return getServiceLabel(message) || "General inquiry";
}

export default function Messages() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedId, setSelectedId] = useState(null);
  const [replySubject, setReplySubject] = useState("");
  const [replyMessage, setReplyMessage] = useState("");
  const [isReplyModalOpen, setIsReplyModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, variant = "info") => {
    setToast({ id: Date.now(), message, variant });
  }, []);

  useEffect(() => {
    let active = true;

    async function loadMessages() {
      try {
        setLoading(true);

        const response = await fetch("/api/admin/messages?limit=50", {
          cache: "no-store",
        });
        const payload = await response.json();

        if (!response.ok) {
          throw new Error(payload?.error || "Failed to load messages");
        }

        if (active) {
          setData(payload);
        }
      } catch (fetchError) {
        if (active) {
          showToast(
            fetchError instanceof Error
              ? fetchError.message
              : "Failed to load messages",
            "error",
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadMessages();

    return () => {
      active = false;
    };
  }, [showToast]);

  const messages = useMemo(() => data?.items ?? [], [data]);

  const filteredMessages = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    return messages.filter((message) => {
      const serviceLabel = getDisplayService(message.message);
      const contactNumber = getContactNumber(message.message);

      const matchesTerm =
        !term ||
        [
          message.name,
          message.email,
          serviceLabel,
          contactNumber,
          message.subject,
          message.message,
        ]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(term));

      const matchesStatus =
        statusFilter === "all" ||
        String(message.status ?? "").toLowerCase() === statusFilter;

      return matchesTerm && matchesStatus;
    });
  }, [messages, searchTerm, statusFilter]);

  const selectedMessage = useMemo(
    () =>
      filteredMessages.find((message) => message.id === selectedId) ??
      filteredMessages[0] ??
      null,
    [filteredMessages, selectedId],
  );

  const selectedService = selectedMessage
    ? getDisplayService(selectedMessage.message)
    : "";
  const selectedContactNumber = selectedMessage
    ? getContactNumber(selectedMessage.message)
    : "";
  const selectedBody = selectedMessage
    ? getMessageBody(selectedMessage.message)
    : "";
  const modalRoot = typeof document !== "undefined" ? document.body : null;

  useEffect(() => {
    if (!toast) return undefined;

    const timeoutId = window.setTimeout(() => {
      setToast(null);
    }, 3500);

    return () => window.clearTimeout(timeoutId);
  }, [toast]);

  useEffect(() => {
    if (!selectedMessage && filteredMessages.length > 0) {
      setSelectedId(filteredMessages[0].id);
    }
  }, [filteredMessages, selectedMessage]);

  const refreshMessages = useCallback(async () => {
    const response = await fetch("/api/admin/messages?limit=50", {
      cache: "no-store",
    });
    const payload = await response.json();

    if (!response.ok) {
      throw new Error(payload?.error || "Failed to load messages");
    }

    setData(payload);
  }, []);

  const updateStatus = useCallback(async (id, status) => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/messages", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload?.error || "Failed to update message status");
      }

      await refreshMessages();
      setSelectedId(id);
      showToast(`Message marked as ${status}.`, "success");
    } catch (updateError) {
      showToast(
        updateError instanceof Error
          ? updateError.message
          : "Failed to update message status",
        "error",
      );
    } finally {
      setLoading(false);
    }
  }, [refreshMessages, showToast]);

  useEffect(() => {
    if (!selectedMessage) {
      setReplySubject("");
      setReplyMessage("");
      setIsReplyModalOpen(false);
      setIsDeleteModalOpen(false);
      setMessageToDelete(null);
      return;
    }

    if (normalizeStatus(selectedMessage.status) === "new") {
      updateStatus(selectedMessage.id, "read");
    }

    setReplySubject(
      selectedMessage.subject?.startsWith("Re:")
        ? selectedMessage.subject
        : `Re: ${selectedMessage.subject || "Your message"}`,
    );
    setReplyMessage(
      `Hi ${selectedMessage.name || "there"},\n\nThank you for reaching out about ${
        selectedService || "your inquiry"
      }.\n\n`,
    );
  }, [selectedMessage, selectedService, updateStatus]);

  async function sendReplyDraft() {
    if (!selectedMessage?.email) {
      showToast("No recipient email found for this message.", "error");
      return;
    }

    const subject = replySubject.trim() || `Re: ${selectedMessage.subject || "Your message"}`;
    const body = replyMessage.trim();
    const mailtoUrl = new URL(`mailto:${selectedMessage.email}`);

    mailtoUrl.searchParams.set("subject", subject);
    mailtoUrl.searchParams.set(
      "body",
      body || `Hi ${selectedMessage.name || "there"},\n\n`,
    );

    setIsReplyModalOpen(false);
    await updateStatus(selectedMessage.id, "replied");
    window.location.href = mailtoUrl.toString();
    showToast("Reply draft opened in your email app.", "success");
  }

  function openReplyModal() {
    if (!selectedMessage) {
      return;
    }

    setIsReplyModalOpen(true);
  }

  function openDeleteModal() {
    if (!selectedMessage) {
      return;
    }

    setMessageToDelete(selectedMessage);
    setIsDeleteModalOpen(true);
  }

  async function deleteSelectedMessage(id) {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/messages", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload?.error || "Failed to delete message");
      }

      await refreshMessages();
      setSelectedId(null);
      showToast("Message deleted.", "success");
      setIsDeleteModalOpen(false);
      setMessageToDelete(null);
    } catch (deleteError) {
      showToast(
        deleteError instanceof Error
          ? deleteError.message
          : "Failed to delete message",
        "error",
      );
    } finally {
      setLoading(false);
    }
  }

  const summary = {
    total: messages.length,
    unread: messages.filter(
      (message) => normalizeStatus(message.status) === "new",
    ).length,
    replied: messages.filter(
      (message) => normalizeStatus(message.status) === "replied",
    ).length,
    archived: messages.filter(
      (message) => normalizeStatus(message.status) === "archived",
    ).length,
  };

  return (
    <section className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
              Client communication
            </p>
            <h2 className="mt-2 text-3xl font-semibold text-slate-900">
              Inbox
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-slate-500">
              View and manage incoming contact messages from the portfolio
              contact form.
            </p>
          </div>

          {/* <div className="flex flex-wrap gap-3">
            <button className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-white">
              Export CSV
            </button>
            <button className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800">
              Refresh
            </button>
          </div> */}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          {
            label: "Total Messages",
            value: loading ? "..." : String(summary.total),
            detail: "all submissions",
          },
          {
            label: "Unread",
            value: loading ? "..." : String(summary.unread),
            detail: "needs attention",
          },
          {
            label: "Replied",
            value: loading ? "..." : String(summary.replied),
            detail: "followed up",
          },
          {
            label: "Archived",
            value: loading ? "..." : String(summary.archived),
            detail: "closed threads",
          },
        ].map((metric) => (
          <article
            key={metric.label}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <p className="text-sm text-slate-500">{metric.label}</p>
            <p className="mt-2 text-3xl font-semibold text-slate-900">
              {metric.value}
            </p>
            <p className="mt-1 text-xs text-slate-400">{metric.detail}</p>
          </article>
        ))}
      </div>

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

      <div className="grid gap-6 xl:grid-cols-[1.35fr_0.95fr]">
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">
                Message List
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Review new leads, mark status, and keep the inbox organized.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <input
                type="text"
                placeholder="Search messages"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                className="min-w-[220px] rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm outline-none transition placeholder:text-slate-400 focus:border-slate-300 focus:bg-white"
              />
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-700 outline-none transition focus:border-slate-300 focus:bg-white"
              >
                {statusOptions.map((status) => (
                  <option key={status} value={status}>
                    {status === "all"
                      ? "All Statuses"
                      : status.charAt(0).toUpperCase() + status.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200">
            <div className="grid grid-cols-[minmax(0,1.50fr)_minmax(0,1.50fr)_minmax(0,1.2fr)_auto_minmax(0,1.2fr)_auto] gap-4 border-b border-slate-200 bg-slate-50 px-4 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              <span>Sender</span>
              <span>Service</span>
              <span>Contact</span>
              <span>Status</span>
              <span>Received</span>
              {/* <span>Action</span> */}
            </div>

            <div className="divide-y divide-slate-100">
              {filteredMessages.length > 0 ? (
                filteredMessages.map((message) => (
                  <button
                    key={message.id}
                    type="button"
                    onClick={() => setSelectedId(message.id)}
                    className={`grid w-full grid-cols-[minmax(0,1.50fr)_minmax(0,1.50fr)_minmax(0,1.2fr)_auto_minmax(0,1.2fr)_auto] items-start gap-4 px-4 py-4 text-left text-sm transition hover:bg-slate-50 ${
                      selectedId === message.id ? "bg-slate-50" : ""
                    }`}
                  >
                    <div className="min-w-0">
                      <p className="truncate font-medium text-slate-900">
                        {message.name}
                      </p>
                      <p className="mt-1 truncate text-xs text-slate-500">
                        {message.email}
                      </p>
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-medium text-slate-800">
                        {getDisplayService(message.message)}
                      </p>
                      {/* <p className="mt-1 truncate text-xs text-slate-500">{message.subject || 'No subject'}</p> */}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-medium text-slate-800">
                        {getContactNumber(message.message) || "Not provided"}
                      </p>
                      {/* <p className="mt-1 line-clamp-1 max-w-[42ch] text-xs text-slate-500">{getMessageBody(message.message)}</p> */}
                    </div>
                    <div className="pt-0.5">
                      <div className="space-y-1">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                            normalizeStatus(message.status) === "new"
                              ? "bg-amber-50 text-amber-700"
                              : "bg-emerald-50 text-emerald-700"
                          }`}
                        >
                          {/* {getReadState(message.status)} */}
                          {message.status}
                        </span>
                        {/* <p className="text-[11px] uppercase tracking-[0.16em] text-slate-400">{message.status}</p> */}
                      </div>
                    </div>
                    <div className="pt-0.5 text-slate-500">
                      <p className="whitespace-nowrap">
                        {message.createdAt
                          ? new Date(message.createdAt).toLocaleString()
                          : "recently"}
                      </p>
                    </div>
                    {/* <div className="pt-0.5 text-right text-slate-600">
                      <span className="whitespace-nowrap font-medium">Open</span>
                    </div> */}
                  </button>
                ))
              ) : (
                <div className="px-4 py-8 text-sm text-slate-500">
                  {loading ? "Loading messages..." : "No messages found."}
                </div>
              )}
            </div>
          </div>
        </article>

        <aside className="space-y-6">
          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">
                  Message Detail
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Selected conversation thread.
                </p>
              </div>
              {selectedMessage ? (
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                  {selectedMessage.status}
                </span>
              ) : null}
            </div>

            {selectedMessage ? (
              <div className="mt-4 space-y-4 rounded-2xl bg-slate-50 p-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  {[
                    { label: "Name", value: selectedMessage.name },
                    { label: "Email", value: selectedMessage.email },
                    {
                      label: "Service",
                      value: selectedService || "General inquiry",
                    },
                    {
                      label: "Contact Number",
                      value: selectedContactNumber || "Not provided",
                    },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="rounded-xl border border-slate-200 bg-white px-3 py-3"
                    >
                      <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">
                        {item.label}
                      </p>
                      <p className="mt-1 break-words text-sm font-medium text-slate-800">
                        {item.value}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl border border-slate-200 bg-white px-3 py-3">
                    <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">
                      Received
                    </p>
                    <p className="mt-1 text-sm font-medium text-slate-800">
                      {selectedMessage.createdAt
                        ? new Date(selectedMessage.createdAt).toLocaleString()
                        : "recently"}
                    </p>
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-white px-3 py-3">
                    <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">
                      Status
                    </p>
                    <p className="mt-1 text-sm font-medium text-slate-800">
                      {selectedMessage.status}
                    </p>
                  </div>
                </div>

                {/* <div className="rounded-xl border border-slate-200 bg-white px-3 py-3">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">
                    Received
                  </p>
                  <p className="mt-1 text-sm font-medium text-slate-800">
                    {selectedMessage.createdAt
                      ? new Date(selectedMessage.createdAt).toLocaleString()
                      : "recently"}
                  </p>
                </div> */}

                <div className="rounded-xl border border-slate-200 bg-white px-3 py-3">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">
                    Message
                  </p>
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">
                    {selectedBody || selectedMessage.message}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={openReplyModal}
                  className="w-full rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
                >
                  Reply to Client
                </button>
                <button
                  type="button"
                  onClick={openDeleteModal}
                  className="w-full rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-medium text-rose-700 transition hover:bg-rose-100"
                >
                  Delete Message
                </button>
              </div>
            ) : (
              <div className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">
                Select a message to view its full conversation.
              </div>
            )}
          </article>
        </aside>
      </div>

      {modalRoot && isReplyModalOpen && selectedMessage
        ? createPortal(
            <div className="fixed inset-0 z-50 flex h-dvh w-dvw items-center justify-center overflow-y-auto bg-slate-950/60 px-4 py-6 backdrop-blur-sm">
              <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="reply-modal-title"
                className="my-auto w-full max-w-2xl rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl"
              >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
                  Reply to Client
                </p>
                <h3 id="reply-modal-title" className="mt-2 text-2xl font-semibold text-slate-900">
                  {selectedMessage.name}
                </h3>
                <p className="mt-1 text-sm text-slate-500">{selectedMessage.email}</p>
              </div>
              <button
                type="button"
                onClick={() => setIsReplyModalOpen(false)}
                className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:bg-white"
              >
                Close
              </button>
            </div>

            <div className="mt-6 space-y-4">
              <div>
                <label className="text-[11px] uppercase tracking-[0.18em] text-slate-400">
                  Reply Subject
                </label>
                <input
                  type="text"
                  value={replySubject}
                  onChange={(event) => setReplySubject(event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-slate-300 focus:bg-white"
                  placeholder="Re: your inquiry"
                />
              </div>

              <div>
                <label className="text-[11px] uppercase tracking-[0.18em] text-slate-400">
                  Reply Message
                </label>
                <textarea
                  value={replyMessage}
                  onChange={(event) => setReplyMessage(event.target.value)}
                  rows={10}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-slate-300 focus:bg-white"
                  placeholder="Write your reply here..."
                />
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setIsReplyModalOpen(false)}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={sendReplyDraft}
                  className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
                >
                  Send Reply
                </button>
              </div>
            </div>
              </div>
            </div>,
            modalRoot,
          )
        : null}

      {modalRoot && isDeleteModalOpen && messageToDelete
        ? createPortal(
            <div className="fixed inset-0 z-50 flex h-dvh w-dvw items-center justify-center overflow-y-auto bg-slate-950/60 px-4 py-6 backdrop-blur-sm">
              <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="delete-modal-title"
                className="my-auto w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl"
              >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-rose-400">
                  Delete confirmation
                </p>
                <h3
                  id="delete-modal-title"
                  className="mt-2 text-2xl font-semibold text-slate-900"
                >
                  Delete this message?
                </h3>
                <p className="mt-2 text-sm text-slate-500">
                  This will permanently remove the message from the inbox.
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
                {messageToDelete.name}
              </p>
              <p className="mt-1 text-sm text-slate-500">{messageToDelete.email}</p>
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
                onClick={() => deleteSelectedMessage(messageToDelete.id)}
                className="rounded-xl bg-rose-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-rose-700"
              >
                Delete Message
              </button>
            </div>
              </div>
            </div>,
            modalRoot,
          )
        : null}
    </section>
  );
}
