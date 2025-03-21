# floca.id - Modern News Platform

A modern, responsive news website built with Next.js, TypeScript, and Tailwind CSS. Features a full-featured admin dashboard for managing articles and content.

## Features

- 🚀 Built with Next.js 14 and TypeScript
- 💅 Styled with Tailwind CSS
- 📝 Rich text editing with TinyMCE
- 🖼️ Image upload and management with Cloudinary
- ✨ Modern, responsive design
- 🔍 Search functionality
- 📱 Mobile-friendly interface
- 🔐 Admin dashboard for content management
- ✅ Form validation with Zod
- 🗄️ PostgreSQL database with Prisma ORM

## Getting Started

1. Clone the repository:
```bash
git clone https://github.com/yourusername/floca.id.git
cd floca.id
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Set up environment variables:
   - Copy `.env.example` to `.env.local`:
     ```bash
     cp .env.example .env.local
     ```
   - Update the variables in `.env.local` with your actual values:
     ```
     # PostgreSQL Configuration
     DATABASE_URL=                          # Your PostgreSQL connection string

     # TinyMCE Configuration
     NEXT_PUBLIC_TINYMCE_API_KEY=          # From TinyMCE Dashboard

     # Cloudinary Configuration
     NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=    # From Cloudinary Dashboard
     NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET= # From Cloudinary Dashboard

     # JWT Configuration
     JWT_SECRET=                           # Your JWT secret key
     ```

   Note: Never commit your `.env.local` file to version control!

4. Set up the database:
```bash
npx prisma migrate dev
```

5. Run the development server:
```bash
npm run dev
# or
yarn dev
```

6. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

- `/src/app` - Next.js app router pages and layouts
- `/src/components` - Reusable React components
- `/src/lib` - Utility functions and validations
- `/src/types` - TypeScript type definitions
- `/public` - Static assets
- `/prisma` - Database schema and migrations

## Deployment

### Vercel Deployment

1. Push your code to GitHub
2. Import your repository to Vercel
3. Add all required environment variables in Vercel's dashboard:
   - Go to Project Settings > Environment Variables
   - Add all variables from your `.env.local` file
   - You can set different values for Production, Preview, and Development environments

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
