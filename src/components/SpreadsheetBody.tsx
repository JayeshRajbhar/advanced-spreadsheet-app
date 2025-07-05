// import {
//   ChevronDown,
//   ChevronUp,
//   Ellipsis,
//   Hash,
//   Link2,
//   Plus,
//   RefreshCw,
// } from 'lucide-react';
// import { toast } from 'sonner';
// import type { Task } from '../types/Task';
// import { getStatusColor } from '../constants/StatusColour';
// import { getPriorityColor } from '../constants/ColourPriority';
// import type { Column } from '../types/Column';

// export const SpreadsheetBody = ({tableRef}: {tableRef: React.RefObject<HTMLDivElement | null>}, addNewColumn: () => void, visibleColumns: Column[], handleColumnClick: (colKey: string) => void, handleSort: (key: keyof Task) => void) => {
//   return (
//     <div className="bg-white border border-gray-200 h-full">
//       <div ref={tableRef} className="overflow-auto h-full">
//         <table className="w-full">
//           <thead className="bg-gray-50 border-b border-l border-gray-200 sticky top-0 z-10">
//             <tr className="border-b border-gray-200 h-9">
//               <th className="w-10 border-r border-gray-200 px-2 py-1 text-left text-xs font-medium bg-white uppercase tracking-wider"></th>
//               <th className="border-r border-gray-200 bg-gray-200" colSpan={4}>
//                 <div className="flex justify-start items-center">
//                   <div className="flex justify-start bg-gray-100 rounded py-0.5 ml-2 pl-2 pr-3 text-gray-800 font-medium">
//                     <Link2 className="text-blue-500 hover:underline mr-2" /> Q3
//                     Financial Overview
//                   </div>
//                   <RefreshCw className="h-4 w-4 ml-3 text-amber-500" />
//                 </div>
//               </th>
//               <th className="bg-white border-r border-gray-200"></th>
//               <th className="border-r border-gray-200 bg-green-200 text-green-800 px-2 py-1">
//                 <div className="flex items-center w-full justify-center">
//                   <img
//                     src="split-green.svg"
//                     alt=""
//                     className="text-wrap inline-flex h-4 w-4 mr-2"
//                   />
//                   ABC
//                   <Ellipsis className="ml-1" />
//                 </div>
//               </th>
//               <th
//                 className="border-r border-gray-200 px-2 py-1 bg-purple-200 text-purple-800"
//                 colSpan={2}
//               >
//                 <div className="flex items-center w-full justify-center">
//                   <img
//                     src="split-svgrepo-com.svg"
//                     alt=""
//                     className="text-wrap inline-flex h-4 w-4 mr-2"
//                   />
//                   Answer a question
//                   <Ellipsis className="ml-1" />
//                 </div>
//               </th>
//               <th className="border-r border-gray-200 px-2 py-1 bg-orange-200 text-orange-800">
//                 <div className="flex items-center w-full justify-center">
//                   <img
//                     src="split-svgrepo-com.svg"
//                     alt=""
//                     className="text-wrap inline-flex h-4 w-4 mr-2"
//                   />
//                   Extract
//                   <Ellipsis className="ml-1" />
//                 </div>
//               </th>
//               <th
//                 className="flex justify-center items-center h-full border-r border-gray-200 px-2 py-1 text-gray-600 hover:bg-gray-100 cursor-pointer"
//                 onClick={() => {
//                   addNewColumn();
//                   toast.success('New column added!');
//                 }}
//               >
//                 <Plus size={28} />
//               </th>
//             </tr>
//             <tr>
//               <th className="border-r border-gray-200 w-10 px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                 <Hash size={20} />
//               </th>
//               {visibleColumns.map(column => (
//                 <th
//                   key={column.key}
//                   className={`border-r border-gray-200 px-2 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 relative group ${column.class}`}
//                   style={{ width: column.width }}
//                   onClick={e => {
//                     e.stopPropagation();
//                     handleColumnClick(column.key);
//                   }}
//                 >
//                   <div
//                     className={`flex items-center ${column.icon && column.key !== 'assigned' ? 'justify-between' : 'justify-center'}`}
//                   >
//                     <div className="flex items-center justify-center">
//                       {column.icon && (
//                         <column.icon className={`h-4 w-4 mr-2`} />
//                       )}
//                       <span className="flex items-center justify-center text-center pt-0.5">
//                         {column.header}
//                       </span>
//                     </div>
//                     {column.icon && column.key !== 'assigned' && (
//                       <span className="ml-3">
//                         {sortConfig?.direction === 'asc' ? (
//                           <ChevronUp
//                             size={16}
//                             onClick={() =>
//                               column.sortable &&
//                               handleSort(column.key as keyof Task)
//                             }
//                           />
//                         ) : (
//                           <ChevronDown
//                             size={16}
//                             onClick={() =>
//                               column.sortable &&
//                               handleSort(column.key as keyof Task)
//                             }
//                           />
//                         )}
//                       </span>
//                     )}
//                   </div>
//                 </th>
//               ))}
//             </tr>
//           </thead>
//           <tbody className="bg-white divide-y divide-gray-200">
//             {filteredTasks.map((task, rowIndex) => (
//               <tr
//                 key={task.id}
//                 className={`hover:bg-gray-50 ${
//                   selectedRow === rowIndex
//                     ? 'border-2 border-dashed border-red-300 bg-red-50'
//                     : ''
//                 }`}
//               >
//                 <td
//                   className={`border border-gray-200 px-3 py-2 text-sm text-gray-500 cursor-pointer hover:bg-gray-100 ${
//                     selectedRow === rowIndex
//                       ? 'bg-red-100 border-dashed border-red-300'
//                       : ''
//                   }`}
//                   onClick={() => handleRowClick(rowIndex)}
//                 >
//                   {task.id}
//                 </td>
//                 {visibleColumns.map(column => (
//                   <td
//                     key={`${task.id}-${column.key}`}
//                     className={`border border-gray-200 px-2 py-1 min-w-[110px] max-w-[300px] text-sm cursor-cell relative 
//                         ${
//                           selectedCell?.row === rowIndex &&
//                           selectedCell?.col === column.key
//                             ? 'bg-blue-50 ring-2 ring-blue-500 ring-inset'
//                             : ''
//                         }
//                         ${
//                           selectedRow === rowIndex
//                             ? 'bg-red-50 border-dashed border-red-300'
//                             : ''
//                         }
//                         ${
//                           selectedColumn === column.key
//                             ? 'bg-red-50 border-dashed border-red-300'
//                             : ''
//                         }
//                         ${
//                           column.key === 'status' || column.key === 'priority'
//                             ? 'flex border-0 h-11 items-center justify-center'
//                             : ''
//                         }
//                         ${
//                           column.key === 'submitted' ||
//                           column.key === 'dueDate' ||
//                           column.key === 'estValue'
//                             ? 'text-end'
//                             : ''
//                         }
//                         `}
//                     onClick={() => handleCellClick(rowIndex, column.key)}
//                     onDoubleClick={() =>
//                       handleCellDoubleClick(rowIndex, column.key)
//                     }
//                   >
//                     {editingCell?.row === rowIndex &&
//                     editingCell?.col === column.key ? (
//                       <input
//                         type="text"
//                         value={editValue}
//                         onChange={e => setEditValue(e.target.value)}
//                         onBlur={handleEditSubmit}
//                         onKeyDown={e => {
//                           if (e.key === 'Enter') handleEditSubmit();
//                           if (e.key === 'Escape') handleEditCancel();
//                         }}
//                         className="w-full px-1 py-0 text-sm border-none outline-none bg-transparent"
//                         autoFocus
//                       />
//                     ) : (
//                       <>
//                         {column.key === 'status' && task[column.key] ? (
//                           <span
//                             className={`inline-flex px-2 py-1 w-fit text-xs font-semibold rounded-full border ${getStatusColor(task[column.key])}`}
//                           >
//                             {task[column.key]}
//                           </span>
//                         ) : column.key === 'priority' && task[column.key] ? (
//                           <span
//                             className={`inline-flex px-2 py-1 text-xs font-semibold ${getPriorityColor(task[column.key])}`}
//                           >
//                             {task[column.key]}
//                           </span>
//                         ) : (
//                           <div className="text-gray-900 truncate">
//                             {formatValue(
//                               column.key,
//                               task[column.key as keyof Task]
//                             )}
//                           </div>
//                         )}
//                       </>
//                     )}
//                   </td>
//                 ))}
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// };

// export default SpreadsheetBody;
