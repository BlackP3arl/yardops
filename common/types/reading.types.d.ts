export interface Reading {
    id: string;
    meterId: string;
    userId: string;
    value: number;
    readingDate: string;
    comment?: string;
    createdAt: string;
    updatedAt: string;
    meter?: {
        id: string;
        meterNumber: string;
        meterType: string;
        location?: {
            id: string;
            name: string;
        };
    };
    user?: {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
    };
}
export interface CreateReadingRequest {
    meterId: string;
    value: number;
    readingDate?: string;
    comment?: string;
}
export interface UpdateReadingRequest {
    value?: number;
    readingDate?: string;
    comment?: string;
}
export interface ReadingStats {
    totalReadings: number;
    pendingReadings: number;
    missedReadings: number;
    byFrequency: {
        daily: number;
        weekly: number;
        monthly: number;
        adHoc: number;
    };
}
export interface MeterReadingHistory {
    meter: {
        id: string;
        meterNumber: string;
        meterType: string;
        location: {
            id: string;
            name: string;
        };
    };
    readings: Reading[];
    lastReading?: Reading;
    nextDueDate?: string;
    isOverdue: boolean;
}
//# sourceMappingURL=reading.types.d.ts.map