import type { Column } from "../types/Column";
export const initialColumns: Column[] = [
  { key: 'jobRequest', header: 'Job Request', visible: true, sortable: true, class:"bg-[#EEEEEE] text-[#757575]", icon: "Briefcase.svg" },
  { key: 'submitted', header: 'Submitted', visible: true, sortable: true, class:"bg-[#EEEEEE] text-[#757575]", icon:"Calendar.svg" },
  { key: 'status', header: 'Status', visible: true, sortable: true, class:"bg-[#EEEEEE] text-[#757575]", icon: "Chevron Circle.svg" },
  { key: 'submitter', header: 'Submitter', visible: true, sortable: true, class:"bg-[#EEEEEE] text-[#757575]", icon: "Person.svg" },
  { key: 'url', header: 'URL', visible: true, sortable: true, class:"bg-[#EEEEEE] text-[#757575]", icon: "Globe.svg" },
  { key: 'assigned', header: 'Assigned', visible: true, sortable: true, class:"bg-[#E8F0E9] text-[#666C66]", icon: "Emoji.svg" },
  { key: 'priority', header: 'Priority', visible: true, sortable: false, class:"bg-[#EAE3FC] text-[#655C80]", icon: ""  },
  { key: 'dueDate', header: 'Due Date', visible: true, sortable: false, class:"bg-[#EAE3FC] text-[#655C80]", icon: ""  },
  { key: 'estValue', header: 'Est. Value', visible: true, sortable: false, class:"bg-[#FFE9E0] text-[#8C6C62]", icon: ""  }
];