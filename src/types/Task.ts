export interface Task {
  id: number;
  jobRequest: string;
  submitted: string;
  status: 'In-process' | 'Need to start' | 'Complete' | 'Blocked' | '';
  submitter: string;
  url: string;
  assigned: string;
  priority: 'High' | 'Medium' | 'Low' | '';
  dueDate: string;
  estValue: number;
}