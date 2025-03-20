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
  createdAt: prismaArticle.createdAt,
  updatedAt: prismaArticle.updatedAt
});

export async function getArticles(): Promise<Article[]> {
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

export async function getArticleBySlug(slug: string): Promise<Article | null> {
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

export { Article, ArticleFormData };
