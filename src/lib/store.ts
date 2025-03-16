'use client';

import { Article, ArticleFormData } from '@/types/article';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const mapPrismaArticleToArticle = (prismaArticle: any): Article => ({
  id: prismaArticle.id,
  title: prismaArticle.title,
  content: prismaArticle.content,
  excerpt: prismaArticle.excerpt || '',
  category: prismaArticle.category || '',
  author: prismaArticle.author?.name || '',
  status: prismaArticle.published ? 'published' : 'draft',
  featured: prismaArticle.featured || false,
  createdAt: prismaArticle.createdAt,
  updatedAt: prismaArticle.updatedAt
});

export class ArticleStore {
  private cache: Map<string, Article> = new Map();
  private lastFetch: number = 0;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  private shouldRefreshCache(): boolean {
    return Date.now() - this.lastFetch > this.CACHE_DURATION;
  }

  private clearCache(): void {
    this.cache.clear();
    this.lastFetch = 0;
  }

  async getArticles(options: { 
    status?: 'published' | 'draft',
    featured?: boolean,
    category?: string,
    limit?: number 
  } = {}): Promise<Article[]> {
    try {
      if (this.lastFetch > 0 && !this.shouldRefreshCache()) {
        return Array.from(this.cache.values());
      }

      const articles = await prisma.article.findMany({
        where: {
          published: options.status === 'published',
          ...(options.featured !== undefined && { featured: options.featured }),
          ...(options.category && { category: options.category })
        },
        orderBy: {
          createdAt: 'desc'
        },
        ...(options.limit && { take: options.limit }),
        include: {
          author: true
        }
      });

      this.clearCache();
      const mappedArticles = articles.map(mapPrismaArticleToArticle);
      mappedArticles.forEach(article => {
        this.cache.set(article.id, article);
      });

      this.lastFetch = Date.now();
      return mappedArticles;
    } catch (error) {
      console.error('Error fetching articles:', error);
      throw new Error('Failed to fetch articles');
    }
  }

  async getArticleById(id: string): Promise<Article | null> {
    if (this.cache.has(id) && !this.shouldRefreshCache()) {
      return this.cache.get(id)!;
    }

    try {
      const article = await prisma.article.findUnique({
        where: { id },
        include: {
          author: true
        }
      });

      if (!article) {
        return null;
      }

      const mappedArticle = mapPrismaArticleToArticle(article);
      this.cache.set(id, mappedArticle);
      return mappedArticle;
    } catch (error) {
      console.error('Error fetching article:', error);
      throw new Error('Failed to fetch article');
    }
  }

  async createArticle(data: ArticleFormData): Promise<Article> {
    try {
      const article = await prisma.article.create({
        data: {
          title: data.title,
          content: data.content,
          excerpt: data.excerpt,
          category: data.category,
          published: data.status === 'published',
          featured: data.featured,
          slug: data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          author: {
            connect: { id: data.author }
          }
        },
        include: {
          author: true
        }
      });

      const mappedArticle = mapPrismaArticleToArticle(article);
      this.cache.set(article.id, mappedArticle);
      return mappedArticle;
    } catch (error) {
      console.error('Error creating article:', error);
      throw new Error('Failed to create article');
    }
  }

  async updateArticle(id: string, data: Partial<ArticleFormData>): Promise<Article> {
    try {
      const article = await prisma.article.update({
        where: { id },
        data: {
          ...(data.title && { 
            title: data.title,
            slug: data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')
          }),
          ...(data.content && { content: data.content }),
          ...(data.excerpt && { excerpt: data.excerpt }),
          ...(data.category && { category: data.category }),
          ...(data.status && { published: data.status === 'published' }),
          ...(data.featured !== undefined && { featured: data.featured }),
          ...(data.author && {
            author: {
              connect: { id: data.author }
            }
          })
        },
        include: {
          author: true
        }
      });

      const mappedArticle = mapPrismaArticleToArticle(article);
      if (this.cache.has(id)) {
        this.cache.set(id, mappedArticle);
      }

      return mappedArticle;
    } catch (error) {
      console.error('Error updating article:', error);
      throw new Error('Failed to update article');
    }
  }

  async deleteArticle(id: string): Promise<void> {
    try {
      await prisma.article.delete({
        where: { id }
      });
      this.cache.delete(id);
    } catch (error) {
      console.error('Error deleting article:', error);
      throw new Error('Failed to delete article');
    }
  }

  async getFeaturedArticles(limit: number = 5): Promise<Article[]> {
    return this.getArticles({ featured: true, status: 'published', limit });
  }

  async getPublishedArticles(category?: string, limit?: number): Promise<Article[]> {
    return this.getArticles({ status: 'published', category, limit });
  }
}

export const articleStore = new ArticleStore(); 