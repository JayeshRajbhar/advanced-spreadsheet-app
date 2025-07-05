export const getStatusColor = (status: string) => {
    switch (status) {
      case 'In-process': return 'bg-yellow-100 text-yellow-800 border-0';
      case 'Need to start': return 'bg-[#E2E8F0] text-[#475569] border-0';
      case 'Complete': return 'bg-green-100 text-green-700 border-0';
      case 'Blocked': return 'bg-red-100 text-red-700 border-0';
      default: return 'bg-gray-100 text-gray-700 border-0';
    }
  };