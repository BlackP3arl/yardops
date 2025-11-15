export declare enum NotificationType {
    NEW_ASSIGNMENT = "NEW_ASSIGNMENT",
    READING_DUE = "READING_DUE",
    READING_MISSED = "READING_MISSED"
}
export declare enum NotificationStatus {
    UNREAD = "UNREAD",
    READ = "READ"
}
export interface Notification {
    id: string;
    userId: string;
    type: NotificationType;
    title: string;
    message: string;
    status: NotificationStatus;
    metadata?: {
        meterId?: string;
        readingId?: string;
        dueDate?: string;
        [key: string]: any;
    };
    createdAt: string;
    readAt?: string;
}
export interface CreateNotificationRequest {
    userId: string;
    type: NotificationType;
    title: string;
    message: string;
    metadata?: Record<string, any>;
}
export interface NotificationStats {
    unreadCount: number;
    totalCount: number;
}
//# sourceMappingURL=notification.types.d.ts.map