import type { Column } from "../types/Column";
export const initialColumns: Column[] = [
  { key: 'jobRequest', header: 'Job Request', width: 300, visible: true, sortable: true, class:"", icon: "Briefcase.svg" },
  { key: 'submitted', header: 'Submitted', width: 120, visible: true, sortable: true, class:"", icon:"Calendar.svg" },
  { key: 'status', header: 'Status', width: 120, visible: true, sortable: true, class:"", icon: "Chevron Circle.svg" },
  { key: 'submitter', header: 'Submitter', width: 140, visible: true, sortable: true, class:"", icon: "Person.svg" },
  { key: 'url', header: 'URL', width: 160, visible: true, sortable: true, class:"", icon: "Globe.svg" },
  { key: 'assigned', header: 'Assigned', width: 140, visible: true, sortable: true, class:"bg-green-100 text-green-600", icon: "Emoji.svg" },
  { key: 'priority', header: 'Priority', width: 100, visible: true, sortable: false, class:"bg-purple-100 text-purple-600", icon: ""  },
  { key: 'dueDate', header: 'Due Date', width: 120, visible: true, sortable: false, class:"bg-purple-100 text-purple-600", icon: ""  },
  { key: 'estValue', header: 'Est. Value', width: 130, visible: true, sortable: false, class:"bg-orange-100 text-orange-600", icon: ""  }
];