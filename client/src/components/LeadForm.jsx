/**
 * LeadForm.jsx
 * Path: client/src/components/LeadForm.jsx
 *
 * Reusable form for creating or editing a lead.
 * Pass initialData to pre-fill for editing.
 */

import React, { useState } from "react";
import { Input, Button, Alert } from "./ui";

const EMPTY = { name: "", email: "", company: "", phone: "", status: "Cold", notes: "" };

const LeadForm = ({ initialData = {}, onSubmit, onCancel, submitLabel = "Save lead" }) => {
  const [form, setForm] = useState({ ...EMPTY, ...initialData });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: "" }));
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!form.email.trim()) e.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Enter a valid email";
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    try {
      await onSubmit(form);
    } catch (err) {
      setServerError(err.response?.data?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <Alert message={serverError} />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Full name *"
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="Jane Smith"
          error={errors.name}
          autoFocus
        />
        <Input
          label="Email address *"
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          placeholder="jane@acme.com"
          error={errors.email}
        />
        <Input
          label="Company"
          name="company"
          value={form.company}
          onChange={handleChange}
          placeholder="Acme Corp"
        />
        <Input
          label="Phone"
          name="phone"
          value={form.phone}
          onChange={handleChange}
          placeholder="+1 555 000 0000"
        />
      </div>

      {/* Status selector */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-gray-700">Status</label>
        <div className="flex gap-2">
          {["Hot", "Warm", "Cold"].map((s) => {
            const colors = {
              Hot:  { active: "bg-red-600 text-white border-red-600",  idle: "border-surface-300 text-gray-600 hover:border-red-300" },
              Warm: { active: "bg-amber-500 text-white border-amber-500", idle: "border-surface-300 text-gray-600 hover:border-amber-300" },
              Cold: { active: "bg-blue-500 text-white border-blue-500",  idle: "border-surface-300 text-gray-600 hover:border-blue-300" },
            };
            const isActive = form.status === s;
            return (
              <button
                key={s}
                type="button"
                onClick={() => setForm((p) => ({ ...p, status: s }))}
                className={`flex-1 py-2 text-sm font-medium rounded-xl border transition-all duration-100 ${
                  isActive ? colors[s].active : colors[s].idle
                }`}
              >
                {s}
              </button>
            );
          })}
        </div>
      </div>

      {/* Notes */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-gray-700">Notes</label>
        <textarea
          name="notes"
          value={form.notes}
          onChange={handleChange}
          placeholder="Add context about this lead — how you met, their pain points, budget..."
          rows={3}
          className="input-base resize-none"
        />
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-2">
        <Button type="button" variant="ghost" onClick={onCancel} className="flex-1">
          Cancel
        </Button>
        <Button type="submit" loading={loading} className="flex-1">
          {loading ? "Saving..." : submitLabel}
        </Button>
      </div>
    </form>
  );
};

export default LeadForm;
