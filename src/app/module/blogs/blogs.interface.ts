export interface IBlogCreatePayload {
  title: string;
  excerpt: string;
  content: string;
  category: string;
  readingTime: string;
  image?: string;
}

export interface IBlogUpdatePayload {
  title?: string;
  excerpt?: string;
  content?: string;
  category?: string;
  readingTime?: string;
  image?: string;
}
