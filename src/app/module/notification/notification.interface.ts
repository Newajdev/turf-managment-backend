export interface INotification {
  title: string;
  message: string;
  type: "SYSTEM" | "BOOKING" | "PAYMENT" | "ALERT";
  link?: string;
  userId: string;
}
