"use client";

import { Check, ChevronRight, X } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/lib/store";
import { addInventoryItem, updateInventoryItem } from "@/app/actions/inventory";

export function InventoryDrawer({
  item,
  onClose,
}: {
  item?: any;
  onClose: () => void;
}) {
  const { notify } = useAppStore();
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  const [data, setData] = useState({
    medicineName: item?.medicine || "",
    potency: item?.potency || "",
    manufacturer: item?.manufacturer || "",
    batchNumber: item?.batch || "",
    quantity: item?.stock?.toString() || "",
    expiryDate: item?.expiry ? new Date(item.expiry).toISOString().split('T')[0] : "", // rough handling of string date to input
    unitCost: item?.unitCost?.toString() || "",
  });

  // Since expiry from table is "Sep 2026", we need a better parser if we want to prefill exact date
  // For simplicity, if we have an item we'll try to parse it, otherwise leave empty
  if (item && item.expiry && !data.expiryDate) {
    try {
      const d = new Date(item.expiry);
      if (!isNaN(d.getTime())) {
        data.expiryDate = d.toISOString().split('T')[0];
      }
    } catch(e) {}
  }

  const update = (key: keyof typeof data, value: string) =>
    setData((current) => ({ ...current, [key]: value }));

  const save = async () => {
    if (!data.medicineName || !data.batchNumber || !data.quantity || !data.expiryDate) {
      notify("Please fill all required fields (Name, Batch, Quantity, Expiry).");
      return;
    }

    setSaving(true);
    try {
      if (item?.id) {
        await updateInventoryItem(item.id, {
          medicineName: data.medicineName,
          potency: data.potency,
          manufacturer: data.manufacturer,
          batchNumber: data.batchNumber,
          quantity: parseInt(data.quantity, 10),
          expiryDate: data.expiryDate,
          unitCost: data.unitCost ? parseFloat(data.unitCost) : undefined,
        });
        notify(`${data.medicineName} was updated successfully.`);
      } else {
        await addInventoryItem({
          medicineName: data.medicineName,
          potency: data.potency,
          manufacturer: data.manufacturer,
          batchNumber: data.batchNumber,
          quantity: parseInt(data.quantity, 10),
          expiryDate: data.expiryDate,
          unitCost: data.unitCost ? parseFloat(data.unitCost) : 0,
        });
        notify(`${data.medicineName} was added successfully.`);
      }
      onClose();
      router.refresh();
    } catch (err: any) {
      notify(`Save failed: ${err.message || "Unknown error"}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="drawer-layer">
      <button
        className="drawer-scrim"
        aria-label="Close inventory drawer"
        onClick={onClose}
      />
      <aside className="drawer">
        <header className="drawer-header">
          <div>
            <span className="kicker">INVENTORY MANAGEMENT</span>
            <h2>{item ? "Edit Medicine" : "Add Medicine"}</h2>
          </div>
          <button className="icon-button" onClick={onClose}>
            <X size={19} />
          </button>
        </header>

        <div className="drawer-body">
          <div className="drawer-form">
            <label>
              Medicine Name *
              <input
                value={data.medicineName}
                onChange={(e) => update("medicineName", e.target.value)}
                autoFocus
                placeholder="e.g. Paracetamol"
              />
            </label>
            <div className="form-grid">
              <label>
                Potency / Strength
                <input
                  value={data.potency}
                  onChange={(e) => update("potency", e.target.value)}
                  placeholder="e.g. 500mg"
                />
              </label>
              <label>
                Manufacturer
                <input
                  value={data.manufacturer}
                  onChange={(e) => update("manufacturer", e.target.value)}
                  placeholder="e.g. Cipla"
                />
              </label>
            </div>
            
            <div className="form-grid">
              <label>
                Batch Number *
                <input
                  value={data.batchNumber}
                  onChange={(e) => update("batchNumber", e.target.value)}
                />
              </label>
              <label>
                Expiry Date *
                <input
                  type="date"
                  value={data.expiryDate}
                  onChange={(e) => update("expiryDate", e.target.value)}
                />
              </label>
            </div>

            <div className="form-grid">
              <label>
                Quantity (Units) *
                <input
                  type="number"
                  value={data.quantity}
                  onChange={(e) => update("quantity", e.target.value)}
                  placeholder="e.g. 100"
                />
              </label>
              <label>
                Unit Cost (₹)
                <input
                  type="number"
                  step="0.01"
                  value={data.unitCost}
                  onChange={(e) => update("unitCost", e.target.value)}
                  placeholder="e.g. 1.50"
                />
              </label>
            </div>
          </div>
        </div>

        <footer className="drawer-footer">
          <button className="button button-secondary" onClick={onClose}>
            Cancel
          </button>
          <button
            className="button button-primary"
            onClick={save}
            disabled={saving}
          >
            {saving ? "Saving..." : (item ? "Save changes" : "Add medicine")}
          </button>
        </footer>
      </aside>
    </div>
  );
}
