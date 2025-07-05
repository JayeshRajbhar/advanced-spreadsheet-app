import {
  useState,
  useCallback,
  useMemo,
  useRef,
  useEffect,
} from 'react';
import {
  ChevronDown,
  ChevronUp,
  Ellipsis,
} from 'lucide-react';
import SpreadsheetHeader from './SpreadsheetHeader';
import { initialColumns } from '../constants/initialColumns';
import { initialTasks } from '../constants/initialTasks';
import type { Task } from '../types/Task';
import type { Column } from '../types/Column';
import { Footer } from './Footer';
import { Toolbar } from './Toolbar';
import { toast } from 'sonner';
import { getStatusColor } from '../constants/StatusColour';
import { getPriorityColor } from '../constants/ColourPriority';


const createEmptyTask = (id: number, columns: Column[], editingCol?: string, editValue?: string): Task => {
  const base: Task = {
    id,
    jobRequest: '',
    submitted: '',
    status: '',
    submitter: '',
    url: '',
    assigned: '',
    priority: '',
    dueDate: '',
    estValue: 0,
  };
  columns.forEach(col => {
    if (!(col.key in base) && col.key !== 'id') {
      // @ts-expect-error: dynamic property
      base[col.key] = (editingCol && col.key === editingCol && editValue !== undefined) ? editValue : '';
    }
  });
  return base;
};

