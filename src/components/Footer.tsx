import { Plus } from "lucide-react"
import { useState } from "react";
import { toast } from "sonner";


export function Footer({ onAddRow }: { onAddRow: () => void }) {
    const [value, setValue] = useState("true");
    const handleClick = () => {
      toast.info("Feature will be available soon");
    }
  return (
    <div className="sticky bottom-0 z-50 w-full border-t border-t-[#EEEEEE] pt-1 pr-4 pl-8 gap-6 bg-white">
      <div className="flex flex-row w-fit h-fit">
        <div className={`w-fit h-full px-4 py-2.5 hover:bg-emerald-50 font-[600] text-[16px] ${value === "All Orders" ? "border-t-[#4B6A4F] border-t-2 bg-[#E8F0E9] text-[#3E5741]" : "text-[#757575]"}`} onClick={() => { setValue("All Orders");handleClick()}}>All Orders</div>
        <div className={`w-fit h-full px-4 py-2.5 hover:bg-emerald-50 font-[600] text-[16px] ${value === "Pending" ? "border-t-[#4B6A4F] border-t-2 bg-[#E8F0E9] text-[#3E5741]" : "text-[#757575]"}`} onClick={() => { setValue("Pending");handleClick()}}>Pending</div>
        <div className={`w-fit h-full px-4 py-2.5 hover:bg-emerald-50 font-[600] text-[16px] ${value === "Reviewed" ? "border-t-[#4B6A4F] border-t-2 bg-[#E8F0E9] text-[#3E5741]" : "text-[#757575]"}`} onClick={() => { setValue("Reviewed");handleClick()}}>Reviewed</div>
        <div className={`w-fit h-full px-4 py-2.5 hover:bg-emerald-50 font-[600] text-[16px] ${value === "Arrived" ? "border-t-[#4B6A4F] border-t-2 bg-[#E8F0E9] text-[#3E5741]" : "text-[#757575]"}`} onClick={() => { setValue("Arrived");handleClick()}}>Arrived</div>
        <div className={`w-fit h-full px-1 py-2 hover:bg-emerald-50 font-[600] text-[16px] ${value === "Add New" ? "border-t-[#4B6A4F] border-t-2 bg-[#E8F0E9] text-[#3E5741]" : "text-[#757575]"}`} onClick={() =>  { setValue("Add New"); onAddRow(); toast.success('New row added!'); }}>
          <Plus className="p-1 h-7 w-7"/>
        </div>
      </div>
    </div>
  )
}

