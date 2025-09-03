# Blog Application with Next.js, Supabase & Apollo Client

A fully functional blog application built with Next.js, Supabase for backend services, and Apollo Client for GraphQL operations. This project includes modern authentication, dark mode support, and a beautiful glassmorphism UI design.

## 🚀 Features

### Core Features
- ✅ **Homepage**: Paginated blog posts (5 per page) with title, excerpt, date, and author
- ✅ **Post Details**: Full blog post view with complete content and metadata
- ✅ **Create Posts**: Authenticated users can create new blog posts
- ✅ **Authentication**: Email/password, Google OAuth, and passwordless OTP login
- ✅ **Access Control**: Protected routes requiring authentication
- ✅ **Pagination**: GraphQL-powered pagination with smooth navigation

### Bonus Features Implemented
- ✅ **Form Validation**: React Hook Form with Zod validation schemas
- ✅ **Email OTP Login**: Passwordless authentication via Supabase
- ✅ **Optimistic UI**: Immediate UI updates when creating posts
- ✅ **Profile Management**: User profile dropdown with logout functionality
- ✅ **Dark Mode**: Complete dark/light theme support with localStorage persistence
- ✅ **Modern UI**: Glassmorphism design with smooth animations and transitions
- ✅ **Responsive Design**: Mobile-first approach with Tailwind CSS
- ✅ **Error Handling**: Comprehensive error states and user feedback

## 🛠 Tech Stack

- **Frontend**: Next.js 15.5.2 with TypeScript
- **Backend**: Supabase (Database, Auth, GraphQL API)
- **GraphQL**: Apollo Client for data fetching and mutations
- **Styling**: Tailwind CSS with custom glassmorphism components
- **Authentication**: Supabase Auth with multiple providers
- **Form Handling**: React Hook Form with Zod validation
- **Code Quality**: Biome for linting and formatting

## 📋 Prerequisites

Before running this project locally, make sure you have:

- Node.js 18+ installed
- npm or yarn package manager
- A Supabase account and project

## 🔧 Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/SumairAliMemon/task-devops.git
cd task-devops
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Supabase Database Setup

1. **Create a new Supabase project** at [supabase.com](https://supabase.com)
2. **Run the database schema**:
   - Go to your Supabase dashboard → SQL Editor
   - Copy and execute the contents of `supabase-schema.sql`

3. **Enable Row Level Security (RLS)**:
   - The schema includes RLS policies for secure data access
   - Posts can be read by everyone but only created by authenticated users
   - Profiles are automatically created and managed

4. **Configure Authentication Providers**:
   - Go to Authentication → Providers
   - Enable Email/Password authentication
   - Enable Google OAuth (optional, add your Google OAuth credentials)
   - Enable Email OTP for passwordless login

### 5. GraphQL API Setup

Supabase automatically generates a GraphQL API from your database schema. The API endpoint is:
```
https://your-project-ref.supabase.co/graphql/v1
```

## 🚀 Running the Application

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 📁 Project Structure

```
├── app/
│   ├── auth/                 # Authentication pages
│   ├── components/           # Reusable components
│   │   └── AddPostForm.tsx   # Post creation form
│   ├── posts/               # Blog posts pages
│   │   ├── [id]/            # Individual post view
│   │   └── page.tsx         # Posts listing with pagination
│   ├── globals.css          # Global styles
│   ├── layout.tsx           # Root layout
│   ├── page.tsx             # Homepage (redirects to auth/posts)
│   └── Providers.tsx        # App providers wrapper
├── graphql/
│   ├── queries.ts           # GraphQL queries
│   └── mutations.ts         # GraphQL mutations
├── lib/
│   ├── apollo.ts            # Apollo Client configuration
│   ├── profile.ts           # Profile management utilities
│   └── supabaseClient.ts    # Supabase client setup
├── supabase-schema.sql      # Database schema
└── README.md
```

## 🔐 Authentication Flow

The application implements a comprehensive authentication system:

1. **Email/Password**: Traditional login with Supabase Auth
2. **Google OAuth**: Social login integration
3. **Email OTP**: Passwordless login with magic links
4. **Profile Management**: Automatic profile creation and management
5. **Protected Routes**: Authentication guards for post creation

### Authentication Features:
- Automatic profile creation on first login
- Persistent sessions with automatic refresh
- Secure logout with session cleanup
- Profile dropdown with user information

## 📊 Database Schema

### Tables:
- **profiles**: User profiles with full_name and email
- **posts**: Blog posts with title, content, author relationship
- **Row Level Security**: Ensures data security and proper access control

### Relationships:
- Posts belong to profiles (author relationship)
- Automatic profile creation via triggers
- Secure data access through RLS policies

## 🎨 UI/UX Features

### Design System:
- **Glassmorphism**: Modern glass-like UI components
- **Dark/Light Mode**: Complete theme system with smooth transitions
- **Responsive Design**: Mobile-first approach
- **Smooth Animations**: Hover effects and page transitions
- **Loading States**: Skeleton screens and loading indicators
- **Error Handling**: User-friendly error messages and retry options

### Components:
- Modern authentication pages with social login
- Paginated posts grid with search and filtering
- Rich post creation form with validation
- Profile management and theme toggle
- Responsive navigation and mobile menu

## 🔧 Development Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run Biome linter
npm run format   # Format code with Biome
```

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Other Platforms
The application can be deployed on any platform supporting Next.js:
- Netlify
- AWS Amplify
- Railway
- Heroku

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org) for the incredible framework
- [Supabase](https://supabase.com) for backend services
- [Apollo Client](https://www.apollographql.com/docs/react/) for GraphQL integration
- [Tailwind CSS](https://tailwindcss.com) for styling system

## 📧 Contact

For questions or support, please contact:
- GitHub: [@SumairAliMemon](https://github.com/SumairAliMemon)
- Project Repository: [task-devops](https://github.com/SumairAliMemon/task-devops)

---

**Made with ❤️ using Next.js, Supabase, and modern web technologies**
