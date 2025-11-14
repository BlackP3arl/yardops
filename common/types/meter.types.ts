export enum MeterType {
  WATER = 'WATER',
  ELECTRIC = 'ELECTRIC',
}

export enum ReadingFrequency {
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
  AD_HOC = 'AD_HOC',
}

export interface Location {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateLocationRequest {
  name: string;
  description?: string;
}

export interface UpdateLocationRequest {
  name?: string;
  description?: string;
}

export interface Meter {
  id: string;
  meterNumber: string;
  meterType: MeterType;
  locationId: string;
  frequency: ReadingFrequency;
  location?: Location;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMeterRequest {
  meterNumber: string;
  meterType: MeterType;
  locationId: string;
  frequency: ReadingFrequency;
}

export interface UpdateMeterRequest {
  meterNumber?: string;
  meterType?: MeterType;
  locationId?: string;
  frequency?: ReadingFrequency;
}

export interface MeterAssignment {
  id: string;
  meterId: string;
  userId: string;
  assignedAt: string;
  assignedBy?: string;
  meter?: Meter;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export interface AssignMeterRequest {
  meterId: string;
  userId: string;
}

export interface ScheduledReading {
  id: string;
  meterId: string;
  scheduledDate: string;
  dueDate: string;
  createdAt: string;
  updatedAt: string;
  meter?: Meter;
}

export interface CreateScheduledReadingRequest {
  meterId: string;
  scheduledDate: string;
  dueDate: string;
}

