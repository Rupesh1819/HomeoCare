"use client";

import { useEffect, useState, useTransition } from "react";
import {
  Plus,
  Search,
  FlaskConical,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  FileSpreadsheet,
  X,
  Loader2,
  Tag,
  IndianRupee,
} from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Panel } from "@/components/ui/Panel";
import { useAppStore } from "@/lib/store";
import {
  getLabTests,
  createLabTest,
  updateLabTest,
  deleteLabTest,
  toggleLabTestStatus,
  seedDefaultLabTests,
} from "@/app/actions/lab";

type LabTestItem = {
  id: string;
  name: string;
  category: string;
  price: number;
  description: string;
  active: boolean;
  createdAt: string;
};

const CATEGORIES = ["All", "Blood Tests", "Urine Tests", "Radiology", "Cardiology", "Other"];

export default function LabMasterPage() {
  const { notify } = useAppStore();
  const [isPending, startTransition] = useTransition();
  const [tests, setTests] = useState<LabTestItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTest, setEditingTest] = useState<LabTestItem | null>(null);

  // Form State
  const [formName, setFormName] = useState("");
  const [formCategory, setFormCategory] = useState("Blood Tests");
  const [formPrice, setFormPrice] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formActive, setFormActive] = useState(true);

  // Delete Dialog State
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadTests = async () => {
    setLoading(true);
    try {
      const data = await getLabTests();
      setTests(data);
    } catch (err: any) {
      notify(`Failed to load lab tests: ${err.message || err}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTests();
  }, []);

  const openCreateModal = () => {
    setEditingTest(null);
    setFormName("");
    setFormCategory("Blood Tests");
    setFormPrice("");
    setFormDescription("");
    setFormActive(true);
    setIsModalOpen(true);
  };

  const openEditModal = (test: LabTestItem) => {
    setEditingTest(test);
    setFormName(test.name);
    setFormCategory(test.category);
    setFormPrice(test.price.toString());
    setFormDescription(test.description);
    setFormActive(test.active);
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!formName.trim()) {
      notify("Test name is required.");
      return;
    }
    const priceNum = parseFloat(formPrice);
    if (isNaN(priceNum) || priceNum < 0) {
      notify("Please enter a valid test price.");
      return;
    }

    startTransition(async () => {
      try {
        if (editingTest) {
          await updateLabTest(editingTest.id, {
            name: formName,
            category: formCategory,
            price: priceNum,
            description: formDescription,
            active: formActive,
          });
          notify("Lab test updated successfully!");
        } else {
          await createLabTest({
            name: formName,
            category: formCategory,
            price: priceNum,
            description: formDescription,
            active: formActive,
          });
          notify("New lab test created successfully!");
        }
        setIsModalOpen(false);
        loadTests();
      } catch (err: any) {
        notify(`Error: ${err.message || err}`);
      }
    });
  };

  const handleToggle = (id: string, currentActive: boolean) => {
    startTransition(async () => {
      try {
        await toggleLabTestStatus(id, !currentActive);
        setTests((prev) =>
          prev.map((t) => (t.id === id ? { ...t, active: !currentActive } : t))
        );
        notify(`Test ${!currentActive ? "enabled" : "disabled"}.`);
      } catch (err: any) {
        notify(`Failed to update status: ${err.message || err}`);
      }
    });
  };

  const handleDelete = async (id: string) => {
    startTransition(async () => {
      try {
        await deleteLabTest(id);
        setTests((prev) => prev.filter((t) => t.id !== id));
        setDeletingId(null);
        notify("Lab test deleted.");
      } catch (err: any) {
        notify(`Failed to delete test: ${err.message || err}`);
      }
    });
  };

  const filteredTests = tests.filter((t) => {
    const matchesCategory =
      selectedCategory === "All" || t.category === selectedCategory;
    const matchesSearch =
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="page-stack">
      <PageHeader
        title="Lab Test Master"
        description="Configure available diagnostic tests, categories, pricing, and active statuses."
        action={
          <button className="button button-primary" onClick={openCreateModal}>
            <Plus size={17} /> Add New Lab Test
          </button>
        }
      />

      {/* Category Tabs & Search Bar */}
      <Panel>
        <div className="toolbar" style={{ flexWrap: "wrap", gap: "1rem" }}>
          <div className="tab-group" style={{ overflowX: "auto", flex: 1 }}>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                className={`tab-item ${selectedCategory === cat ? "tab-item-active" : ""}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="input-with-icon" style={{ minWidth: 260 }}>
            <Search size={16} />
            <input
              type="text"
              placeholder="Search tests or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </Panel>

      {/* Tests Table */}
      <Panel>
        <div className="panel-heading">
          <div>
            <h3>Diagnostic Tests ({filteredTests.length})</h3>
            <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--text-muted)" }}>
              Manage price list and diagnostic offerings
            </p>
          </div>
        </div>
        {loading ? (
          <div style={{ padding: "3rem", textAlign: "center", color: "var(--text-muted)" }}>
            <Loader2 size={24} className="spin-icon" style={{ margin: "0 auto 10px" }} />
            Loading test master catalog...
          </div>
        ) : filteredTests.length === 0 ? (
          <div style={{ padding: "3rem", textAlign: "center", color: "var(--text-muted)" }}>
            <FlaskConical size={36} style={{ opacity: 0.3, marginBottom: 12 }} />
            <p style={{ fontWeight: 600, color: "var(--text-main)" }}>No Lab Tests Found</p>
            <p style={{ fontSize: "0.875rem" }}>
              {searchQuery
                ? "No test matches your search filter."
                : "Get started by adding your first lab test."}
            </p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Test Name</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Description</th>
                  <th>Status</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTests.map((test) => (
                  <tr key={test.id} style={{ opacity: test.active ? 1 : 0.6 }}>
                    <td>
                      <strong style={{ color: "var(--text-main)" }}>{test.name}</strong>
                    </td>
                    <td>
                      <span className="badge badge-neutral" style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                        <Tag size={12} /> {test.category}
                      </span>
                    </td>
                    <td>
                      <strong style={{ color: "var(--color-primary-600)" }}>
                        ₹{test.price.toLocaleString("en-IN")}
                      </strong>
                    </td>
                    <td style={{ fontSize: "0.85rem", color: "var(--text-muted)", maxWidth: 260 }}>
                      {test.description || "—"}
                    </td>
                    <td>
                      <button
                        type="button"
                        onClick={() => handleToggle(test.id, test.active)}
                        className={`badge ${test.active ? "badge-success" : "badge-warning"}`}
                        style={{ cursor: "pointer", border: "none" }}
                      >
                        {test.active ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                        {test.active ? "Active" : "Disabled"}
                      </button>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <div className="action-buttons" style={{ justifyContent: "flex-end" }}>
                        <button
                          className="button button-secondary button-sm"
                          onClick={() => openEditModal(test)}
                          title="Edit test"
                        >
                          <Edit2 size={14} /> Edit
                        </button>
                        <button
                          className="button button-danger-subtle button-sm"
                          onClick={() => setDeletingId(test.id)}
                          title="Delete test"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: 500 }}>
            <div className="modal-header">
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <FlaskConical size={22} className="text-primary" />
                <h3>{editingTest ? "Edit Lab Test" : "Add New Lab Test"}</h3>
              </div>
              <button className="icon-button" onClick={() => setIsModalOpen(false)}>
                <X size={18} />
              </button>
            </div>
            <div className="modal-body" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div>
                <label className="field-label">Test Name *</label>
                <input
                  type="text"
                  placeholder="e.g. CBC (Complete Blood Count)"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div>
                  <label className="field-label">Category *</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                  >
                    {CATEGORIES.filter((c) => c !== "All").map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="field-label">Price (₹) *</label>
                  <input
                    type="number"
                    placeholder="250"
                    value={formPrice}
                    onChange={(e) => setFormPrice(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="field-label">Description / Instructions (Optional)</label>
                <textarea
                  rows={3}
                  placeholder="e.g. 8-10 hours fasting required. Reports delivered in 4 hours."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                />
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 4 }}>
                <input
                  type="checkbox"
                  id="formActive"
                  checked={formActive}
                  onChange={(e) => setFormActive(e.target.checked)}
                />
                <label htmlFor="formActive" style={{ cursor: "pointer", fontSize: "0.9rem", fontWeight: 500 }}>
                  Active (Available for Doctor prescriptions)
                </label>
              </div>
            </div>
            <div className="modal-footer" style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
              <button
                className="button button-secondary"
                onClick={() => setIsModalOpen(false)}
                disabled={isPending}
              >
                Cancel
              </button>
              <button
                className="button button-primary"
                onClick={handleSave}
                disabled={isPending}
              >
                {isPending ? (
                  <>
                    <Loader2 size={16} className="spin-icon" /> Saving...
                  </>
                ) : editingTest ? (
                  "Update Test"
                ) : (
                  "Save Lab Test"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingId && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: 400 }}>
            <div className="modal-header">
              <h3>Confirm Deletion</h3>
              <button className="icon-button" onClick={() => setDeletingId(null)}>
                <X size={18} />
              </button>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to delete this lab test? This action cannot be undone.</p>
            </div>
            <div className="modal-footer" style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
              <button
                className="button button-secondary"
                onClick={() => setDeletingId(null)}
                disabled={isPending}
              >
                Cancel
              </button>
              <button
                className="button button-danger"
                onClick={() => handleDelete(deletingId)}
                disabled={isPending}
              >
                {isPending ? "Deleting..." : "Delete Test"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
