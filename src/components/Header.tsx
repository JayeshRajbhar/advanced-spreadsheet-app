import { ChevronRight, Ellipsis, Search } from 'lucide-react'
import { toast } from 'sonner';

interface SpreadsheetHeaderProps {
  search: string;
  setSearchTerm: (value: string) => void;
}

function Header({ search, setSearchTerm }: SpreadsheetHeaderProps) {
  return (
    <div className="flex justify-between w-[100%] border-b px-4 py-2 border-[#EEEEEE] bg-[#FFFFFF]">
      <div className="flex items-center gap-4">
        <div className="h-6 w-6 flex relative">
          <div
            onClick={() => toast.info('Feature will be implemented soon!')}
            className="w-5 h-4 px-0.5 pt-0.5 absolute top-1 left-0.5 rounded bg-[#618666]"
          >
            <div className="w-3 h-3 rounded-bl-xs rounded-tl-xs mb-0.5 bg-white"></div>
          </div>
        </div>

        <div className="flex items-center gap-1 text-sm font-medium text-[#AFAFAF]">
          <div className="flex items-center gap-1">
            <span onClick={() => toast.info('Feature comming soon!')}>
              Workspace
            </span>
            <ChevronRight className="w-3 h-3" />
            <span onClick={() => toast.info('Feature comming soon!')}>
              Folder 2
            </span>
            <ChevronRight className="w-3 h-3" />
          </div>
          <div className="flex items-center gap-2">
            <span
              onClick={() => toast.info('Feature comming soon!')}
              className="font-medium h-[20px] text-[#121212]"
            >
              Spreadsheet 3
            </span>
            <Ellipsis
              className="text-[#AFAFAF]"
              onClick={() => toast.info('coming soon!')}
            />
          </div>
        </div>
      </div>
      <div className="flex flex-row items-center gap-1">
        <div className="relative gap-2">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-[#AFAFAF]" />
            <input
              type="text"
              placeholder="Search within sheet"
              value={search}
              onChange={e => setSearchTerm(e.target.value)}
              className="p-3 bg-[#F6F6F6] font-[400] rounded-lg text-xs text-right"
            />
        </div>
        <div
            onClick={() => toast.info('Feature coming soon!')}
            className="relative p-2"
          >
            <img src="Alert.svg" alt="Notification" className='h-6 w-6'/>
            <div className="absolute p-2 flex items-center justify-center text-center top-0 right-0.5 h-4 w-4 bg-[#4B6A4F] rounded-full border-[2px] border-white">
              <span className="text-white text-[10px] font-medium">2</span>
            </div>
        </div>
        <div
            onClick={() => toast.info('Feature coming soon!')}
            className="flex flex-row py-1.5 pl-2 pr-3 gap-2 cursor-pointer transition-colors"
          >
            <img src="Ellipse 1.png" alt="User" className="h-7 w-7" />
            <div className="flex flex-col max-w-[120px]">
              <div className="text-xs w-14 h-4 text-[#121212]">John Doe</div>
              <div className="text-[10px] w-14 h-3 truncate text-[#757575]">
                john.doe@example.com
              </div>
            </div>
        </div>
      </div>
    </div>
  );
}

export default Header;