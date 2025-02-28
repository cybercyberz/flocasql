import { NextResponse } from 'next/server';
import { Article } from '@/types/article';
import { articleSchema } from '@/lib/validations';
import { ZodError } from 'zod';
import { articleStore } from '@/lib/store';

export async function GET() {
  return NextResponse.json(articleStore.getArticles());
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log('Received article data:', body);
    
    // Validate the request body
    try {
      const validatedData = articleSchema.parse(body);
      console.log('Validation successful:', validatedData);
      
      const newArticle: Article = {
        id: Date.now().toString(), // In a real app, use a proper ID generation method
        ...validatedData,
        date: new Date().toISOString(),
      };

      articleStore.addArticle(newArticle);
      console.log('Article created successfully:', newArticle);
      return NextResponse.json(newArticle, { status: 201 });
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