const SpreadsheetApp = () => {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [columns, setColumns] = useState<Column[]>(initialColumns);
  const tableRef = useRef<HTMLDivElement>(null);
  const [selectedCell, setSelectedCell] = useState<{
    row: number;
    col: string;
  } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Task;
    direction: 'asc' | 'desc';
  } | null>(null);
  const [showColumnMenu, setShowColumnMenu] = useState(false);
  const [editingCell, setEditingCell] = useState<{
    row: number;
    col: string;
  } | null>(null);
  const [editValue, setEditValue] = useState('');
  const [totalRows, setTotalRows] = useState(25);
  const [selectedRow, setSelectedRow] = useState<number | null>(null);
  const [selectedColumn, setSelectedColumn] = useState<string | null>(null);

  const unifiedData = useMemo(() => {
    const data = [...tasks];
    const emptyRowsCount = Math.max(0, totalRows - tasks.length);

    for (let i = 0; i < emptyRowsCount; i++) {
      const emptyRow = createEmptyTask(tasks.length + i + 1, columns);
      data.push(emptyRow);
    }

    return data;
  }, [tasks, columns, totalRows]);

  const filteredTasks = useMemo(() => {
    let filtered = unifiedData;

    if (searchTerm) {
      filtered = filtered.filter(task =>
        Object.values(task).some(value =>
          value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    if (sortConfig) {
    const key = sortConfig.key;
    const nonEmpty = filtered.filter(
      task => task[key] !== '' && task[key] !== null && task[key] !== undefined
    );
    const empty = filtered.filter(
      task => task[key] === '' || task[key] === null || task[key] === undefined
    );
    nonEmpty.sort((a, b) => {
      const aValue = a[key];
      const bValue = b[key];

      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
    filtered = [...nonEmpty, ...empty];
  }

    return filtered;
  }, [unifiedData, searchTerm, sortConfig]);

  const visibleColumns = useMemo(() => columns.filter(col => col.visible), [columns]);

  const handleSort = (key: keyof Task) => {
    setSortConfig(current => ({
      key,
      direction:
        current?.key === key && current.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const handleCellClick = (rowIndex: number, colKey: string) => {
    setSelectedCell({ row: rowIndex, col: colKey });
    setSelectedRow(null);
    setSelectedColumn(null);
    setEditingCell(null);
  };

  const handleRowClick = (rowIndex: number) => {
    setSelectedRow(rowIndex);
    setSelectedCell(null);
    setSelectedColumn(null);
    setEditingCell(null);
  };

  const handleColumnClick = (colKey: string) => {
    setSelectedColumn(colKey);
    setSelectedCell(null);
    setSelectedRow(null);
    setEditingCell(null);
  };

  const handleCellDoubleClick = useCallback(
    (rowIndex: number, colKey: string) => {
      const task = filteredTasks[rowIndex];
      setEditingCell({ row: rowIndex, col: colKey });
      
      if (colKey in task) {
        setEditValue(
          task[colKey as keyof Task] !== undefined &&
            task[colKey as keyof Task] !== null
            ? String(task[colKey as keyof Task])
            : ''
        );
      } else {
        setEditValue('');
      }
    },
    [filteredTasks]
  );

  const handleEditSubmit = useCallback(() => {
    if (!editingCell) return;

    const taskIndex = filteredTasks[editingCell.row].id - 1;
    const updatedTasks = [...tasks];

    if (taskIndex >= tasks.length) {
      const newTask = createEmptyTask(taskIndex + 1, columns, editingCell.col, editValue);
      updatedTasks.push(newTask);
    } else {
      updatedTasks[taskIndex] = {
        ...updatedTasks[taskIndex],
        [editingCell.col]: editValue,
      };
    }

    setTasks(updatedTasks);
    setEditingCell(null);
    setEditValue('');
  }, [editingCell, filteredTasks, tasks, columns, editValue]);

  const handleEditCancel = useCallback(() => {
    setEditingCell(null);
    setEditValue('');
  }, []);

  const deleteSelectedRow = useCallback(() => {
    if (selectedRow === null) return;
    
    const taskToDelete = filteredTasks[selectedRow];
    if (taskToDelete && taskToDelete.id <= tasks.length) {
      const updatedTasks = tasks.filter(task => task.id !== taskToDelete.id);
      const reindexedTasks = updatedTasks.map((task, index) => ({
        ...task,
        id: index + 1
      }));
      setTasks(reindexedTasks);
    }
    
    setTotalRows(prev => Math.max(1, prev - 1));
    setSelectedRow(null);
  }, [selectedRow, filteredTasks, tasks]);

  const deleteSelectedColumn = useCallback(() => {
    if (!selectedColumn) return;
    const updatedColumns = columns.filter(col => col.key !== selectedColumn);
    setColumns(updatedColumns);
    const updatedTasks: Task[] = tasks.map(task => {
      const newTask: Task = { ...task };
      delete ((newTask as unknown) as Record<string, unknown>)[selectedColumn];
      return newTask;
    });
    setTasks(updatedTasks);

    setSelectedColumn(null);
  }, [selectedColumn, columns, tasks]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (editingCell) {
        if (e.key === 'Enter') {
          handleEditSubmit();
        } else if (e.key === 'Escape') {
          handleEditCancel();
        }
        return;
      }

      if (!selectedCell) return;

      const maxRow = filteredTasks.length - 1;
      const currentColIndex = visibleColumns.findIndex(
        col => col.key === selectedCell.col
      );

      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          setSelectedCell(prev =>
            prev ? { ...prev, row: Math.max(0, prev.row - 1) } : null
          );
          break;
        case 'ArrowDown':
          e.preventDefault();
          setSelectedCell(prev =>
            prev ? { ...prev, row: Math.min(maxRow, prev.row + 1) } : null
          );
          break;
        case 'ArrowLeft':
          e.preventDefault();
          if (currentColIndex > 0) {
            setSelectedCell(prev =>
              prev
                ? { ...prev, col: String(visibleColumns[currentColIndex - 1].key) }
                : null
            );
          }
          break;
        case 'ArrowRight':
          e.preventDefault();
          if (currentColIndex < visibleColumns.length - 1) {
            setSelectedCell(prev =>
              prev
                ? { ...prev, col: String(visibleColumns[currentColIndex + 1].key) }
                : null
            );
          }
          break;
        case 'Enter':
          if (selectedCell) {
            handleCellDoubleClick(selectedCell.row, selectedCell.col);
          }
          break;
        case 'Delete':
        if (selectedRow !== null) {
          deleteSelectedRow();
        } else if (selectedColumn) {
          deleteSelectedColumn();
        }
        break;
        case 'Escape':
          setSelectedCell(null);
          setSelectedRow(null);
          setSelectedColumn(null);
          break;
      }
    },
    [
      selectedCell,
      selectedColumn,
      selectedRow,
      editingCell,
      visibleColumns,
      filteredTasks,
      handleCellDoubleClick,
      handleEditSubmit,
      handleEditCancel,
      deleteSelectedRow,
      deleteSelectedColumn,
    ]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const addNewColumn = () => {
    const newColumnKey = `column_${Date.now()}`;
    const newColumn: Column = {
      key: newColumnKey,
      header: 'New Column',
      width: 110,
      visible: true,
      sortable: true,
      class: '',
      icon: '',
    };

    setColumns([...columns, newColumn]);

    const updatedTasks = tasks.map(task => ({
      ...task,
      [newColumnKey]: '',
    }));
    setTasks(updatedTasks);
  };

  const addNewRow = () => {
    setTotalRows(prev => prev + 1);
  };

  const toggleColumnVisibility = (columnKey: keyof Task | string) => {
    setColumns(prev =>
      prev.map(col =>
        col.key === columnKey ? { ...col, visible: !col.visible } : col
      )
    );
  };

  const formatValue = (key: keyof Task | string, value: string | number) => {
    console.log(`Formatting value for key: ${key}, value: ${value}`);
    if (key === 'estValue' && value !== 0) {
      return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(Number(value) || 0);
    }
    if (key === 'url' && typeof value === 'string' && value) {
      return (
        <a
          href={`https://${value}`}
          className="text-blue-600 hover:text-blue-800 underline text-sm"
          target="_blank"
          rel="noopener noreferrer"
        >
          {value}
        </a>
      );
    }
    return value!==0 ? value : '';
  };

  return (
    <div className="min-h-screen w-full bg-gray-50 font-worksans">
      {/* Header */}
      <SpreadsheetHeader search={searchTerm} setSearchTerm={setSearchTerm} />

      {/* Toolbar */}
      {Toolbar(showColumnMenu, setShowColumnMenu, toggleColumnVisibility, columns)}

      {/* Main Content */}
      {/* <SpreadsheetBody tableRef={tableRef} addNewColumn={addNewColumn} visibleColumns={visibleColumns} handleColumnClick={handleColumnClick} handleSort={handleSort} sortConfig={sortConfig} filteredTasks={filteredTasks} /> */}
        {/* Spreadsheet */}
        <div className="bg-white border border-gray-200 h-full">
          <div ref={tableRef} className="overflow-auto h-full">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-l border-gray-200 sticky top-0 z-10">
                <tr className="border-b border-gray-200 h-9">
                  <th className="w-10 border-r border-gray-200 px-2 py-1 text-left text-xs font-medium bg-white uppercase tracking-wider"></th>
                  <th
                    className="border-r border-gray-200 bg-gray-200"
                    colSpan={4}
                  >
                    <div className="flex justify-start items-center">
                      <div className="flex justify-start bg-gray-100 rounded py-0.5 ml-2 pl-2 pr-3 text-gray-800 font-medium">
                        {/* <Link2 className="text-blue-500 hover:underline mr-2" /> */}
                        <img src="Link.svg" alt="link" />
                        {' '}
                        Q3 Financial Overview
                      </div>
                      {/* <RefreshCw className="h-4 w-4 ml-3 text-amber-500" /> */}
                      <img src="Arrow Sync.svg" alt="Sync" />
                    </div>
                  </th>
                  <th className="bg-white border-r border-gray-200"></th>
                  <th className="border-r border-gray-200 bg-green-200 text-green-800 px-2 py-1">
                    <div className="flex items-center w-full justify-center">
                      <img
                        src="Arrow_Split.svg"
                        alt="Split"
                        className="text-wrap inline-flex h-4 w-4 mr-2"
                      />
                      ABC
                      <Ellipsis className="ml-1" />
                    </div>
                  </th>
                  <th
                    className="border-r border-gray-200 px-2 py-1 bg-purple-200 text-purple-800"
                    colSpan={2}
                  >
                    <div className="flex items-center w-full justify-center">
                      <img
                        src="Arrow_Split.svg"
                        alt="Split"
                        className="text-wrap inline-flex h-4 w-4 mr-2"
                      />
                      Answer a question
                      <Ellipsis className="ml-1" />
                    </div>
                  </th>
                  <th className="border-r border-gray-200 px-2 py-1 bg-orange-200 text-orange-800">
                    <div className="flex items-center w-full justify-center">
                      <img
                        src="Arrow_Split.svg"
                        alt="Split"
                        className="text-wrap inline-flex h-4 w-4 mr-2"
                      />
                      Extract
                      <Ellipsis className="ml-1" />
                    </div>
                  </th>
                  <th
                    className="flex justify-center items-center h-full border-r border-gray-200 px-2 py-1 text-gray-600 hover:bg-gray-100 cursor-pointer"
                    onClick={() => {addNewColumn();toast.success('New column added!');}}
                  >
                    {/* <Plus size={28} /> */}
                    <img src="Add.svg" alt="Add column" />
                  </th>
                </tr>
                <tr>
                  <th className="border-r border-gray-200 w-10 px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {/* <Hash size={20} /> */}
                    <img src="Number Symbol.svg" alt="Hash" />
                  </th>
                  {visibleColumns.map(column => (
                    <th
                      key={column.key}
                      className={`border-r border-gray-200 px-2 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 relative group ${column.class}`}
                      style={{ width: column.width }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleColumnClick(column.key);
                      }}
                    >
                      <div
                        className={`flex items-center ${column.icon && column.key !== 'assigned' ? 'justify-between' : 'justify-center'}`}
                      >
                        <div className="flex items-center justify-center">
                          {column.icon && (
                            <img src={column.icon} alt={column.header} />
                          )}
                          <span className="flex items-center justify-center text-center pt-0.5">
                            {column.header}
                          </span>
                        </div>
                        {column.icon && column.key !== 'assigned' && (
                          <span className="ml-3">
                            {sortConfig?.direction === 'asc' ? (
                              <ChevronUp size={16} onClick={() => column.sortable && handleSort(column.key as keyof Task)}/>
                            ) : (
                              <ChevronDown size={16} onClick={() => column.sortable && handleSort(column.key as keyof Task)}/>
                            )}
                          </span>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTasks.map((task, rowIndex) => (
                  <tr key={task.id} className={`hover:bg-gray-50 ${
                    selectedRow === rowIndex ? 'border-2 border-dashed border-red-300 bg-red-50' : ''
                  }`}>
                    <td 
                      className={`border border-gray-200 px-3 py-2 text-sm text-gray-500 cursor-pointer hover:bg-gray-100 ${
                        selectedRow === rowIndex ? 'bg-red-100 border-dashed border-red-300' : ''
                      }`}
                      onClick={() => handleRowClick(rowIndex)}
                    >
                      {task.id}
                    </td>
                    {visibleColumns.map((column) => (
                      <td
                        key={`${task.id}-${column.key}`}
                        className={`border border-gray-200 px-2 py-1 min-w-[110px] max-w-[300px] text-sm cursor-cell relative 
                        ${
                          selectedCell?.row === rowIndex && selectedCell?.col === column.key
                            ? 'bg-blue-50 ring-2 ring-blue-500 ring-inset'
                            : ''
                        }
                        ${
                          selectedRow === rowIndex ? 'bg-red-50 border-dashed border-red-300' : ''
                        }
                        ${
                          selectedColumn === column.key ? 'bg-red-50 border-dashed border-red-300' : ''
                        }
                        ${
                          column.key === 'status' || column.key === 'priority'
                            ? 'flex border-0 h-11 items-center justify-center'
                            : ''
                        }
                        ${
                          column.key === 'submitted' || column.key === 'dueDate' || column.key === 'estValue'
                            ? 'text-end'
                            : ''
                        }
                        `}
                        onClick={() => handleCellClick(rowIndex, column.key)}
                        onDoubleClick={() => handleCellDoubleClick(rowIndex, column.key)}
                      >
                        {editingCell?.row === rowIndex && editingCell?.col === column.key ? (
                          <input
                            type="text"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onBlur={handleEditSubmit}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleEditSubmit();
                              if (e.key === 'Escape') handleEditCancel();
                            }}
                            className="w-full px-1 py-0 text-sm border-none outline-none bg-transparent"
                            autoFocus
                          />
                        ) : (
                          <>
                            {column.key === 'status' && task[column.key] ? (
                              <span className={`inline-flex px-2 py-1 w-fit text-xs font-semibold rounded-full border ${getStatusColor(task[column.key])}`}>
                                {task[column.key]}
                              </span>
                            ) : column.key === 'priority' && task[column.key] ? (
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold ${getPriorityColor(task[column.key])}`}>
                                {task[column.key]}
                              </span>
                            ) : (
                              <div className="text-gray-900 truncate">
                                {formatValue(column.key, task[column.key as keyof Task])}
                              </div>
                            )}
                          </>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      {/* Footer */}
      <Footer onAddRow={addNewRow} />
    </div>
  );
};

export default SpreadsheetApp;








// import React, {
//   useState,
//   useCallback,
//   useMemo,
//   useRef,
//   useEffect,
// } from 'react';
// import {
//   ChevronDown,
//   EyeOff,
//   ChevronUp,
//   ArrowDownToLine,
//   ArrowUpToLine,
//   ArrowDownUp,
//   ListFilter,
//   Ellipsis,
//   ChevronsRight,
//   RefreshCw,
//   Link2,
//   Plus,
//   Hash,
// } from 'lucide-react';
// import SpreadsheetHeader from './SpreadsheetHeader';
// import { initialColumns } from '../constants/initialColumns';
// import { initialTasks } from '../constants/initialTasks';
// import type { Task } from '../types/Task';
// import type { Column } from '../types/Column';
// import { getStatusColor } from '../constants/StatusColour';
// import { getPriorityColor } from '../constants/ColourPriority';
// import { toast } from 'sonner';
// import { TbArrowAutofitHeight } from 'react-icons/tb';
// import { FaRegShareFromSquare } from 'react-icons/fa6';
// import { Footer } from './Footer';


// const SpreadsheetApp: React.FC = () => {
//   const [tasks, setTasks] = useState<Task[]>(initialTasks);
//   const [columns, setColumns] = useState<Column[]>(initialColumns);
//   const tableRef = useRef<HTMLDivElement>(null);
//   const [selectedCell, setSelectedCell] = useState<{
//     row: number;
//     col: string;
//   } | null>(null);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [sortConfig, setSortConfig] = useState<{
//     key: keyof Task;
//     direction: 'asc' | 'desc';
//   } | null>(null);
//   const [showColumnMenu, setShowColumnMenu] = useState(false);
//   const [editingCell, setEditingCell] = useState<{
//     row: number;
//     col: string;
//   } | null>(null);
//   const [editValue, setEditValue] = useState('');
//   const [totalRows, setTotalRows] = useState(25);

//   // Create unified data array with empty rows
//   const unifiedData = useMemo(() => {
//     const data = [...tasks];
//     const emptyRowsCount = Math.max(0, totalRows - tasks.length);

//     for (let i = 0; i < emptyRowsCount; i++) {
//       const emptyRow: Task = {
//         id: tasks.length + i + 1,
//         jobRequest: '',
//         submitted: '',
//         status: '', // or a default status
//         submitter: '',
//         url: '',
//         assigned: '',
//         priority: '', // or a default priority
//         dueDate: '',
//         estValue: undefined,
//       };
//       columns.forEach(col => {
//         if (col.key !== 'id' && !(col.key in emptyRow)) {
//           (emptyRow as any)[col.key] = '';
//         }
//       });
//       data.push(emptyRow);
//     }

//     return data;
//   }, [tasks, columns, totalRows]);

//   // Filtering and sorting
//   const filteredTasks = useMemo(() => {
//     let filtered = unifiedData;

//     if (searchTerm) {
//       filtered = filtered.filter(task =>
//         Object.values(task).some(value =>
//           value.toString().toLowerCase().includes(searchTerm.toLowerCase())
//         )
//       );
//     }

//     if (sortConfig) {
//       filtered = [...filtered].sort((a, b) => {
//         const aValue = a[sortConfig.key];
//         const bValue = b[sortConfig.key];

//         if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
//         if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
//         return 0;
//       });
//     }

//     return filtered;
//   }, [unifiedData, searchTerm, sortConfig]);

//   const visibleColumns = columns.filter(col => col.visible);

//   const handleSort = (key: keyof Task) => {
//     setSortConfig(current => ({
//       key,
//       direction:
//         current?.key === key && current.direction === 'asc' ? 'desc' : 'asc',
//     }));
//   };

//   const handleCellClick = (rowIndex: number, colKey: string) => {
//     setSelectedCell({ row: rowIndex, col: colKey });
//     setEditingCell(null);
//   };

//   const handleCellDoubleClick = useCallback(
//     (rowIndex: number, colKey: string) => {
//       const task = filteredTasks[rowIndex];
//       setEditingCell({ row: rowIndex, col: colKey });
//       // setEditValue(task[colKey]?.toString() || '');
//       setEditValue(
//         task && task[colKey] !== undefined ? task[colKey]?.toString() : ''
//       );
//     },
//     [filteredTasks]
//   );

//   const handleEditSubmit = useCallback(() => {
//     if (!editingCell) return;

//     const taskIndex = filteredTasks[editingCell.row].id - 1;
//     const updatedTasks = [...tasks];

//     // If editing a row that doesn't exist in tasks yet, add it
//     if (taskIndex >= tasks.length) {
//       const newTask: Task = {
//         id: taskIndex + 1,
//         jobRequest: '',
//         submitted: '',
//         status: '',
//         submitter: '',
//         url: '',
//         assigned: '',
//         priority: '',
//         dueDate: '',
//         estValue: undefined,
//       };
//       columns.forEach(col => {
//         newTask[col.key] = col.key === editingCell.col ? editValue : '';
//       });
//       updatedTasks.push(newTask);
//     } else {
//       // Update existing task
//       updatedTasks[taskIndex] = {
//         ...updatedTasks[taskIndex],
//         [editingCell.col]: editValue,
//       };
//     }

//     setTasks(updatedTasks);
//     setEditingCell(null);
//     setEditValue('');
//   }, [editingCell, filteredTasks, tasks, columns, editValue]);

//   const handleEditCancel = useCallback(() => {
//     setEditingCell(null);
//     setEditValue('');
//   }, []);

//   const handleKeyDown = useCallback(
//     (e: KeyboardEvent) => {
//       if (editingCell) {
//         if (e.key === 'Enter') {
//           handleEditSubmit();
//         } else if (e.key === 'Escape') {
//           handleEditCancel();
//         }
//         return;
//       }

//       if (!selectedCell) return;

//       const maxRow = filteredTasks.length - 1;
//       const currentColIndex = visibleColumns.findIndex(
//         col => col.key === selectedCell.col
//       );

//       switch (e.key) {
//         case 'ArrowUp':
//           e.preventDefault();
//           setSelectedCell(prev =>
//             prev ? { ...prev, row: Math.max(0, prev.row - 1) } : null
//           );
//           break;
//         case 'ArrowDown':
//           e.preventDefault();
//           setSelectedCell(prev =>
//             prev ? { ...prev, row: Math.min(maxRow, prev.row + 1) } : null
//           );
//           break;
//         case 'ArrowLeft':
//           e.preventDefault();
//           if (currentColIndex > 0) {
//             setSelectedCell(prev =>
//               prev
//                 ? { ...prev, col: visibleColumns[currentColIndex - 1].key }
//                 : null
//             );
//           }
//           break;
//         case 'ArrowRight':
//           e.preventDefault();
//           if (currentColIndex < visibleColumns.length - 1) {
//             setSelectedCell(prev =>
//               prev
//                 ? { ...prev, col: visibleColumns[currentColIndex + 1].key }
//                 : null
//             );
//           }
//           break;
//         case 'Enter':
//           if (selectedCell) {
//             handleCellDoubleClick(selectedCell.row, selectedCell.col);
//           }
//           break;
//         case 'Escape':
//           setSelectedCell(null);
//           break;
//       }
//     },
//     [
//       selectedCell,
//       editingCell,
//       visibleColumns,
//       filteredTasks,
//       handleCellDoubleClick,
//       handleEditSubmit,
//       handleEditCancel,
//     ]
//   );

//   useEffect(() => {
//     window.addEventListener('keydown', handleKeyDown);
//     return () => window.removeEventListener('keydown', handleKeyDown);
//   }, [handleKeyDown]);

//   const addNewColumn = () => {
//     const newColumnKey = `column_${Date.now()}`;
//     const newColumn: Column = {
//       key: newColumnKey,
//       header: 'New Column',
//       width: 110,
//       visible: true,
//       sortable: true,
//       class: '', // Add a default class value
//     };

//     setColumns([...columns, newColumn]);

//     // Add the new column to existing tasks
//     const updatedTasks = tasks.map(task => ({
//       ...task,
//       [newColumnKey]: '',
//     }));
//     setTasks(updatedTasks);
//   };

//   const addNewRow = () => {
//     setTotalRows(prev => prev + 1);
//   };

//   const toggleColumnVisibility = (columnKey: keyof Task) => {
//     setColumns(prev =>
//       prev.map(col =>
//         col.key === columnKey ? { ...col, visible: !col.visible } : col
//       )
//     );
//   };

//   const formatValue = (key: keyof Task, value: string | number) => {
//     if (key === 'estValue') {
//       return new Intl.NumberFormat('en-US', {
//         style: 'currency',
//         currency: 'INR',
//         minimumFractionDigits: 0,
//         maximumFractionDigits: 0,
//       }).format(value as number);
//     }
//     if (key === 'url') {
//       return (
//         <a
//           href={`https://${value}`}
//           className="text-blue-600 hover:text-blue-800 underline text-sm"
//         >
//           {value}
//         </a>
//       );
//     }
//     return value;
//   };

//   const handleToolbarClick = (name: string) => {
//     console.log(`${name} clicked`);
//   };

//   return (
//     <div className="min-h-screen bg-gray-50 font-worksans">
//       {/* Header */}
//       <SpreadsheetHeader search={searchTerm} setSearchTerm={setSearchTerm} />

//       {/* Toolbar */}
//       <div className="flex items-center pl-5 pr-2 py-1.5 border-b border-gray-200 bg-white font-medium gap-2">
//         <span
//           onClick={() => toast.info('Toolbar is already visible!')}
//           className="font-semibold text-gray-700 text-lg mr-4"
//         >
//           Tool bar <ChevronsRight className="inline-flex h-7 w-7 mb-1" />
//         </span>
//         <button
//           onClick={() => setShowColumnMenu(!showColumnMenu)}
//           className="flex items-center space-x-2 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded-lg relative"
//         >
//           <EyeOff size={20} />
//           <span>Hide fields</span>
//           <ChevronDown className="w-4 h-4" />
//           {showColumnMenu && (
//             <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
//               {columns.map(column => (
//                 <label
//                   key={column.key}
//                   className="flex items-center px-3 py-2 hover:bg-gray-50 cursor-pointer"
//                 >
//                   <input
//                     type="checkbox"
//                     checked={column.visible}
//                     onChange={() => toggleColumnVisibility(column.key)}
//                     className="mr-2"
//                   />
//                   <span className="text-sm">{column.header}</span>
//                 </label>
//               ))}
//             </div>
//           )}
//         </button>
//         <button
//           onClick={() =>
//             toast.info(
//               'Sort functionality is already implemented for every column!'
//             )
//           }
//           className="flex items-center gap-1 px-2 py-1 text-gray-600 hover:bg-gray-100 rounded"
//         >
//           <ArrowDownUp size={20} /> Sort
//         </button>
//         <button
//           onClick={() =>
//             toast.info('Filter functionality will be implemented soon!')
//           }
//           className="flex items-center gap-1 px-2 py-1 text-gray-600 hover:bg-gray-100 rounded"
//         >
//           <ListFilter size={20} /> Filter
//         </button>
//         <button
//           onClick={() =>
//             toast.info('Cell view functionality will be implemented soon!')
//           }
//           className="flex items-center gap-1 px-2 py-1 text-gray-600 hover:bg-gray-100 rounded"
//         >
//           {/* <img src="UpDown.png" className='w-4 h-4 border-t-2 border-b-2 border-l-2 rounded-tl-sm rounded-bl-sm pl-1' alt="Cell view"/> */}
//           <TbArrowAutofitHeight size={20} /> Cell view
//         </button>
//         <div className="flex-1" />
//         <button
//           onClick={() => toast.warning('Login to import data!')}
//           className="flex items-center gap-1 px-3 py-1 border-[1px] border-gray-300 text-gray-600 hover:bg-gray-100 rounded-md"
//         >
//           <ArrowDownToLine size={16} /> Import
//         </button>
//         <button
//           onClick={() => handleToolbarClick('Export')}
//           className="flex items-center gap-1 px-3 py-1 border-[1px] border-gray-300 text-gray-600 hover:bg-gray-100 rounded-md"
//         >
//           <ArrowUpToLine size={16} /> Export
//         </button>
//         <button
//           onClick={() => toast.warning('Login to share data!')}
//           className="flex items-center gap-1 px-3 py-1 border-[1px] border-gray-300 text-gray-600 hover:bg-gray-100 rounded-md"
//         >
//           <FaRegShareFromSquare size={16} /> Share
//         </button>
//         <button
//           onClick={() => toast.success('New action created!')}
//           className="inline-flex px-5 py-1.5 bg-green-600 text-white rounded-lg shadow font-semibold hover:bg-green-700"
//         >
//           <img
//             src="split-svgrepo-com.svg"
//             alt=""
//             className="h-3 w-4 mt-1 mr-1"
//           />{' '}
//           New Action
//         </button>
//       </div>

//       {/* Main Content */}
//       <div className="pb-4">
//         {/* Spreadsheet */}
//         <div className="bg-white border border-gray-200 h-full">
//           <div ref={tableRef} className="overflow-auto h-full">
//             <table className="w-full">
//               <thead className="bg-gray-50 border-b border-l border-gray-200 sticky top-0 z-10">
//                 <tr className="border-b border-gray-200 h-9">
//                   <th className="w-10 border-r border-gray-200 px-2 py-1 text-left text-xs font-medium bg-white uppercase tracking-wider"></th>
//                   <th
//                     className="border-r border-gray-200 bg-gray-200"
//                     colSpan={4}
//                   >
//                     <div className="flex justify-start items-center">
//                       <div className="flex justify-start bg-gray-100 rounded py-0.5 ml-2 pl-2 pr-3 text-gray-800 font-medium">
//                         <Link2 className="text-blue-500 hover:underline mr-2" />{' '}
//                         Q3 Financial Overview
//                       </div>
//                       <RefreshCw className="h-4 w-4 ml-3 text-amber-500" />
//                     </div>
//                   </th>
//                   <th className="bg-white border-r border-gray-200"></th>
//                   <th className="border-r border-gray-200 bg-green-200 text-green-800 px-2 py-1">
//                     <div className="flex items-center w-full justify-center">
//                       <img
//                         src="split-green.svg"
//                         alt=""
//                         className="text-wrap inline-flex h-4 w-4 mr-2"
//                       />
//                       ABC
//                       <Ellipsis className="ml-1" />
//                     </div>
//                   </th>
//                   <th
//                     className="border-r border-gray-200 px-2 py-1 bg-purple-200 text-purple-800"
//                     colSpan={2}
//                   >
//                     <div className="flex items-center w-full justify-center">
//                       <img
//                         src="split-svgrepo-com.svg"
//                         alt=""
//                         className="text-wrap inline-flex h-4 w-4 mr-2"
//                       />
//                       Answer a question
//                       <Ellipsis className="ml-1" />
//                     </div>
//                   </th>
//                   <th className="border-r border-gray-200 px-2 py-1 bg-orange-200 text-orange-800">
//                     <div className="flex items-center w-full justify-center">
//                       <img
//                         src="split-svgrepo-com.svg"
//                         alt=""
//                         className="text-wrap inline-flex h-4 w-4 mr-2"
//                       />
//                       Extract
//                       <Ellipsis className="ml-1" />
//                     </div>
//                   </th>
//                   <th
//                     className="flex justify-center items-center h-full border-r border-gray-200 px-2 py-1 text-gray-600 hover:bg-gray-100 cursor-pointer"
//                     onClick={addNewColumn}
//                   >
//                     <Plus size={28} />
//                   </th>
//                 </tr>
//                 <tr>
//                   <th className="border-r border-gray-200 w-10 px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     <Hash size={20} />
//                   </th>
//                   {visibleColumns.map(column => (
//                     <th
//                       key={column.key}
//                       className={`border-r border-gray-200 px-2 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 relative group ${column.class}`}
//                       style={{ width: column.width }}
//                       onClick={() => column.sortable && handleSort(column.key)}
//                     >
//                       <div
//                         className={`flex items-center ${column.icon && column.key !== 'assigned' ? 'justify-between' : 'justify-center'}`}
//                       >
//                         <div className="flex items-center justify-center">
//                           {column.icon && (
//                             <column.icon className={`h-4 w-4 mr-2`} />
//                           )}
//                           <span className="flex items-center justify-center text-center pt-0.5">
//                             {column.header}
//                           </span>
//                         </div>
//                         {column.icon && column.key !== 'assigned' && (
//                           <span className="ml-3">
//                             {sortConfig?.direction === 'asc' ? (
//                               <ChevronUp size={16} />
//                             ) : (
//                               <ChevronDown size={16} />
//                             )}
//                           </span>
//                         )}
//                       </div>
//                     </th>
//                   ))}
//                 </tr>
//               </thead>
//               <tbody className="bg-white divide-y divide-gray-200">
//                 {filteredTasks.map((task, rowIndex) => (
//                   <tr key={task.id} className="hover:bg-gray-50">
//                     <td className="border-r border-gray-200 px-3 py-2 text-sm text-gray-500">
//                       {task.id}
//                     </td>
//                     {visibleColumns.map(column => (
//                       <td
//                         key={`${task.id}-${column.key}`}
//                         className={`border-r border-gray-200 px-2 py-1 min-w-[110px] max-w-[300px] text-sm cursor-cell relative 
//                         ${
//                           selectedCell?.row === rowIndex &&
//                           selectedCell?.col === column.key
//                             ? 'bg-blue-50 ring-2 ring-blue-500 ring-inset'
//                             : ''
//                         }
//                         ${
//                           column.key === 'status' || column.key === 'priority'
//                             ? 'flex justify-center items-center'
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
//                         onClick={() => handleCellClick(rowIndex, column.key)}
//                         onDoubleClick={() =>
//                           handleCellDoubleClick(rowIndex, column.key)
//                         }
//                       >
//                         {editingCell?.row === rowIndex &&
//                         editingCell?.col === column.key ? (
//                           <input
//                             type="text"
//                             value={editValue}
//                             onChange={e => setEditValue(e.target.value)}
//                             onBlur={handleEditSubmit}
//                             onKeyDown={e => {
//                               if (e.key === 'Enter') handleEditSubmit();
//                               if (e.key === 'Escape') handleEditCancel();
//                             }}
//                             className="w-full px-1 py-0 text-sm border-none outline-none bg-transparent"
//                             autoFocus
//                           />
//                         ) : (
//                           <>
//                             {column.key === 'status' && task[column.key] ? (
//                               <span
//                                 className={`inline-flex px-2 py-1 w-fit text-xs font-semibold rounded-full border ${getStatusColor(task[column.key])}`}
//                               >
//                                 {task[column.key]}
//                               </span>
//                             ) : column.key === 'priority' &&
//                               task[column.key] ? (
//                               <span
//                                 className={`inline-flex px-2 py-1 text-xs font-semibold ${getPriorityColor(task[column.key])}`}
//                               >
//                                 {task[column.key]}
//                               </span>
//                             ) : (
//                               <div className="text-gray-900 truncate">
//                                 {formatValue(column.key, task[column.key])}
//                               </div>
//                             )}
//                           </>
//                         )}
//                       </td>
//                     ))}
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         </div>

//         {/* Status indicator */}
//         {/* <div className="mt-4 text-sm text-gray-500">
//           Showing {filteredTasks.length} of {tasks.length} items
//           {selectedCell && (
//             <span className="ml-4">
//               Selected: Row {selectedCell.row + 1}, Column {visibleColumns.find(col => col.key === selectedCell.col)?.header}
//             </span>
//           )}
//         </div> */}
//       </div>

//       {/* Footer */}
//       <Footer onAddRow={addNewRow} />
//     </div>
//   );
// };

// export default SpreadsheetApp;










// import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
// import {
//   ChevronDown,
//   EyeOff,
//   ChevronUp,
//   ArrowDownToLine,
//   ArrowUpToLine,
//   ArrowDownUp,
//   ListFilter,
//   Ellipsis,
//   ChevronsRight,
//   RefreshCw,
//   Link2,
//   Plus,
//   Hash
// } from 'lucide-react';
// import SpreadsheetHeader from './SpreadsheetHeader';
// import { initialColumns } from '../constants/initialColumns';
// import { initialTasks } from '../constants/initialTasks';
// import type { Task } from '../types/Task';
// import type { Column } from '../types/Column';
// import { getStatusColor } from '../constants/StatusColour';
// import { getPriorityColor } from '../constants/ColourPriority';
// import { toast } from 'sonner';
// import { TbArrowAutofitHeight } from "react-icons/tb";
// import { FaRegShareFromSquare } from "react-icons/fa6";
// import { Footer } from './Footer';

// // const tabs = ['All Orders', 'Pending', 'Reviewed', 'Arrived'];

// const SpreadsheetApp: React.FC = () => {
//   const [tasks] = useState<Task[]>(initialTasks);
//   const [columns, setColumns] = useState<Column[]>(initialColumns);
//   const tableRef = useRef<HTMLDivElement>(null);
//   const [selectedCell, setSelectedCell] = useState<{ row: number; col: string } | null>(null);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [sortConfig, setSortConfig] = useState<{ key: keyof Task; direction: 'asc' | 'desc' } | null>(null);
//   const [showColumnMenu, setShowColumnMenu] = useState(false);

//   // Filtering and sorting
//   const filteredTasks = useMemo(() => {
//     let filtered = tasks;

//     if (searchTerm) {
//       filtered = filtered.filter(task =>
//         Object.values(task).some(value =>
//           value.toString().toLowerCase().includes(searchTerm.toLowerCase())
//         )
//       );
//     }

//     if (sortConfig) {
//       filtered = [...filtered].sort((a, b) => {
//         const aValue = a[sortConfig.key];
//         const bValue = b[sortConfig.key];

//         if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
//         if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
//         return 0;
//       });
//     }

//     return filtered;
//   }, [tasks, searchTerm, sortConfig]);

//   const handleSort = (key: keyof Task) => {
//     setSortConfig(current => ({
//       key,
//       direction: current?.key === key && current.direction === 'asc' ? 'desc' : 'asc'
//     }));
//   };

//   const handleCellClick = (rowIndex: number, colKey: string) => {
//     setSelectedCell({ row: rowIndex, col: colKey });
//   };

//   const handleKeyDown = useCallback((e: KeyboardEvent) => {
//     if (!selectedCell) return;

//     const visibleColumns = columns.filter(col => col.visible);
//     const currentColIndex = visibleColumns.findIndex(col => col.key === selectedCell.col);
//     const maxRow = filteredTasks.length - 1;

//     switch (e.key) {
//       case 'ArrowUp':
//         e.preventDefault();
//         setSelectedCell(prev => prev ? { ...prev, row: Math.max(0, prev.row - 1) } : null);
//         break;
//       case 'ArrowDown':
//         e.preventDefault();
//         setSelectedCell(prev => prev ? { ...prev, row: Math.min(maxRow, prev.row + 1) } : null);
//         break;
//       case 'ArrowLeft':
//         e.preventDefault();
//         if (currentColIndex > 0) {
//           setSelectedCell(prev => prev ? { ...prev, col: visibleColumns[currentColIndex - 1].key } : null);
//         }
//         break;
//       case 'ArrowRight':
//         e.preventDefault();
//         if (currentColIndex < visibleColumns.length - 1) {
//           setSelectedCell(prev => prev ? { ...prev, col: visibleColumns[currentColIndex + 1].key } : null);
//         }
//         break;
//       case 'Escape':
//         setSelectedCell(null);
//         break;
//     }
//   }, [selectedCell, columns, filteredTasks]);

//   useEffect(() => {
//     document.addEventListener('keydown', handleKeyDown);
//     return () => document.removeEventListener('keydown', handleKeyDown);
//   }, [handleKeyDown]);

//   const toggleColumnVisibility = (columnKey: keyof Task) => {
//     setColumns(prev => prev.map(col =>
//       col.key === columnKey ? { ...col, visible: !col.visible } : col
//     ));
//   };

//   const formatValue = (key: keyof Task, value: string | number) => {
//     if (key === 'estValue') {
//       return new Intl.NumberFormat('en-US', {
//         style: 'currency',
//         currency: 'INR',
//         minimumFractionDigits: 0,
//         maximumFractionDigits: 0
//       }).format(value as number);
//     }
//     if (key === 'url') {
//       return (
//         <a href={`https://${value}`} className="text-blue-600 hover:text-blue-800 underline text-sm">
//           {value}
//         </a>
//       );
//     }
//     return value;
//   };

//   const handleToolbarClick = (name: string) => {
//     console.log(`${name} clicked`);
//   };

//   const visibleColumns = columns.filter(col => col.visible);

//   return (
//     <div className="min-h-screen bg-gray-50 font-worksans">
//       {/* Header */}
//       <SpreadsheetHeader search={searchTerm} setSearchTerm={setSearchTerm} />

//       {/* Toolbar */}
//       <div className="flex items-center pl-5 pr-2 py-1.5 border-b border-gray-200 bg-white font-medium gap-2">
//         <span onClick={() => toast.info("Toolbar is already visible!")} className="font-semibold text-gray-700 text-lg mr-4">
//           Tool bar <ChevronsRight className='inline-flex h-7 w-7 mb-1' />
//         </span>
//         <button
//               onClick={() => setShowColumnMenu(!showColumnMenu)}
//               className="flex items-center space-x-2 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded-lg relative"
//             >
//               <EyeOff size={20} />
//               <span>Hide fields</span>
//               <ChevronDown className="w-4 h-4" />
//               {showColumnMenu && (
//                 <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
//                   {columns.map(column => (
//                     <label key={column.key} className="flex items-center px-3 py-2 hover:bg-gray-50 cursor-pointer">
//                       <input
//                         type="checkbox"
//                         checked={column.visible}
//                         onChange={() => toggleColumnVisibility(column.key)}
//                         className="mr-2"
//                       />
//                       <span className="text-sm">{column.header}</span>
//                     </label>
//                   ))}
//                 </div>
//               )}
//             </button>
//         <button
//           onClick={() => toast.info("Sort functionality is already implemented for every column!")}
//           className="flex items-center gap-1 px-2 py-1 text-gray-600 hover:bg-gray-100 rounded"
//         >
//          <ArrowDownUp size={20} /> Sort
//         </button>
//         <button
//           onClick={() => toast.info("Filter functionality will be implemented soon!")}
//           className="flex items-center gap-1 px-2 py-1 text-gray-600 hover:bg-gray-100 rounded"
//         >
//           <ListFilter size={20} /> Filter
//         </button>
//         <button
//           onClick={() => toast.info("Cell view functionality will be implemented soon!")}
//           className="flex items-center gap-1 px-2 py-1 text-gray-600 hover:bg-gray-100 rounded"
//         >
//          {/* <img src="UpDown.png" className='w-4 h-4 border-t-2 border-b-2 border-l-2 rounded-tl-sm rounded-bl-sm pl-1' alt="Cell view"/> */}
//           <TbArrowAutofitHeight size={20} /> Cell view
//         </button>
//         <div className="flex-1" />
//         <button
//           onClick={() => toast.warning("Login to import data!")}
//           className="flex items-center gap-1 px-3 py-1 border-[1px] border-gray-300 text-gray-600 hover:bg-gray-100 rounded-md"
//         >
//           <ArrowDownToLine size={16} /> Import
//         </button>
//         <button
//           onClick={() => handleToolbarClick('Export')}
//           className="flex items-center gap-1 px-3 py-1 border-[1px] border-gray-300 text-gray-600 hover:bg-gray-100 rounded-md"
//         >
//           <ArrowUpToLine size={16} /> Export
//         </button>
//         <button
//           onClick={() => toast.warning("Login to share data!")}
//           className="flex items-center gap-1 px-3 py-1 border-[1px] border-gray-300 text-gray-600 hover:bg-gray-100 rounded-md"
//         >
//           <FaRegShareFromSquare size={16} /> Share
//         </button>
//         <button
//           onClick={() => toast.success("New action created!")}
//           className="inline-flex px-5 py-1.5 bg-green-600 text-white rounded-lg shadow font-semibold hover:bg-green-700"
//         >
//           <img src="split-svgrepo-com.svg" alt="" className='h-3 w-4 mt-1 mr-1'/> New Action
//         </button>
//       </div>

//       {/* Main Content */}
//       <div className="pb-4">
//         {/* Spreadsheet */}
//         <div className="bg-white border border-gray-200">
//           <div ref={tableRef} className="overflow-auto">
//             <table className="w-full">
//               <thead className="bg-gray-50 border-b border-l border-gray-200">
//                 <tr className='border-b border-gray-200 h-9'>
//                   <th className="w-10 border-r border-gray-200 px-2 py-1 text-left text-xs font-medium bg-white uppercase tracking-wider"></th>
//                   <th className='border-r border-gray-200 bg-gray-200' colSpan={4}>
//                     <div className='flex justify-start items-center'>
//                       <div className='flex justify-start bg-gray-100 rounded py-0.5 ml-2 pl-2 pr-3 text-gray-800 font-medium'>
//                         <Link2 className='text-blue-500 hover:underline mr-2'/> Q3 Financial Overview
//                       </div>
//                       <RefreshCw className='h-4 w-4 ml-3 text-amber-500'/>
//                     </div>
//                   </th>
//                   <th className="bg-white border-r border-gray-200"></th>
//                   <th className='border-r border-gray-200 bg-green-200 text-green-800 px-2 py-1'>
//                     <div className='flex items-center w-full justify-center'>
//                       <img src="split-green.svg" alt="" className='text-wrap inline-flex h-4 w-4 mr-2'/>
//                       ABC
//                       <Ellipsis className='ml-1'/>
//                     </div>
//                   </th>
//                   <th className='border-r border-gray-200 px-2 py-1 bg-purple-200 text-purple-800' colSpan={2}>
//                     <div className='flex items-center w-full justify-center'>
//                       <img src="split-svgrepo-com.svg" alt="" className='text-wrap inline-flex h-4 w-4 mr-2'/>
//                       Answer a question
//                       <Ellipsis className='ml-1'/>
//                     </div></th>
//                   <th className='border-r border-gray-200 px-2 py-1 bg-orange-200 text-orange-800'>
//                     <div className='flex items-center w-full justify-center'>
//                       <img src="split-svgrepo-com.svg" alt="" className='text-wrap inline-flex h-4 w-4 mr-2'/>
//                       Extract
//                       <Ellipsis className='ml-1'/>
//                     </div></th>
//                   <th className='flex justify-center items-center h-full border-r border-gray-200 px-2 py-1 text-gray-600 hover:bg-gray-100'><Plus size={28}/></th>
//                 </tr>
//                 <tr>
//                   <th className="border-r border-gray-200 w-10 px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     <Hash size={20}/>
//                   </th>
//                   {visibleColumns.map((column) => (
//                     <th
//                       key={column.key}
//                       className={`border-r border-gray-200 px-2 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 relative group ${column.class}`}
//                       style={{ width: column.width }}
//                       onClick={() => column.sortable && handleSort(column.key)}
//                     >
//                       <div className={`flex items-center ${ column.icon && column.key !== "assigned" ? "justify-between" : "justify-center"}`}>
//                         <div className='flex items-center justify-center'>
//                           {column.icon && <column.icon className={`h-4 w-4 mr-2`} />}
//                           <span className='flex items-center justify-center text-center pt-0.5'>{column.header}</span>
//                         </div>
//                         {column.icon && column.key !== "assigned" && (
//                           <span className="ml-3">
//                             {sortConfig?.direction === 'asc' ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}
//                           </span>
//                         )}
//                       </div>
//                     </th>
//                   ))}
//                 </tr>
//               </thead>
//               <tbody className="bg-white divide-y divide-gray-200">
//                 {filteredTasks.map((task, rowIndex) => (
//                   <tr key={task.id} className="hover:bg-gray-50 truncate">
//                     <td className="border-r border-gray-200 px-3 py-2 text-sm text-gray-500">
//                       {task.id}
//                     </td>
//                     {visibleColumns.map((column) => (
//                       <td
//                         key={`${task.id}-${column.key}`}
//                         className={`border-r border-gray-200 px-2 py-1 min-w-[110px] max-w-[300px] truncate text-sm cursor-cell relative
//                         ${
//                           selectedCell?.row === rowIndex && selectedCell?.col === column.key
//                             ? 'bg-blue-50 ring-2 ring-blue-500 ring-inset'
//                             : ''
//                         }
//                         ${
//                           column.key === 'status' || column.key === 'priority'
//                             ? 'flex justify-center items-center'
//                             : ''
//                         }
//                         ${
//                           column.key === 'submitted' || column.key === 'dueDate' || column.key === 'estValue'
//                             ? 'text-end'
//                             : ''
//                         }
//                         `}
//                         onClick={() => handleCellClick(rowIndex, column.key)}
//                       >
//                         {column.key === 'status' ? (
//                           <span className={`inline-flex px-2 py-1 w-fit text-xs font-semibold rounded-full border ${getStatusColor(task[column.key])}`}>
//                             {task[column.key]}
//                           </span>
//                         ) : column.key === 'priority' ? (
//                           <span className={`inline-flex px-2 py-1 text-xs font-semibold ${getPriorityColor(task[column.key])}`}>
//                             {task[column.key]}
//                           </span>
//                         ) : (
//                           <div className="text-gray-900 truncate">
//                             {formatValue(column.key, task[column.key])}
//                           </div>
//                         )}
//                       </td>
//                     ))}
//                   </tr>
//                 ))}
//                 {Array.from({ length: 25 - initialTasks.length }).map((_, i) => (
//                 <tr key={`empty-${i}`} className="hover:bg-gray-50">
//                   <td className="border-r border-gray-200 px-3 py-1 text-sm text-gray-500">
//                     {initialTasks.length + i + 1}
//                   </td>
//                   {Array.from({ length: 10 }).map((_, j) => (
//                     <td
//                       key={`${initialTasks.length + i}-${j}`}
//                       className={`border-r border-gray-200 px-2 py-2 text-sm cursor-cell relative ${
//                         selectedCell?.row === i && selectedCell?.col === j.toString()
//                           ? 'bg-blue-50 ring-2 ring-blue-500 ring-inset'
//                           : ''
//                       }`}
//                       onClick={() => handleCellClick(i, j.toString())}>
//                       &nbsp;
//                     </td>
//                   ))}
//                 </tr>
//               ))}
//               </tbody>
//             </table>
//           </div>
//         </div>

//         {/* Status indicator */}
//         {/* <div className="mt-4 text-sm text-gray-500">
//           Showing {filteredTasks.length} of {tasks.length} items
//           {selectedCell && (
//             <span className="ml-4">
//               Selected: Row {selectedCell.row + 1}, Column {visibleColumns.find(col => col.key === selectedCell.col)?.header}
//             </span>
//           )}
//         </div> */}
//       </div>

//       {/* Footer */}
//       <Footer />
//     </div>
//   );
// };

// export default SpreadsheetApp;

// import React, { useMemo, useState } from "react";
// import {
//   useReactTable,
//   getCoreRowModel,
//   getSortedRowModel,
//   flexRender,
// } from "@tanstack/react-table";
// import type { ColumnDef,SortingState,
//   VisibilityState  } from "@tanstack/react-table";
// import {
//   ChevronDown,
//   Search,
//   Filter,
//   Upload,
//   Download,
//   Share,
//   Plus,
//   EyeOff,
//   ChevronRight,
// } from "lucide-react";

// // Types
// interface Task {
//   id: number;
//   jobRequest: string;
//   submitted: string;
//   status: "In-process" | "Need to start" | "Complete" | "Blocked";
//   submitter: string;
//   url: string;
//   assigned: string;
//   priority: "High" | "Medium" | "Low";
//   dueDate: string;
//   estValue: number;
// }

// const initialTasks: Task[] = [
//   {
//     id: 1,
//     jobRequest: "Launch social media campaign for product launch",
//     submitted: "15-11-2024",
//     status: "In-process",
//     submitter: "Aisha Patel",
//     url: "www.aishapatel.com",
//     assigned: "Sophie Choudhury",
//     priority: "Medium",
//     dueDate: "20-11-2024",
//     estValue: 6200000,
//   },
//   {
//     id: 2,
//     jobRequest: "Update press kit for company redesign",
//     submitted: "28-10-2024",
//     status: "Need to start",
//     submitter: "Irfan Khan",
//     url: "www.irfankhang.com",
//     assigned: "Tejas Pandey",
//     priority: "High",
//     dueDate: "30-10-2024",
//     estValue: 3500000,
//   },
//   {
//     id: 3,
//     jobRequest: "Finalize user testing feedback for app redesign",
//     submitted: "05-12-2024",
//     status: "In-process",
//     submitter: "Mark Johnson",
//     url: "www.markjohns.com",
//     assigned: "Rachel Lee",
//     priority: "Medium",
//     dueDate: "10-12-2024",
//     estValue: 4750000,
//   },
//   {
//     id: 4,
//     jobRequest: "Design new features for the website",
//     submitted: "10-01-2025",
//     status: "Complete",
//     submitter: "Emily Green",
//     url: "www.emilygreen.com",
//     assigned: "Tom Wright",
//     priority: "Low",
//     dueDate: "15-01-2025",
//     estValue: 5900000,
//   },
//   {
//     id: 5,
//     jobRequest: "Prepare financial report for Q4",
//     submitted: "25-01-2025",
//     status: "Blocked",
//     submitter: "Jessica Brown",
//     url: "www.jessicabro.com",
//     assigned: "Kevin Smith",
//     priority: "Low",
//     dueDate: "30-01-2025",
//     estValue: 2800000,
//   },
// ];

// const tabs = ["All Orders", "Pending", "Reviewed", "Arrived"];

// const statusColors: Record<Task["status"], string> = {
//   "In-process": "bg-orange-100 text-orange-800 border-orange-200",
//   "Need to start": "bg-red-100 text-red-800 border-red-200",
//   Complete: "bg-green-100 text-green-800 border-green-200",
//   Blocked: "bg-red-100 text-red-800 border-red-200",
// };

// const priorityColors: Record<Task["priority"], string> = {
//   High: "text-red-600 font-semibold",
//   Medium: "text-yellow-600 font-semibold",
//   Low: "text-blue-600 font-semibold",
// };

// const SpreadsheetApp: React.FC = () => {
//   const [data, setData] = useState<Task[]>(initialTasks);
//   const [sorting, setSorting] = useState<SortingState>([]);
//   const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
//   const [searchTerm, setSearchTerm] = useState("");
//   const [activeTab, setActiveTab] = useState(tabs[0]);

//   // Filtered data
//   const filteredData = useMemo(() => {
//     if (!searchTerm) return data;
//     return data.filter((task) =>
//       Object.values(task)
//         .join(" ")
//         .toLowerCase()
//         .includes(searchTerm.toLowerCase())
//     );
//   }, [data, searchTerm]);

//   // Table columns
//   const columns = useMemo<ColumnDef<Task>[]>(
//     () => [
//       {
//         accessorKey: "jobRequest",
//         header: () => (
//           <div className="flex items-center">
//             Job Request
//           </div>
//         ),
//         cell: (info) => (
//           <span className="truncate block max-w-[220px]" title={info.getValue() as string}>
//             {info.getValue() as string}
//           </span>
//         ),
//         size: 300,
//       },
//       {
//         accessorKey: "submitted",
//         header: "Submitted",
//         size: 120,
//       },
//       {
//         accessorKey: "status",
//         header: "Status",
//         cell: (info) => (
//           <span
//             className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${statusColors[info.getValue() as Task["status"]]}`}
//           >
//             {info.getValue() as string}
//           </span>
//         ),
//         size: 120,
//       },
//       {
//         accessorKey: "submitter",
//         header: "Submitter",
//         size: 140,
//       },
//       {
//         accessorKey: "url",
//         header: "URL",
//         cell: (info) => (
//           <a
//             href={`https://${info.getValue() as string}`}
//             className="text-blue-600 hover:text-blue-800 underline text-sm"
//             target="_blank"
//             rel="noopener noreferrer"
//           >
//             {info.getValue() as string}
//           </a>
//         ),
//         size: 160,
//       },
//       {
//         accessorKey: "assigned",
//         header: () => (
//           <span className="bg-green-100 text-green-800 px-2 py-1 rounded font-medium">
//             Assigned
//           </span>
//         ),
//         size: 140,
//       },
//       {
//         accessorKey: "priority",
//         header: () => (
//           <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded font-medium">
//             Priority
//           </span>
//         ),
//         cell: (info) => (
//           <span className={priorityColors[info.getValue() as Task["priority"]]}>
//             {info.getValue() as string}
//           </span>
//         ),
//         size: 100,
//       },
//       {
//         accessorKey: "dueDate",
//         header: () => (
//           <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded font-medium">
//             Due Date
//           </span>
//         ),
//         size: 120,
//       },
//       {
//         accessorKey: "estValue",
//         header: () => (
//           <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded font-medium">
//             Est. Value
//           </span>
//         ),
//         cell: (info) =>
//           new Intl.NumberFormat("en-US", {
//             style: "currency",
//             currency: "USD",
//             minimumFractionDigits: 0,
//             maximumFractionDigits: 0,
//           }).format(info.getValue() as number),
//         size: 130,
//       },
//     ],
//     []
//   );

//   const table = useReactTable({
//     data: filteredData,
//     columns,
//     state: {
//       sorting,
//       columnVisibility,
//     },
//     onSortingChange: setSorting,
//     onColumnVisibilityChange: setColumnVisibility,
//     getCoreRowModel: getCoreRowModel(),
//     getSortedRowModel: getSortedRowModel(),
//     columnResizeMode: "onChange",
//     debugTable: false,
//   });

//   return (
//     <div className="min-h-screen bg-gray-50">
//       {/* Header */}
//       <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
//         <div className="flex items-center space-x-2 text-sm text-gray-500">
//           <span>Workspace</span>
//           <ChevronRight className="w-4 h-4" />
//           <span>Folder 2</span>
//           <ChevronRight className="w-4 h-4" />
//           <span className="font-medium text-gray-900">Spreadsheet 3</span>
//         </div>
//         <div className="flex items-center space-x-3">
//           <div className="relative">
//             <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
//             <input
//               type="text"
//               placeholder="Search within sheet"
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//               className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//             />
//           </div>
//           <button className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg">
//             <Upload className="w-4 h-4" />
//           </button>
//           <button className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg">
//             <Download className="w-4 h-4" />
//           </button>
//           <button className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg">
//             <Share className="w-4 h-4" />
//           </button>
//           <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium">
//             New Action
//           </button>
//         </div>
//       </div>

//       {/* Toolbar */}
//       <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
//         <div className="flex items-center space-x-2">
//           <button
//             onClick={() =>
//               setColumnVisibility((prev) => {
//                 // Toggle all columns
//                 const allVisible = Object.values(table.getState().columnVisibility).every(Boolean);
//                 const newVisibility: VisibilityState = {};
//                 table.getAllLeafColumns().forEach((col) => {
//                   newVisibility[col.id] = !allVisible;
//                 });
//                 return newVisibility;
//               })
//             }
//             className="flex items-center space-x-2 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded-lg"
//           >
//             <EyeOff className="w-4 h-4" />
//             <span>Hide fields</span>
//             <ChevronDown className="w-4 h-4" />
//           </button>
//           <button className="flex items-center space-x-2 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded-lg">
//             <span>Sort</span>
//             <ChevronDown className="w-4 h-4" />
//           </button>
//           <button className="flex items-center space-x-2 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded-lg">
//             <Filter className="w-4 h-4" />
//             <span>Filter</span>
//           </button>
//         </div>
//         {/* Example colored header actions */}
//         <div className="flex items-center space-x-2">
//           <button className="px-3 py-1.5 bg-purple-100 text-purple-800 rounded-lg text-sm">
//             Answer a question
//           </button>
//           <button className="px-3 py-1.5 bg-orange-100 text-orange-800 rounded-lg text-sm">
//             Extract
//           </button>
//           <button className="p-1.5 text-gray-600 hover:bg-gray-100 rounded-lg">
//             <Plus className="w-4 h-4" />
//           </button>
//         </div>
//       </div>

//       {/* Tabs */}
//       <div className="px-6 pt-4 flex space-x-1">
//         {tabs.map((tab) => (
//           <button
//             key={tab}
//             onClick={() => setActiveTab(tab)}
//             className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
//               activeTab === tab
//                 ? "bg-green-100 text-green-800"
//                 : "text-gray-600 hover:text-gray-800 hover:bg-gray-100"
//             }`}
//           >
//             {tab}
//           </button>
//         ))}
//         <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
//           <Plus className="w-4 h-4" />
//         </button>
//       </div>

//       {/* Table */}
//       <div className="px-6 py-4">
//         <div className="bg-white rounded-lg border border-gray-200 overflow-auto">
//           <table className="w-full min-w-max border-separate border-spacing-0">
//             <thead>
//               {table.getHeaderGroups().map((headerGroup) => (
//                 <tr key={headerGroup.id}>
//                   <th className="w-12 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-white sticky left-0 z-10">
//                     #
//                   </th>
//                   {headerGroup.headers.map((header) => (
//                     <th
//                       key={header.id}
//                       className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-white"
//                       style={{ width: header.getSize() }}
//                       onClick={header.column.getCanSort() ? header.column.getToggleSortingHandler() : undefined}
//                     >
//                       <div className="flex items-center">
//                         {flexRender(header.column.columnDef.header, header.getContext())}
//                         {{
//                           asc: "↑",
//                           desc: "↓",
//                         }[header.column.getIsSorted() as string] ?? null}
//                       </div>
//                     </th>
//                   ))}
//                 </tr>
//               ))}
//             </thead>
//             <tbody>
//               {table.getRowModel().rows.map((row, rowIndex) => (
//                 <tr key={row.id} className="hover:bg-gray-50">
//                   <td className="px-4 py-3 text-sm text-gray-500 bg-white sticky left-0 z-10">
//                     {rowIndex + 1}
//                   </td>
//                   {row.getVisibleCells().map((cell) => (
//                     <td
//                       key={cell.id}
//                       className="px-4 py-3 text-sm border-t border-gray-100"
//                     >
//                       {flexRender(cell.column.columnDef.cell, cell.getContext())}
//                     </td>
//                   ))}
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//         {/* Status indicator */}
//         <div className="mt-4 text-sm text-gray-500">
//           Showing {filteredData.length} of {data.length} items
//         </div>
//       </div>
//     </div>
//   );
// };

// export default SpreadsheetApp;

// import React, { useState } from 'react';
// import { Parser } from 'hot-formula-parser';
// import * as XLSX from 'xlsx';
// import { saveAs } from 'file-saver';

// const DEFAULT_ROWS = 5;
// const DEFAULT_COLS = 6;
// const COL_LABELS = ['A', 'B', 'C', 'D', 'E', 'F'];

// export default function Spreadsheet() {
//   const [data, setData] = useState<string[][]>(
//     Array.from({ length: DEFAULT_ROWS }, () => Array(DEFAULT_COLS).fill(''))
//   );
//   const [activeTab, setActiveTab] = useState('All');
//   const parser = new Parser();

//   // Parse formulas
//   const evaluateCell = (rowIdx: number, colIdx: number): string => {
//     const cell = data[rowIdx][colIdx];
//     if (!cell.startsWith('=')) return cell;

//     parser.on('callCellValue', ({ row, col }, done) => {
//       const val = data[row]?.[col] || '0';
//       done(val.startsWith('=') ? evaluateCell(row, col) : val);
//     });

//     parser.on('callRangeValue', (startCellCoord, endCellCoord, done) => {
//       const rows = [];
//       for (let row = startCellCoord.row; row <= endCellCoord.row; row++) {
//         const rowData = [];
//         for (let col = startCellCoord.col; col <= endCellCoord.col; col++) {
//           rowData.push(data[row]?.[col] || '0');
//         }
//         rows.push(rowData);
//       }
//       done(rows);
//     });

//     const colIndex = colIdx;
//     const rowIndex = rowIdx;
//     const result = parser.parse(cell.substring(1), {
//       row: rowIndex,
//       col: colIndex,
//     });
//     return result?.result?.toString() || 'ERROR';
//   };

//   const updateCell = (row: number, col: number, value: string) => {
//     const newData = [...data];
//     newData[row][col] = value;
//     setData(newData);
//   };

//   const addRow = () => {
//     setData((prev) => [...prev, Array(DEFAULT_COLS).fill('')]);
//   };

//   const exportToExcel = () => {
//     const flatData = data.map((row, rowIdx) => {
//       const obj: Record<string, string> = {};
//       row.forEach((val, colIdx) => {
//         obj[COL_LABELS[colIdx]] = evaluateCell(rowIdx, colIdx);
//       });
//       return obj;
//     });
//     const ws = XLSX.utils.json_to_sheet(flatData);
//     const wb = XLSX.utils.book_new();
//     XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
//     const buf = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
//     saveAs(new Blob([buf], { type: 'application/octet-stream' }), 'spreadsheet.xlsx');
//   };

//   return (
//     <div className="p-4 space-y-4">
//       {/* Tab Filters */}
//       <div className="flex gap-4 border-b">
//         {['All', 'Pending', 'Reviewed', 'Arrived'].map((tab) => (
//           <button
//             key={tab}
//             onClick={() => setActiveTab(tab)}
//             className={`pb-2 border-b-2 ${
//               activeTab === tab ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500'
//             }`}
//           >
//             {tab}
//           </button>
//         ))}
//       </div>

//       {/* Spreadsheet Table */}
//       <div className="overflow-auto border rounded-lg">
//         <table className="min-w-full border-collapse">
//           <thead className="bg-gray-50">
//             <tr>
//               <th className="border p-2">#</th>
//               {COL_LABELS.map((label, idx) => (
//                 <th key={idx} className="border p-2 text-left">{label}</th>
//               ))}
//             </tr>
//           </thead>
//           <tbody>
//             {data.map((row, rowIdx) => (
//               <tr key={rowIdx}>
//                 <td className="border px-3 text-center bg-gray-100 font-bold">{rowIdx + 1}</td>
//                 {row.map((cell, colIdx) => (
//                   <td key={colIdx} className="border px-2">
//                     <input
//                       className="w-full px-2 py-1 outline-none bg-transparent"
//                       value={cell}
//                       onChange={(e) => updateCell(rowIdx, colIdx, e.target.value)}
//                     />
//                     {cell.startsWith('=') && (
//                       <div className="text-xs text-gray-400">{evaluateCell(rowIdx, colIdx)}</div>
//                     )}
//                   </td>
//                 ))}
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>

//       {/* Actions */}
//       <div className="flex gap-4">
//         <button
//           onClick={addRow}
//           className="px-4 py-2 bg-green-600 text-white rounded shadow"
//         >
//           + Add Row
//         </button>
//         <button
//           onClick={exportToExcel}
//           className="px-4 py-2 bg-blue-600 text-white rounded shadow"
//         >
//           Export to Excel
//         </button>
//       </div>
//     </div>
//   );
// }

// import React, { useState } from 'react';
// import { Parser } from 'hot-formula-parser';
// import * as XLSX from 'xlsx';
// import { saveAs } from 'file-saver';

// // Task model for Supabase sync/export
// export interface Task {
//   id: number;
//   jobRequest: string;
//   submitted: string;
//   status: 'In-process' | 'Need to start' | 'Complete' | 'Blocked';
//   submitter: string;
//   url: string;
//   assigned: string;
//   priority: 'High' | 'Medium' | 'Low';
//   dueDate: string;
//   estValue: number;
// }

// export const initialTasks: Task[] = [
//   {
//     id: 1,
//     jobRequest: 'Launch social media campaign for product launch',
//     submitted: '15-11-2024',
//     status: 'In-process',
//     submitter: 'Aisha Patel',
//     url: 'www.aishapatel.com',
//     assigned: 'Sophie Choudhury',
//     priority: 'Medium',
//     dueDate: '20-11-2024',
//     estValue: 6200000,
//   },
//   {
//     id: 2,
//     jobRequest: 'Update press kit for company redesign',
//     submitted: '28-10-2024',
//     status: 'Need to start',
//     submitter: 'Irfan Khan',
//     url: 'www.irfankhang.com',
//     assigned: 'Tejas Pandey',
//     priority: 'High',
//     dueDate: '30-10-2024',
//     estValue: 3500000,
//   },
//   {
//     id: 3,
//     jobRequest: 'Finalize user testing feedback for app redesign',
//     submitted: '05-12-2024',
//     status: 'In-process',
//     submitter: 'Mark Johnson',
//     url: 'www.markjohns.com',
//     assigned: 'Rachel Lee',
//     priority: 'Medium',
//     dueDate: '10-12-2024',
//     estValue: 4750000,
//   },
//   {
//     id: 4,
//     jobRequest: 'Design new features for the website',
//     submitted: '10-01-2025',
//     status: 'Complete',
//     submitter: 'Emily Green',
//     url: 'www.emilygreen.com',
//     assigned: 'Tom Wright',
//     priority: 'Low',
//     dueDate: '15-01-2025',
//     estValue: 5900000,
//   },
//   {
//     id: 5,
//     jobRequest: 'Prepare financial report for Q4',
//     submitted: '25-01-2025',
//     status: 'Blocked',
//     submitter: 'Jessica Brown',
//     url: 'www.jessicabro.com',
//     assigned: 'Kevin Smith',
//     priority: 'Low',
//     dueDate: '30-01-2025',
//     estValue: 2800000,
//   },
// ];

// export const tabs = ['All Orders', 'Pending', 'Reviewed', 'Arrived'];

// export const statusColors: Record<Task['status'], string> = {
//   'In-process': 'bg-orange-100 text-orange-800 border-orange-200',
//   'Need to start': 'bg-red-100 text-red-800 border-red-200',
//   Complete: 'bg-green-100 text-green-800 border-green-200',
//   Blocked: 'bg-red-100 text-red-800 border-red-200',
// };

// export const priorityColors: Record<Task['priority'], string> = {
//   High: 'text-red-600 font-semibold',
//   Medium: 'text-yellow-600 font-semibold',
//   Low: 'text-blue-600 font-semibold',
// };

// const DEFAULT_COLS = [
//   'Job Request',
//   'Submitted',
//   'Status',
//   'Submitter',
//   'URL',
//   'Assigned',
//   'Priority',
//   'Due Date',
//   'Est. Value',
// ];

// const DEFAULT_DATA = [
//   [
//     'Launch social media campaign for product launch',
//     '15-11-2024',
//     'In-process',
//     'Aisha Patel',
//     'www.aishapatel.com',
//     'Sophie Choudhury',
//     'Medium',
//     '20-11-2024',
//     '6200000',
//   ],
//   [
//     'Update press kit for company redesign',
//     '28-10-2024',
//     'Need to start',
//     'Irfan Khan',
//     'www.irfankhang.com',
//     'Tejas Pandey',
//     'High',
//     '30-10-2024',
//     '3500000',
//   ],
//   [
//     'Finalize user testing feedback for app redesign',
//     '05-12-2024',
//     'In-process',
//     'Mark Johnson',
//     'www.markjohns.com',
//     'Rachel Lee',
//     'Medium',
//     '10-12-2024',
//     '4750000',
//   ],
//   [
//     'Design new features for the website',
//     '10-01-2025',
//     'Complete',
//     'Emily Green',
//     'www.emilygreen.com',
//     'Tom Wright',
//     'Low',
//     '15-01-2025',
//     '5900000',
//   ],
//   [
//     'Prepare financial report for Q4',
//     '25-01-2025',
//     'Blocked',
//     'Jessica Brown',
//     'www.jessicabro.com',
//     'Kevin Smith',
//     'Low',
//     '30-01-2025',
//     '2800000',
//   ],
// ];

// // Converts Task[] to string[][] (excluding the id field)
// export function tasksToGrid(tasks: Task[], headers: string[]): string[][] {
//   return tasks.map(task =>
//     headers.map(header => {
//       const key = headerToKey(header);
//       // @ts-ignore
//       return task[key] !== undefined ? String(task[key]) : "";
//     })
//   );
// }

// // Converts string[][] to Task[] (assumes order matches headers)
// export function gridToTasks(grid: string[][], headers: string[]): Task[] {
//   return grid.map((row, idx) => {
//     const obj: any = { id: idx + 1 };
//     headers.forEach((header, colIdx) => {
//       const key = headerToKey(header);
//       obj[key] = parseCellValue(key, row[colIdx]);
//     });
//     return obj as Task;
//   });
// }

// // Helper: Map header string to Task key
// function headerToKey(header: string): keyof Task {
//   switch (header.trim().toLowerCase()) {
//     case "job request": return "jobRequest";
//     case "submitted": return "submitted";
//     case "status": return "status";
//     case "submitter": return "submitter";
//     case "url": return "url";
//     case "assigned": return "assigned";
//     case "priority": return "priority";
//     case "due date": return "dueDate";
//     case "est. value": return "estValue";
//     default: return header as keyof Task;
//   }
// }

// // Helper: Parse cell value for correct type
// function parseCellValue(key: string, value: string) {
//   if (key === "estValue") return Number(value) || 0;
//   return value;
// }

// const SpreadsheetApp = () => {
//   const [headers, setHeaders] = useState([...DEFAULT_COLS]);
//   const [data, setData] = useState<string[][]>([...DEFAULT_DATA]);
//   const [activeTab, setActiveTab] = useState('All Orders');
//   const [searchTerm, setSearchTerm] = useState('');
//   const parser = new Parser();

//   const updateCell = (row: number, col: number, value: string) => {
//     const newData = [...data];
//     newData[row][col] = value;
//     setData(newData);
//   };

//   const addRow = () => {
//     setData(prev => [...prev, Array(headers.length).fill('')]);
//   };

//   const evaluateCell = (rowIdx: number, colIdx: number): string => {
//     const cell = data[rowIdx][colIdx];
//     if (!cell.startsWith('=')) return cell;

//     parser.on('callCellValue', ({ row, col }, done) => {
//       const val = data[row]?.[col] || '0';
//       done(val.startsWith('=') ? evaluateCell(row, col) : val);
//     });

//     const result = parser.parse(cell.substring(1));
//     return result?.result?.toString() || 'ERROR';
//   };

//   const exportToExcel = () => {
//     const rows = data.map((row, i) => {
//       const obj: Record<string, string> = {};
//       headers.forEach((header, j) => {
//         obj[header] = evaluateCell(i, j);
//       });
//       return obj;
//     });
//     const ws = XLSX.utils.json_to_sheet(rows);
//     const wb = XLSX.utils.book_new();
//     XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
//     const buf = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
//     saveAs(
//       new Blob([buf], { type: 'application/octet-stream' }),
//       'spreadsheet.xlsx'
//     );
//   };

//   const filteredData = data.filter(row => {
//     const matchesSearch = row
//       .join(' ')
//       .toLowerCase()
//       .includes(searchTerm.toLowerCase());
//     if (activeTab === 'All Orders') return matchesSearch;
//     return matchesSearch && row[2].toLowerCase() === activeTab.toLowerCase();
//   });

//   return (
//     <div className="p-4 space-y-4">
//       <div className="flex gap-2">
//         {[
//           'All Orders',
//           'In-process',
//           'Need to start',
//           'Complete',
//           'Blocked',
//         ].map(tab => (
//           <button
//             key={tab}
//             onClick={() => setActiveTab(tab)}
//             className={`px-3 py-1 border-b-2 ${
//               activeTab === tab
//                 ? 'border-blue-600 text-blue-600'
//                 : 'border-transparent text-gray-500'
//             }`}
//           >
//             {tab}
//           </button>
//         ))}
//         <input
//           placeholder="Search..."
//           className="ml-auto border px-2 py-1 rounded"
//           value={searchTerm}
//           onChange={e => setSearchTerm(e.target.value)}
//         />
//       </div>

//       <div className="overflow-auto border rounded-lg">
//         <table className="min-w-full border-collapse">
//           <thead className="bg-gray-50">
//             <tr>
//               <th className="border p-2">#</th>
//               {headers.map((label, idx) => (
//                 <th key={idx} className="border p-2">
//                   <input
//                     className="font-bold outline-none w-full"
//                     value={label}
//                     onChange={e => {
//                       const newHeaders = [...headers];
//                       newHeaders[idx] = e.target.value;
//                       setHeaders(newHeaders);
//                     }}
//                   />
//                 </th>
//               ))}
//             </tr>
//           </thead>
//           <tbody>
//             {filteredData.map((row, rowIdx) => (
//               <tr key={rowIdx}>
//                 <td className="border px-2 text-center font-bold bg-gray-100">
//                   {rowIdx + 1}
//                 </td>
//                 {row.map((cell, colIdx) => (
//                   <td key={colIdx} className="border px-2">
//                     <input
//                       className="w-full px-2 py-1 outline-none bg-transparent"
//                       value={cell}
//                       onChange={e => updateCell(rowIdx, colIdx, e.target.value)}
//                     />
//                     {cell.startsWith('=') && (
//                       <div className="text-xs text-gray-400">
//                         {evaluateCell(rowIdx, colIdx)}
//                       </div>
//                     )}
//                   </td>
//                 ))}
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>

//       <div className="flex gap-3">
//         <button
//           onClick={addRow}
//           className="px-4 py-2 bg-green-600 text-white rounded shadow"
//         >
//           + Add Row
//         </button>
//         <button
//           onClick={exportToExcel}
//           className="px-4 py-2 bg-blue-600 text-white rounded shadow"
//         >
//           Export to Excel
//         </button>
//       </div>
//     </div>
//   );
// };

// export default SpreadsheetApp;

// import React, { useState, useMemo } from 'react';
// import { Parser } from 'hot-formula-parser';
// import * as XLSX from 'xlsx';
// import { saveAs } from 'file-saver';
// import { Plus } from 'lucide-react';

// interface Task {
//   id: number;
//   jobRequest: string;
//   submitted: string;
//   status: 'In-process' | 'Need to start' | 'Complete' | 'Blocked';
//   submitter: string;
//   url: string;
//   assigned: string;
//   priority: 'High' | 'Medium' | 'Low';
//   dueDate: string;
//   estValue: number;
// }

// const DEFAULT_HEADERS = [
//   'Job Request',
//   'Submitted',
//   'Status',
//   'Submitter',
//   'URL',
//   'Assigned',
//   'Priority',
//   'Due Date',
//   'Est. Value'
// ];

// const initialTasks: Task[] = [
//   {
//     id: 1,
//     jobRequest: 'Launch social media campaign for product launch',
//     submitted: '15-11-2024',
//     status: 'In-process',
//     submitter: 'Aisha Patel',
//     url: 'www.aishapatel.com',
//     assigned: 'Sophie Choudhury',
//     priority: 'Medium',
//     dueDate: '20-11-2024',
//     estValue: 6200000
//   },
//   {
//     id: 2,
//     jobRequest: 'Update press kit for company redesign',
//     submitted: '28-10-2024',
//     status: 'Need to start',
//     submitter: 'Irfan Khan',
//     url: 'www.irfankhang.com',
//     assigned: 'Tejas Pandey',
//     priority: 'High',
//     dueDate: '30-10-2024',
//     estValue: 3500000
//   },
//   {
//     id: 3,
//     jobRequest: 'Finalize user testing feedback for app redesign',
//     submitted: '05-12-2024',
//     status: 'In-process',
//     submitter: 'Mark Johnson',
//     url: 'www.markjohns.com',
//     assigned: 'Rachel Lee',
//     priority: 'Medium',
//     dueDate: '10-12-2024',
//     estValue: 4750000
//   },
//   {
//     id: 4,
//     jobRequest: 'Design new features for the website',
//     submitted: '10-01-2025',
//     status: 'Complete',
//     submitter: 'Emily Green',
//     url: 'www.emilygreen.com',
//     assigned: 'Tom Wright',
//     priority: 'Low',
//     dueDate: '15-01-2025',
//     estValue: 5900000
//   },
//   {
//     id: 5,
//     jobRequest: 'Prepare financial report for Q4',
//     submitted: '25-01-2025',
//     status: 'Blocked',
//     submitter: 'Jessica Brown',
//     url: 'www.jessicabro.com',
//     assigned: 'Kevin Smith',
//     priority: 'Low',
//     dueDate: '30-01-2025',
//     estValue: 2800000
//   }
// ];

// function taskArrayToGrid(tasks: Task[]): string[][] {
//   return tasks.map((t) => [
//     t.jobRequest,
//     t.submitted,
//     t.status,
//     t.submitter,
//     t.url,
//     t.assigned,
//     t.priority,
//     t.dueDate,
//     t.estValue.toString()
//   ]);
// }

// function gridToTaskArray(grid: string[][]): Task[] {
//   return grid.map((row, idx) => ({
//     id: idx + 1,
//     jobRequest: row[0] || '',
//     submitted: row[1] || '',
//     status: row[2] as Task['status'],
//     submitter: row[3] || '',
//     url: row[4] || '',
//     assigned: row[5] || '',
//     priority: row[6] as Task['priority'],
//     dueDate: row[7] || '',
//     estValue: parseFloat(row[8]) || 0
//   }));
// }

// const DataGrid = () => {
//   const [headers, setHeaders] = useState([...DEFAULT_HEADERS]);
//   const [taskData, setTaskData] = useState<Task[]>(initialTasks);
//   const [activeTab, setActiveTab] = useState('All Orders');
//   const [searchTerm, setSearchTerm] = useState('');
//   const parser = useMemo(() => new Parser(), []);

//   const gridData = useMemo(() => taskArrayToGrid(taskData), [taskData]);

//   const updateGridCell = (row: number, col: number, value: string) => {
//     const updated = taskArrayToGrid(taskData);
//     updated[row][col] = value;
//     const converted = gridToTaskArray(updated);
//     setTaskData(converted);
//   };

//   const addRow = () => {
//     setTaskData((prev) => [...prev, {
//       id: prev.length + 1,
//       jobRequest: '',
//       submitted: '',
//       status: 'Need to start',
//       submitter: '',
//       url: '',
//       assigned: '',
//       priority: 'Medium',
//       dueDate: '',
//       estValue: 0
//     }]);
//   };

//   const addColumn = () => {
//     setHeaders((prev) => [...prev, `Column ${prev.length + 1}`]);
//     setTaskData((prev) => prev.map((t) => ({ ...t }))); // force rerender
//   };

//   const evaluateCell = (rowIdx: number, colIdx: number): string => {
//     const cell = gridData[rowIdx]?.[colIdx];
//     if (!cell?.startsWith('=')) return cell;

//     parser.on('callCellValue', ({ row, col }, done) => {
//       const val = gridData[row]?.[col] || '0';
//       done(val.startsWith('=') ? evaluateCell(row, col) : val);
//     });

//     const result = parser.parse(cell.substring(1));
//     return result?.result?.toString() || 'ERROR';
//   };

//   const exportToExcel = () => {
//     const rows = gridData.map((row, i) => {
//       const obj: Record<string, string> = {};
//       headers.forEach((header, j) => {
//         obj[header] = evaluateCell(i, j);
//       });
//       return obj;
//     });
//     const ws = XLSX.utils.json_to_sheet(rows);
//     const wb = XLSX.utils.book_new();
//     XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
//     const buf = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
//     saveAs(new Blob([buf], { type: 'application/octet-stream' }), 'spreadsheet.xlsx');
//   };

//   const filteredData = gridData.filter((row) => {
//     const matchesSearch = row.join(' ').toLowerCase().includes(searchTerm.toLowerCase());
//     if (activeTab === 'All Orders') return matchesSearch;
//     return matchesSearch && row[2].toLowerCase() === activeTab.toLowerCase();
//   });

//   const getConditionalClass = (value: string, colIdx: number) => {
//     const colName = headers[colIdx].toLowerCase();
//     if (colName === 'status') {
//       if (value === 'In-process') return 'bg-orange-100 text-orange-800';
//       if (value === 'Need to start') return 'bg-red-100 text-red-800';
//       if (value === 'Complete') return 'bg-green-100 text-green-800';
//       if (value === 'Blocked') return 'bg-red-100 text-red-800';
//     }
//     if (colName === 'priority') {
//       if (value === 'High') return 'text-red-600 font-bold';
//       if (value === 'Medium') return 'text-yellow-600 font-bold';
//       if (value === 'Low') return 'text-blue-600 font-bold';
//     }
//     return '';
//   };

//   return (
//     <div className="p-4 space-y-4">
//       <div className="flex gap-2">
//         {["All Orders", "In-process", "Need to start", "Complete", "Blocked"].map((tab) => (
//           <button
//             key={tab}
//             onClick={() => setActiveTab(tab)}
//             className={`px-3 py-1 border-b-2 ${
//               activeTab === tab ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500'
//             }`}
//           >
//             {tab}
//           </button>
//         ))}
//         <input
//           placeholder="Search..."
//           className="ml-auto border px-2 py-1 rounded"
//           value={searchTerm}
//           onChange={(e) => setSearchTerm(e.target.value)}
//         />
//       </div>

//       <div className="overflow-auto border rounded-lg">
//         <table className="min-w-full border-collapse">
//           <thead className="bg-gray-50">
//             <tr>
//               <th className="border p-2">#</th>
//               {headers.map((label, idx) => (
//                 <th key={idx} className="border p-2">
//                   <input
//                     className="font-bold outline-none w-full"
//                     value={label}
//                     onChange={(e) => {
//                       const newHeaders = [...headers];
//                       newHeaders[idx] = e.target.value;
//                       setHeaders(newHeaders);
//                     }}
//                   />
//                 </th>
//               ))}
//               <th className="border p-2">
//                 <button onClick={addColumn} className="text-gray-600 hover:text-black">
//                   <Plus size={18} />
//                 </button>
//               </th>
//             </tr>
//           </thead>
//           <tbody>
//             {filteredData.map((row, rowIdx) => (
//               <tr key={rowIdx}>
//                 <td className="border px-2 text-center font-bold bg-gray-100">{rowIdx + 1}</td>
//                 {row.map((cell, colIdx) => (
//                   <td
//                     key={colIdx}
//                     className={`border px-2 ${getConditionalClass(cell, colIdx)}`}
//                   >
//                     <input
//                       className="w-full px-2 py-1 outline-none bg-transparent"
//                       value={cell}
//                       onChange={(e) => updateGridCell(rowIdx, colIdx, e.target.value)}
//                     />
//                     {cell.startsWith('=') && (
//                       <div className="text-xs text-gray-400">{evaluateCell(rowIdx, colIdx)}</div>
//                     )}
//                   </td>
//                 ))}
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>

//       <div className="flex gap-3">
//         <button onClick={addRow} className="px-4 py-2 bg-green-600 text-white rounded shadow">
//           + Add Row
//         </button>
//         <button onClick={exportToExcel} className="px-4 py-2 bg-blue-600 text-white rounded shadow">
//           Export to Excel
//         </button>
//       </div>
//     </div>
