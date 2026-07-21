"use client";

import { useState } from "react";
import { Download, MoreHorizontal, Pill, Search, Plus, Pencil } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { downloadCSV } from "@/lib/csv";
import { InventoryDrawer } from "@/components/inventory/InventoryDrawer";
import { Panel } from "@/components/ui/Panel";
import { StatusBadge } from "@/components/ui/StatusBadge";

type InventoryData = {
  id: string;
  medicine: string;
  potency: string;
  manufacturer: string;
  batch: string;
  stock: number;
  expiry: string;
  status: string;
};

export function InventoryTable({ items }: { items: InventoryData[] }) {
  const { notify } = useAppStore();
  const [query, setQuery] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryData | null>(null);

  const visible = items.filter((item) =>
    `${item.medicine} ${item.batch} ${item.manufacturer}`
      .toLowerCase()
      .includes(query.toLowerCase())
  );

  return (
    <Panel>
      <div className="table-toolbar">
        <div className="search-field">
          <Search size={17} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search medicine, batch or manufacturer"
          />
        </div>
        <select>
          <option>All stock status</option>
          <option>Low stock</option>
          <option>Expiring</option>
        </select>
        <button className="button button-primary" onClick={() => { setEditingItem(null); setDrawerOpen(true); }}>
          <Plus size={16} /> Add medicine
        </button>
        <button className="button button-secondary" onClick={() => {
          const csvData = visible.map(item => ({
            Medicine: item.medicine,
            Potency: item.potency,
            Manufacturer: item.manufacturer,
            Batch: item.batch,
            Stock: item.stock,
            Expiry: item.expiry,
            Status: item.status
          }));
          downloadCSV(csvData, "inventory_export");
          notify(`Exported ${visible.length} items to CSV.`);
        }}>
          <Download size={16} /> Export
        </button>
      </div>
      <div className="data-table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Medicine</th>
              <th>Manufacturer</th>
              <th>Batch</th>
              <th>Quantity</th>
              <th>Expiry</th>
              <th>Status</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {visible.map((item) => (
              <tr key={item.batch}>
                <td>
                  <div className="medicine-cell">
                    <span className="medicine-icon"><Pill size={17} /></span>
                    <span>
                      <strong>{item.medicine}</strong>
                      <small>{item.potency}</small>
                    </span>
                  </div>
                </td>
                <td>{item.manufacturer}</td>
                <td><code>{item.batch}</code></td>
                <td><strong>{item.stock}</strong> units</td>
                <td>{item.expiry}</td>
                <td><StatusBadge status={item.status} /></td>
                <td>
                  <div className="row-actions">
                    <button className="icon-button" onClick={() => { setEditingItem(item); setDrawerOpen(true); }}>
                      <Pencil size={15} />
                    </button>
                    <button className="icon-button"><MoreHorizontal size={15} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {drawerOpen && (
        <InventoryDrawer
          item={editingItem}
          onClose={() => { setDrawerOpen(false); setEditingItem(null); }}
        />
      )}
    </Panel>
  );
}
