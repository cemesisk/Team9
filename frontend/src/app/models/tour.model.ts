import { TourLog } from './tour-log.model';

export interface Tour {
  id?: number;
  name: string;
  description: string;
  from: string;
  to: string;
  transportType: string;
  distance: number;
  estimatedTime: string;
  imageUrl: string;
  logs: TourLog[];
}
