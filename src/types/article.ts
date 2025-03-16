export interface Article {
  id: string;
  title: string;
  content: string;
  excerpt?: string;
  slug: string;
  category?: string;
  author: string;
  status: 'draft' | 'published';
  featured: boolean;
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

// ArticleFormData is what we get from the form, without id and date
export interface ArticleFormData {
  title: string;
  content: string;
  excerpt?: string;
  category?: string;
  author: string;
  status: 'draft' | 'published';
  featured: boolean;
  imageUrl?: string;
}

// For creating a new article, we need everything except the id
export type NewArticle = Omit<Article, 'id'>; 

// Shared categories across components
export const CATEGORIES = ['Politics', 'Technology', 'Sports', 'Entertainment', 'Business'];
export const ALL_CATEGORIES = ['All', ...CATEGORIES]; 