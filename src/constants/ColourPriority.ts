export const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'text-[#EF4D44]';
      case 'Medium': return 'text-[#C29210]';
      case 'Low': return 'text-[#1A8CFF]';
      default: return 'text-gray-800';
    }
  };