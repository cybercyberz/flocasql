import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function removeArticles() {
  try {
    const articlesToRemove = [
      '1740892288015',
      '1740892724151'
    ];

    // First, try to verify if the articles exist
    const existingArticles = await prisma.article.findMany();
    
    console.log('\nFound articles:');
    existingArticles.forEach((article) => {
      console.log(article.id, '=>', article.title);
    });

    // Then attempt to delete them
    console.log('\nAttempting to delete articles...');
    for (const articleId of articlesToRemove) {
      try {
        await prisma.article.delete({
          where: { id: articleId }
        });
        console.log(`Successfully deleted article ${articleId}`);
      } catch (error) {
        console.error(`Error deleting article ${articleId}:`, error);
      }
    }
    
    console.log('\nDeletion process completed');
  } catch (error) {
    console.error('Error in removeArticles:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Execute the function
removeArticles()
  .then(() => {
    console.log('Script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  }); 