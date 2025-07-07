import { ChevronDown, ChevronUp, Ellipsis } from 'lucide-react';
import { toast } from 'sonner';
import type { Task } from '../types/Task';
import type { Column } from '../types/Column';
import { getStatusColor } from '../constants/StatusColour';
import { getPriorityColor } from '../constants/ColourPriority';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { initialTasks } from '../constants/initialTasks';
import { initialColumns } from '../constants/initialColumns';

const createEmptyTask = (
  id: number,
  columns: Column[],
  editingCol?: string,
  editValue?: string
): Task => {
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
      base[col.key] =
        editingCol && col.key === editingCol && editValue !== undefined
          ? editValue
          : '';
    }
  });
  return base;
};

type SpreadsheetBodyProps = {
  searchTerm: string;
  totalRow: number;
  setTotalRows: (rows: number) => void;
  activeTab: string;
  columns: Column[];
  setColumns: React.Dispatch<React.SetStateAction<Column[]>>;
};

export const SpreadsheetBody = ({
  searchTerm,
  totalRow,
  setTotalRows,
  activeTab,
  columns,
  setColumns,
}: SpreadsheetBodyProps) => {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const tableRef = useRef<HTMLDivElement>(null);
  const [selectedCell, setSelectedCell] = useState<{
    row: number;
    col: string;
  } | null>(null);
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Task;
    direction: 'asc' | 'desc';
  } | null>(null);
  const [editingCell, setEditingCell] = useState<{
    row: number;
    col: string;
  } | null>(null);
  const [editValue, setEditValue] = useState('');
  const [selectedRow, setSelectedRow] = useState<number | null>(null);
  const [selectedColumn, setSelectedColumn] = useState<string | null>(null);  
  const unifiedData = useMemo(() => {
    const data = [...tasks];
    const emptyRowsCount = Math.max(0, totalRow - tasks.length);

    for (let i = 0; i < emptyRowsCount; i++) {
      const emptyRow = createEmptyTask(tasks.length + i + 1, columns);
      data.push(emptyRow);
    }

    return data;
  }, [tasks, columns, totalRow]);

  const filteredTasks = useMemo(() => {
    let filtered = unifiedData;
    console.log(filtered)
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
        task =>
          task[key] !== '' && task[key] !== null && task[key] !== undefined
      );
      const empty = filtered.filter(
        task =>
          task[key] === '' || task[key] === null || task[key] === undefined
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

    if(activeTab !== 'All Orders') {
      const StatusData = filtered.filter(data => data.status.toLowerCase() === activeTab.toLowerCase());
      filtered = StatusData;
    }

    return filtered;
  }, [unifiedData, searchTerm, sortConfig, activeTab]);

  const visibleColumns = useMemo(
    () => columns.filter(col => col.visible),
    [columns]
  );

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
    toast.success(`Row Number ${rowIndex+1} is selected successfully`)
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
      const newTask = createEmptyTask(
        taskIndex + 1,
        columns,
        editingCell.col,
        editValue
      );
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
        id: index + 1,
      }));
      setTasks(reindexedTasks);
    }

    setTotalRows(Math.max(1, totalRow - 1));
    setSelectedRow(null);
  }, [selectedRow, filteredTasks, tasks, setTotalRows, totalRow]);

  const deleteSelectedColumn = useCallback(() => {
    if (!selectedColumn) return;
    const updatedColumns = columns.filter(col => col.key !== selectedColumn);
    setColumns(updatedColumns);
    const updatedTasks: Task[] = tasks.map(task => {
      const newTask: Task = { ...task };
      delete (newTask as unknown as Record<string, unknown>)[selectedColumn];
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
                ? {
                    ...prev,
                    col: String(visibleColumns[currentColIndex - 1].key),
                  }
                : null
            );
          }
          break;
        case 'ArrowRight':
          e.preventDefault();
          if (currentColIndex < visibleColumns.length - 1) {
            setSelectedCell(prev =>
              prev
                ? {
                    ...prev,
                    col: String(visibleColumns[currentColIndex + 1].key),
                  }
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
      visible: true,
      sortable: true,
      class: 'bg-[#EEEEEE] text-[#757575]',
      icon: '',
    };

    setColumns([...columns, newColumn]);

    const updatedTasks = tasks.map(task => ({
      ...task,
      [newColumnKey]: '',
    }));
    setTasks(updatedTasks);
  };

  const formatValue = (key: keyof Task | string, value: string | number) => {
    if (key === 'estValue' && value !== 0) {
      return new Intl.NumberFormat('en-IN', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(Number(value) || 0);
    }
    if (key === 'url' && typeof value === 'string' && value) {
      return (
        <a
          href={`https://${value}`}
          className="text-[#121212] hover:text-blue-600 underline text-xs"
          target="_blank"
          rel="noopener noreferrer"
        >
        {value}
        </a>
      );
    }
    return value !== 0 ? value : '';
  };

  const HandleElementClick = () => {
    toast.info('Feature will be implemented very soon.');
  };

  return (
    <div className="bg-white border-gray-200 h-full">
      <div ref={tableRef} className="overflow-auto h-full">
        <table className="w-fit">
          <thead className="bg-gray-50 border-b border-[#CBCBCB] sticky top-0 z-10">
            <tr className="border-b border-white h-8">
              <th className="w-8 h-8 border-l border-white px-2 py-1 text-left text-xs font-medium bg-white uppercase tracking-wider"></th>
              <th
                className="border-l border-white bg-[#E2E2E2] px-2 py-1"
                colSpan={4}
                onClick={HandleElementClick}
              >
                <div className="flex flex-row items-center gap-2">
                  <div className="flex items-center p-1 gap-1 bg-[#EEEEEE] text-[#545454] rounded-sm">
                    <img src="Link.svg" alt="link" className="h-4 w-4" />
                    <span className="font-[400] text-xs">
                      Q3 Financial Overview
                    </span>
                  </div>
                  <img src="Arrow Sync.svg" alt="Sync" className="h-4 w-4" />
                </div>
              </th>
              <th className="bg-white border-l border-white" onClick={() => {toast.warning("This is an empty cell")}}></th>
              <th
                className="border-l border-white bg-[#D2E0D4] px-4 gap-2"
                onClick={HandleElementClick}
              >
                <div className="flex flex-row justify-center items-center py-0.5 px-1 gap-2">
                  <img
                    src="Green.svg"
                    alt="Split"
                    className="h-3 w-3"
                  />
                  <span className="text-sm font-[500] text-[#505450]">ABC</span>
                  <Ellipsis className="h-4 w-4 m-0.5 text-[#AFAFAF]" />
                </div>
              </th>
              <th
                className="border-l border-white px-4 gap-2 bg-[#DCCFFC]"
                colSpan={2}
                onClick={HandleElementClick}
              >
                <div className="flex flex-row justify-center items-center py-0.5 px-1 gap-2">
                  <img
                    src="Arrow_split_white.svg"
                    alt="Split"
                    className="h-3 w-3"
                  />
                  <span className="text-sm font-[500] text-[#463E59]">
                    Answer a question
                  </span>
                  <Ellipsis className="h-4 w-4 m-0.5 text-[#AFAFAF]" />
                </div>
              </th>
              <th
                className="border-l border-white px-4 gap-2 bg-[#FAC2AF]"
                onClick={HandleElementClick}
              >
                <div className="flex flex-row justify-center items-center py-0.5 px-1 gap-2">
                  <img
                    src="Arrow_split_white.svg"
                    alt="Split"
                    className="h-3 w-3"
                  />
                  <span className="text-sm font-[500] text-[#695149]">
                    Extract
                  </span>
                  <Ellipsis className="h-4 w-4 m-0.5 text-[#AFAFAF]" />
                </div>
              </th>
              <th
                className="px-2 gap-2 relative dashed-border-column z-10 border-b border-gray-200 cursor-pointer w-32"
                onClick={() => {
                  addNewColumn();
                  toast.success('New column added!');
                }}
              >
                <div className="flex items-center justify-center">
                  <img src="Add.svg" alt="Add column" className="h-5 w-5" />
                </div>
              </th>
            </tr>
            <tr className="border-b border-gray-200 h-8">
              <th className="border-l border-white bg-[#EEEEEE] pl-2 pr-1 w-8 h-8 py-1.5 flex items-center justify-center"
              onClick={() => {toast.success("This is the first cell of our Table")}}
              >
                <img
                  src="Hash.svg"
                  alt="Hash"
                  className="w-4 mr-1 h-4 text-left"
                />
              </th>
              {visibleColumns.map(column => (
                <th
                  key={column.key}
                  className={`border-l border-white pr-1 pl-2 gap-1 py-1.5 text-xs font-semibold uppercase tracking-wider cursor-pointer hover:bg-gray-100 ${column.class}`}
                  onClick={e => {
                    e.stopPropagation();
                    handleColumnClick(column.key);
                    toast.success(`${column.header} column is selected successfully`)
                  }}
                >
                  <div
                    className={`flex flex-row items-center gap-1 w-full ${column.icon && column.key !== 'assigned' ? 'justify-between' : 'justify-start'}`}
                  >
                    <div className="inline-flex flex-row gap-1 items-center">
                      {column.icon && (
                        <img
                          src={column.icon}
                          alt={column.header}
                          className="h-4 w-4"
                        />
                      )}
                      <div className="flex w-full items-center justify-center text-center pt-0.5">
                        {column.header}
                      </div>
                    </div>
                    {column.icon && column.key !== 'assigned' && (
                      <div className="p-1">
                        {sortConfig?.direction === 'asc' ? (
                          <ChevronUp
                            className="h-3 w-3"
                            onClick={() =>
                              column.sortable &&
                              handleSort(column.key as keyof Task)
                            }
                          />
                        ) : (
                          <ChevronDown
                            className="h-3 w-3"
                            onClick={() =>
                              column.sortable &&
                              handleSort(column.key as keyof Task)
                            }
                          />
                        )}
                      </div>
                    )}
                  </div>
                </th>
              ))}
              <th className="h-full relative dashed-border-column z-10 w-[124px]"></th>
            </tr>
          </thead>
          <tbody className="bg-white border-b border-gray-200 divide-y divide-gray-200">
            {filteredTasks.map((task, rowIndex) => (
              <tr
                key={task.id}
                className={`hover:bg-gray-50 ${
                  selectedRow === rowIndex
                    ? 'border-2 border-dashed border-red-300 bg-red-50 h-8'
                    : ''
                }`}
              >
                <td
                  className={`w-8 h-8 flex items-center justify-center cursor-pointer relative hover:bg-gray-100 
                    ${
                      selectedRow === rowIndex
                        ? 'bg-red-100 border-dashed border-red-300'
                        : ''
                    }`}
                  onClick={() => handleRowClick(rowIndex)}
                >
                  <span className="text-sm w-fit h-5 top-1.5 text-[#757575] font-[400]">
                    {task.id}
                  </span>
                </td>
                {visibleColumns.map(column => (
                  <td
                    key={`${task.id}-${column.key}`}
                    className={`border-l border-gray-200 px-2 gap-2 min-w-[124px] text-xs font-[400] text-[#121212] cursor-cell relative 
                        ${
                          selectedCell?.row === rowIndex &&
                          selectedCell?.col === column.key
                            ? 'bg-white ring-1 ring-[#6C8B70] ring-inset'
                            : ''
                        }
                        ${
                          selectedRow === rowIndex
                            ? 'bg-red-50 border-dashed border-red-300'
                            : ''
                        }
                        ${
                          selectedColumn === column.key
                            ? 'bg-red-50 border-r border-dashed border-red-300'
                            : ''
                        }
                        ${
                          column.key === 'status' || column.key === 'priority'
                            ? 'text-center'
                            : ''
                        }
                        ${
                          column.key === 'submitted' ||
                          column.key === 'dueDate' ||
                          column.key === 'estValue'
                            ? 'text-end'
                            : ''
                        }
                        ${column.key === 'url' ? '' : 'max-w-[256px]'}
                        `}
                    onClick={() => handleCellClick(rowIndex, column.key)}
                    onDoubleClick={() =>
                      handleCellDoubleClick(rowIndex, column.key)
                    }
                  >
                    {editingCell?.row === rowIndex &&
                    editingCell?.col === column.key ? (
                      <input
                        type="text"
                        value={editValue}
                        onChange={e => setEditValue(e.target.value)}
                        onBlur={handleEditSubmit}
                        onKeyDown={e => {
                          if (e.key === 'Enter') handleEditSubmit();
                          if (e.key === 'Escape') handleEditCancel();
                        }}
                        className="w-full px-1 py-0 text-sm border-none outline-none bg-transparent"
                        autoFocus
                      />
                    ) : (
                      <>
                        {column.key === 'status' && task[column.key] ? (
                          <span
                            className={`inline-flex px-2 py-1 w-fit text-xs font-semibold rounded-full border ${getStatusColor(task[column.key])}`}
                          >
                            {task[column.key]}
                          </span>
                        ) : column.key === 'priority' && task[column.key] ? (
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold ${getPriorityColor(task[column.key])}`}
                          >
                            {task[column.key]}
                          </span>
                        ) : (
                          <div
                            className={`text-gray-900 truncate 
                            ${column.key === 'url' ? 'w-[108px]' : ''}
                            `}
                          >
                            {formatValue(
                              column.key,
                              task[column.key as keyof Task]
                            )}
                            {column.key === 'estValue' && task[column.key] ? (
                              <span className="pl-1 text-xs text-[#AFAFAF]">
                                ₹
                              </span>
                            ) : (
                              ''
                            )}
                          </div>
                        )}
                      </>
                    )}
                  </td>
                ))}
                <td className="h-full relative dashed-border-column z-10 w-[124px]"></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SpreadsheetBody;
