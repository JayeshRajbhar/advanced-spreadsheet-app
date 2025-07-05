import type { Task } from '../types/Task';

export interface Column {
  key: keyof Task | string; 
  header: string;
  width: number;
  visible: boolean;
  sortable: boolean;
  class: string;
  icon: string;
}