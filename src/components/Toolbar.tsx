import { ChevronsRight } from 'lucide-react';
import { toast } from 'sonner';

export function Toolbar(
  showColumnMenu: boolean,
  setShowColumnMenu: (value: boolean) => void,
  toggleColumnVisibility: (key: string) => void,
  columns: { key: string; header: string; visible: boolean }[]
) {
  return (
    <div className="w-full flex flex-row border-b border-[#EEEEEE] bg-white px-2 py-1.5 gap-2 items-center">
      <div className="p-2 gap-1 flex flex-row">
        <span
          onClick={() => toast.info('Toolbar is already visible!')}
          className="font-[400] text-nowrap text-[#121212] text-sm"
        >
          Tool bar
        </span>
        <ChevronsRight className="inline-flex h-4 w-4" />
      </div>

      <div className="h-6 w-[1px] bg-[#EEEEEE]"></div>

      <div className="flex flex-row items-center gap-1 w-full">
        <button
          onClick={() => setShowColumnMenu(!showColumnMenu)}
          className="flex items-center w-fit gap-1 pl-2 pr-3 py-2 text-sm text-[#121212] hover:bg-gray-100 rounded-md relative"
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
          onClick={() =>
            toast.info(
              'Sort functionality is already implemented for every column, click on the column header arrow to sort!'
            )
          }
          className="flex items-center w-fit gap-1 pl-2 pr-3 py-2 text-sm text-[#121212] hover:bg-gray-100 rounded-md"
        >
          <img src="Arrow Sort.svg" alt="Sort" className="h-5 w-5" />
          Sort
        </button>
        <button
          onClick={() =>
            toast.info('Filter functionality will be implemented soon!')
          }
          className="flex items-center w-fit gap-1 pl-2 pr-3 py-2 text-sm text-[#121212] hover:bg-gray-100 rounded-md"
        >
          <img src="Filter.svg" alt="Filter" className="h-5 w-5" />
          Filter
        </button>
        <button
          onClick={() =>
            toast.info('Cell view functionality will be implemented soon!')
          }
          className="flex items-center w-fit gap-1 pl-2 pr-3 py-2 text-sm text-[#121212] hover:bg-gray-100 rounded-md"
        >
          <img src="Arrow Autofit.svg" alt="Cell view" className="h-5 w-5" />
          Cell view
        </button>
      </div>

      <div className="w-fit flex flex-row items-center gap-2">
        <div className="flex flex-row items-center gap-2">
          <button
            onClick={() => toast.warning('Login to import data!')}
            className="flex flex-row w-fit items-center gap-1 pr-3 pl-2 py-2 border border-[#EEEEEE] hover:bg-gray-100 rounded-md"
          >
            <img src="Arrow Download.svg" alt="Import" className="h-5 w-5" />
            <div className="text-sm font-[400] text-[#545454] text-nowrap">
              Import
            </div>
          </button>
          <div
            onClick={() => toast.success('Data exported successfully!')}
            className="flex flex-row items-center gap-1 pr-3 pl-2 py-2 border border-[#EEEEEE] hover:bg-gray-100 rounded-md"
          >
            <img src="Arrow Upload.svg" alt="Export" className="h-5 w-5" />
            <div className="text-sm w-11.5 h-5 font-[400] text-[#545454] text-nowrap">
              Export
            </div>
          </div>
          <div
            onClick={() => toast.warning('Login to share data!')}
            className="flex flex-row items-center gap-1 pr-3 pl-2 py-2 border border-[#EEEEEE] hover:bg-gray-100 rounded-md"
          >
            <img src="Share.svg" alt="Share" className="h-5 w-5" />
            <div className="text-sm w-10 h-5 font-[400] text-[#545454] text-nowrap">
              Share
            </div>
          </div>
        </div>

        <button
          onClick={() => toast.success('New action created!')}
          className="inline-flex px-6 py-2 gap-1 bg-[#4B6A4F] text-white rounded-md shadow  hover:bg-green-700"
        >
          <img src="Arrow_Split.svg" alt="Arrow Split" className="h-5 w-5" />
          <span className="font-[500] text-sm h-5 w-19.5 text-nowrap">
            New Action
          </span>
        </button>
      </div>
    </div>
  );
}
