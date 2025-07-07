import { useState } from 'react';
import Header from './Header';
import { initialColumns } from '../constants/initialColumns';
import type { Task } from '../types/Task';
import type { Column } from '../types/Column';
import { Footer } from './Footer';
import { Toolbar } from './Toolbar';
import SpreadsheetBody from './SpreadsheetBody';
import { toast } from 'sonner';

const SpreadsheetApp = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showColumnMenu, setShowColumnMenu] = useState(false);
  const [totalRows, setTotalRows] = useState(25);
  const [activeTab, setActiveTab] = useState('All Orders');
  const toggleColumnVisibility = (columnKey: keyof Task | string) => {
    setColumns(prev =>
      prev.map(col =>
        col.key === columnKey ? { ...col, visible: !col.visible } : col
      )
    );
    console.log(`${columnKey} column is hidden Successfully`);
    toast.success(`${columnKey} column is hidden Successfully`);
  };
  const [columns, setColumns] = useState<Column[]>(initialColumns);
  const addNewRow = () => {
    setTotalRows(prev => prev + 1);
  };

  return (
    <div className="min-h-screen w-full bg-gray-50 font-worksans">
      {/* Header */}
      <Header search={searchTerm} setSearchTerm={setSearchTerm} />

      {/* Toolbar */}
      {Toolbar(
        showColumnMenu,
        setShowColumnMenu,
        toggleColumnVisibility,
        columns
      )}

      {/* Spreadsheet Body */}
      <SpreadsheetBody
        searchTerm={searchTerm}
        totalRow={totalRows}
        setTotalRows={setTotalRows}
        activeTab={activeTab}
        columns={columns}
        setColumns={setColumns}
      />

      {/* Footer */}
      <Footer onAddRow={addNewRow} setActiveTab={setActiveTab} />
    </div>
  );
};

export default SpreadsheetApp;
