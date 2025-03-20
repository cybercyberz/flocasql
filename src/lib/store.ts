import { PrismaClient } from '@prisma/client';

declare global {
  var prisma: PrismaClient | undefined;
}

// Singleton PrismaClient instance
const prisma = global.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') global.prisma = prisma;

interface Article {
  id: string;
  title: string;
  content: string;
  excerpt?: string;
  slug: string;
  category?: string;
  status: string;
  featured: boolean;
  imageUrl?: string;
  authorId: string;
  author: string;
  createdAt: Date;
  updatedAt: Date;
}

interface ArticleFormData {
  title: string;
  content: string;
  excerpt?: string;
  slug: string;
  category?: string;
  status: string;
  featured: boolean;
  imageUrl?: string;
}

const mapPrismaArticleToArticle = (prismaArticle: any): Article => ({
  id: prismaArticle.id,
  title: prismaArticle.title,
  content: prismaArticle.content,
  excerpt: prismaArticle.excerpt || undefined,
  slug: prismaArticle.slug,
  category: prismaArticle.category || undefined,
  status: prismaArticle.status,
  featured: prismaArticle.featured,
  imageUrl: prismaArticle.imageUrl || undefined,
  authorId: prismaArticle.authorId,
  author: prismaArticle.author?.name || 'Unknown',
  createdAt: prismaArticle.createdAt,
  updatedAt: prismaArticle.updatedAt
});

async function getArticles(): Promise<Article[]> {
  try {
    const articles = await prisma.article.findMany({
      include: {
        author: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    return articles.map(mapPrismaArticleToArticle);
  } catch (error) {
    console.error('Error fetching articles:', error);
    throw new Error('Failed to fetch articles');
  }
}

async function getArticleBySlug(slug: string): Promise<Article | null> {
  try {
    const article = await prisma.article.findUnique({
      where: { slug },
      include: {
        author: true
      }
    });
    return article ? mapPrismaArticleToArticle(article) : null;
  } catch (error) {
    console.error('Error fetching article:', error);
    throw new Error('Failed to fetch article');
  }
}

async function getArticleById(id: string): Promise<Article | null> {
  try {
    const article = await prisma.article.findUnique({
      where: { id },
      include: {
        author: true
      }
    });
    return article ? mapPrismaArticleToArticle(article) : null;
  } catch (error) {
    console.error('Error fetching article by ID:', error);
    throw new Error('Failed to fetch article');
  }
}

async function createArticle(data: ArticleFormData, authorId: string): Promise<Article> {
  try {
    const article = await prisma.article.create({
      data: {
        ...data,
        authorId
      }
    });
    return mapPrismaArticleToArticle(article);
  } catch (error) {
    console.error('Error creating article:', error);
    throw new Error('Failed to create article');
  }
}

async function updateArticle(id: string, data: ArticleFormData): Promise<Article> {
  try {
    const article = await prisma.article.update({
      where: { id },
      data
    });
    return mapPrismaArticleToArticle(article);
  } catch (error) {
    console.error('Error updating article:', error);
    throw new Error('Failed to update article');
  }
}

async function deleteArticle(id: string): Promise<void> {
  try {
    await prisma.article.delete({
      where: { id }
    });
  } catch (error) {
    console.error('Error deleting article:', error);
    throw new Error('Failed to delete article');
  }
}

// Export the articleStore object with all methods
export const articleStore = {
  getArticles,
  getArticleBySlug,
  getArticleById,
  createArticle,
  updateArticle,
  deleteArticle
};

export type { Article, ArticleFormData }; 