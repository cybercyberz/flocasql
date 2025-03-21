import { PrismaClient } from '@prisma/client';
import { Article, ArticleFormData } from '@/types/article';

declare global {
  var prisma: PrismaClient | undefined;
}

const mapPrismaArticleToArticle = (prismaArticle: any): Article => ({
  id: prismaArticle.id,
  title: prismaArticle.title,
  content: prismaArticle.content,
  excerpt: prismaArticle.excerpt || undefined,
  slug: prismaArticle.slug,
  category: prismaArticle.category || undefined,
  status: prismaArticle.status as 'draft' | 'published',
  featured: prismaArticle.featured,
  imageUrl: prismaArticle.imageUrl || undefined,
  authorId: prismaArticle.authorId,
  author: prismaArticle.author?.name || 'Unknown',
  createdAt: prismaArticle.createdAt,
  updatedAt: prismaArticle.updatedAt
});

async function getArticles(): Promise<Article[]> {
  const prisma = new PrismaClient();
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
  } finally {
    await prisma.$disconnect();
  }
}

async function getArticleBySlug(slug: string): Promise<Article | null> {
  const prisma = new PrismaClient();
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
  } finally {
    await prisma.$disconnect();
  }
}

async function getArticleById(id: string): Promise<Article | null> {
  const prisma = new PrismaClient();
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
  } finally {
    await prisma.$disconnect();
  }
}

async function createArticle(data: ArticleFormData, authorId?: string): Promise<Article> {
  const prisma = new PrismaClient();
  try {
    // If authorId is not provided, try to find an existing user
    let userId = authorId;
    if (!userId) {
      // Try to find the first user in the database
      const firstUser = await prisma.user.findFirst();
      if (firstUser) {
        userId = firstUser.id;
      } else {
        // If no user exists, create a default user
        const defaultUser = await prisma.user.create({
          data: {
            email: 'admin@example.com',
            name: data.author || 'Admin', // Use the author name from the form data if available
            password: 'password' // In a real app, this should be hashed
          }
        });
        userId = defaultUser.id;
      }
    }

    // Create article with proper Prisma structure
    const article = await prisma.article.create({
      data: {
        title: data.title,
        content: data.content,
        excerpt: data.excerpt,
        slug: data.slug,
        category: data.category,
        status: data.status,
        featured: data.featured,
        imageUrl: data.imageUrl,
        author: {
          connect: { id: userId }
        }
      },
      include: {
        author: true
      }
    });
    return mapPrismaArticleToArticle(article);
  } catch (error) {
    console.error('Error creating article:', error);
    throw new Error('Failed to create article');
  } finally {
    await prisma.$disconnect();
  }
}

async function updateArticle(id: string, data: ArticleFormData): Promise<Article> {
  const prisma = new PrismaClient();
  try {
    // Get the existing article to preserve the authorId
    const existingArticle = await prisma.article.findUnique({
      where: { id },
      select: { authorId: true }
    });

    if (!existingArticle) {
      throw new Error('Article not found');
    }

    // Update article with proper Prisma structure
    const article = await prisma.article.update({
      where: { id },
      data: {
        title: data.title,
        content: data.content,
        excerpt: data.excerpt,
        slug: data.slug,
        category: data.category,
        status: data.status,
        featured: data.featured,
        imageUrl: data.imageUrl
      },
      include: {
        author: true
      }
    });
    return mapPrismaArticleToArticle(article);
  } catch (error) {
    console.error('Error updating article:', error);
    throw new Error('Failed to update article');
  } finally {
    await prisma.$disconnect();
  }
}

async function deleteArticle(id: string): Promise<void> {
  const prisma = new PrismaClient();
  try {
    await prisma.article.delete({
      where: { id }
    });
  } catch (error) {
    console.error('Error deleting article:', error);
    throw new Error('Failed to delete article');
  } finally {
    await prisma.$disconnect();
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
