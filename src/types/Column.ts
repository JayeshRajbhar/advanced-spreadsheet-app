import type { Task } from '../types/Task';

export interface Column {
  key: keyof Task | string; 
  header: string;
  visible: boolean;
  sortable: boolean;
  class: string;
  icon: string;
}