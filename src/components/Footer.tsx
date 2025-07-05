import { Plus } from "lucide-react"
import { useState } from "react";
import { toast } from "sonner";


export function Footer({ onAddRow }: { onAddRow: () => void }) {
    const [value, setValue] = useState("true");
  return (
    <div className="bg-white px-12 py-0.5 font-medium h-12 sticky bottom-0 z-50 flex items-center justify-start border-t border-gray-200">
        <div className={`w-fit h-full px-4 py-3 hover:bg-emerald-50 ${value === "All Orders" ? "border-t-emerald-900 border-t-2 bg-emerald-100" : ""}`} onClick={() => setValue("All Orders")}>All Orders</div>
        <div className={`w-fit h-full px-4 py-3 hover:bg-emerald-50 ${value === "Pending" ? "border-t-emerald-900 border-t-2 bg-emerald-100" : ""}`} onClick={() => setValue("Pending")}>Pending</div>
        <div className={`w-fit h-full px-4 py-3 hover:bg-emerald-50 ${value === "Reviewed" ? "border-t-emerald-900 border-t-2 bg-emerald-100" : ""}`} onClick={() => setValue("Reviewed")}>Reviewed</div>
        <div className={`w-fit h-full px-4 py-3 hover:bg-emerald-50 ${value === "Arrived" ? "border-t-emerald-900 border-t-2 bg-emerald-100" : ""}`} onClick={() => setValue("Arrived")}>Arrived</div>
        <div className={`w-fit h-full px-4 py-4 hover:bg-emerald-50 ${value === "Add New" ? "border-t-emerald-900 border-t-2 bg-emerald-100" : ""}`} onClick={() => { setValue("Add New"); onAddRow(); toast.success('New row added!'); }}>
          <Plus size={16} />
        </div>
    </div>
  )
}

