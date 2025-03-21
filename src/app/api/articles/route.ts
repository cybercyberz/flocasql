import { NextResponse } from 'next/server';
import { ArticleFormData } from '@/types/article';
import { articleSchema } from '@/lib/validations';
import { ZodError } from 'zod';
import { articleStore } from '@/lib/store';
import { headers } from 'next/headers';

export async function GET() {
  try {
    const headersList = headers();
    const articles = await articleStore.getArticles();

    return new NextResponse(JSON.stringify(articles), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store, must-revalidate',
        'Access-Control-Allow-Origin': '*'
      }
    });
  } catch (error) {
    console.error('Error fetching articles:', error);
    return new NextResponse(
      JSON.stringify({
        error: 'Failed to fetch articles',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store'
        }
      }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log('Received article data:', body);

    // Validate the request body
    try {
      const validatedData = articleSchema.parse(body);
      console.log('Validation successful:', validatedData);

      // ArticleStore.createArticle now handles timestamps
      const createdArticle = await articleStore.createArticle(validatedData);

      console.log('Article created successfully:', createdArticle);
      return NextResponse.json(createdArticle, { status: 201 });
    } catch (validationError) {
      console.error('Validation error:', validationError);
      if (validationError instanceof ZodError) {
        return NextResponse.json(
          { error: 'Validation failed', details: validationError.errors },
          { status: 400 }
        );
      }
      throw validationError;
    }
  } catch (error) {
    console.error('Error creating article:', error);
    return NextResponse.json(
      { error: 'Failed to create article', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
