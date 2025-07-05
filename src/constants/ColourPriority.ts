export const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'text-red-800';
      case 'Medium': return 'text-yellow-800';
      case 'Low': return 'text-blue-800';
      default: return 'text-gray-800';
    }
  };