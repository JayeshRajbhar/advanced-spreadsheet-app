import { ChevronsLeft, ChevronsRight } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { initialTasks } from '../constants/initialTasks';
import type { Task } from '../types/Task';

export function Toolbar(
  showColumnMenu: boolean,
  setShowColumnMenu: (value: boolean) => void,
  toggleColumnVisibility: (key: string) => void,
  columns: { key: string; header: string; visible: boolean }[]
) {
  const [Hide, setHide] = useState(true);
  const [tasks] = useState<Task[]>(initialTasks);
  const HandleHide = () => {
    if (Hide) {
      toast.success('Toolbar is hidden');
      console.log('Toolbar is hidden');
    } else {
      toast.success('Toolbar is visible!');
      console.log('Toolbar is visible!');
    }
  };
  const exportToExcel = () => {
    const visibleCols = columns.filter(col => col.visible);
    const flatData = tasks.map(task => {
      const obj: Record<string, string | number> = {};
      visibleCols.forEach(col => {
        obj[col.header] = task[col.key as keyof Task] ?? '';
      });
      return obj;
    });
    const ws = XLSX.utils.json_to_sheet(flatData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    const buf = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    saveAs(
      new Blob([buf], { type: 'application/octet-stream' }),
      'spreadsheet.xlsx'
    );
  };

  return (
    <div className="w-full flex flex-row border-b border-[#EEEEEE] bg-white px-2 py-1.5 gap-2 items-center">
      <div
        className="p-2 gap-1 flex flex-row items-center"
        onClick={() => {
          setHide(!Hide);
          HandleHide();
        }}
      >
        <span className="font-[400] whitespace-nowrap text-[#121212] text-sm cursor-pointer">
          Tool bar
        </span>
        {!Hide ? (
          <ChevronsLeft className="inline-flex h-4 w-4" />
        ) : (
          <ChevronsRight className="inline-flex h-4 w-4" />
        )}
      </div>

      <div className="h-6 w-[1px] bg-[#EEEEEE]" />

      {Hide ? (
        <div className="flex flex-row items-center gap-1 flex-1 min-w-0">
          <button
            onClick={() => setShowColumnMenu(!showColumnMenu)}
            className="flex items-center gap-1 pl-2 pr-3 py-2 text-sm text-[#121212] hover:bg-gray-100 rounded-md relative whitespace-nowrap"
            type="button"
          >
            <img src="Eye.svg" alt="Hide option" className="h-5 w-5" />
            Hide fields
            {showColumnMenu && (
              <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                {columns.map(column => (
                  <label
                    key={column.key}
                    className="flex items-center px-3 py-2 hover:bg-gray-50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={column.visible}
                      onChange={() => toggleColumnVisibility(column.key)}
                      className="mr-2"
                    />
                    <span className="text-sm">{column.header}</span>
                  </label>
                ))}
              </div>
            )}
          </button>
          <button
            onClick={() =>{
              toast.info(
                'Sort functionality is already implemented for every column, click on the column header dropdown button to sort!'
              );
              console.log('Sort functionality is already implemented for every column, click on the column header dropdown button to sort!')
            }
            }
            className="flex items-center gap-1 pl-2 pr-3 py-2 text-sm text-[#121212] hover:bg-gray-100 rounded-md whitespace-nowrap"
            type="button"
          >
            <img src="Arrow Sort.svg" alt="Sort" className="h-5 w-5" />
            Sort
          </button>
          <button
            onClick={() =>{
              toast.info('Data can be filtered using the tabs in the footer.');
              console.log('Data can be filtered using the tabs in the footer.');
            }
            }
            className="flex items-center gap-1 pl-2 pr-3 py-2 text-sm text-[#121212] hover:bg-gray-100 rounded-md whitespace-nowrap"
            type="button"
          >
            <img src="Filter.svg" alt="Filter" className="h-5 w-5" />
            Filter
          </button>
          <button
            onClick={() =>{
              toast.info('Cell view functionality will be implemented soon!'); console.log('Cell view functionality will be implemented soon!')}
            }
            className="flex items-center gap-1 pl-2 pr-3 py-2 text-sm text-[#121212] hover:bg-gray-100 rounded-md whitespace-nowrap"
            type="button"
          >
            <img src="Arrow Autofit.svg" alt="Cell view" className="h-5 w-5" />
            Cell view
          </button>
        </div>
      ) : (
        <div className="flex flex-row items-center gap-1 flex-1 min-w-0"></div>
      )}

      <div className="flex flex-row items-center gap-2">
        <button
          onClick={() => {toast.warning('Login to import data!'); console.log('Login to import data!')}}
          className="flex flex-row items-center gap-1 pr-3 pl-2 py-2 border border-[#EEEEEE] hover:bg-gray-100 rounded-md whitespace-nowrap"
          type="button"
        >
          <img src="Arrow Download.svg" alt="Import" className="h-5 w-5" />
          <span className="text-sm font-[400] text-[#545454] whitespace-nowrap">
            Import
          </span>
        </button>
        <button
          onClick={() => {
            toast.success('Data exported successfully!');
            console.log('Data exported successfully!');
            exportToExcel();
          }}
          className="flex flex-row items-center gap-1 pr-3 pl-2 py-2 border border-[#EEEEEE] hover:bg-gray-100 rounded-md whitespace-nowrap"
          type="button"
        >
          <img src="Arrow Upload.svg" alt="Export" className="h-5 w-5" />
          <span className="text-sm font-[400] text-[#545454] whitespace-nowrap">
            Export
          </span>
        </button>
        <button
          onClick={() =>{ toast.warning('Login to share data!'); console.log('Login to share data!')}}
          className="flex flex-row items-center gap-1 pr-3 pl-2 py-2 border border-[#EEEEEE] hover:bg-gray-100 rounded-md whitespace-nowrap"
          type="button"
        >
          <img src="Share.svg" alt="Share" className="h-5 w-5" />
          <span className="text-sm font-[400] text-[#545454] whitespace-nowrap">
            Share
          </span>
        </button>
        <button
          onClick={() =>{ toast.success('New action created!'); console.log('New action created!')}}
          className="inline-flex px-6 py-2 gap-1 bg-[#4B6A4F] text-white rounded-md shadow hover:bg-green-700 whitespace-nowrap"
          type="button"
        >
          <img src="Arrow_Split.svg" alt="Arrow Split" className="h-5 w-5" />
          <span className="font-[500] text-sm whitespace-nowrap">
            New Action
          </span>
        </button>
      </div>
    </div>
  );
}
