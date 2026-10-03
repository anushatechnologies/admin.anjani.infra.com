import blogsData from './blogs.json';

export interface BlogSection {
  heading?: string;
  subheading?: string;
  paragraphs: string[];
  bulletPoints?: string[];
  image?: string;
  imageCaption?: string;
}

export interface BlogArticle {
  id: string;
  slug: string;
  title: string;
  date: string;
  formattedDate: string;
  excerpt: string;
  category: string;
  image: string;
  readTime: string;
  author: {
    name: string;
    role: string;
    avatar: string;
  };
  introParagraphs: string[];
  sections: BlogSection[];
  conclusion?: string;
  featured?: boolean;
}

export const ALL_BLOGS: BlogArticle[] = blogsData as BlogArticle[];

export const BLOG_CATEGORIES: string[] = [
  'All Articles',
  'Apartment Interior Works',
  'Commercial Interiors',
  'Construction Materials',
  'Costing & Budgets',
  'Design Ideas',
  'False Ceilings',
  'Furniture Maintenance',
  'Home interior review',
  'Home Interiors',
  'Home Interiors in Chennai',
  'home interiors in kannur',
  'Interior Design Ideas',
  'Interior Design in Kerala',
  'Interior Designers Hyderabad',
  'Interior Designers in Mysore',
  'Kitchen Interior Design',
  'Modern Kitchens',
  'Uncategorized',
];

export function getAllBlogs(): BlogArticle[] {
  return ALL_BLOGS;
}

export function getBlogBySlug(slug: string): BlogArticle | undefined {
  return ALL_BLOGS.find((b) => b.slug.toLowerCase() === slug.toLowerCase());
}

export function getRelatedBlogs(currentSlug: string, category: string, limit = 2): BlogArticle[] {
  const sameCategory = ALL_BLOGS.filter(
    (b) => b.slug.toLowerCase() !== currentSlug.toLowerCase() && b.category.toLowerCase() === category.toLowerCase()
  );
  if (sameCategory.length >= limit) {
    return sameCategory.slice(0, limit);
  }
  const others = ALL_BLOGS.filter(
    (b) => b.slug.toLowerCase() !== currentSlug.toLowerCase() && !sameCategory.some((sc) => sc.id === b.id)
  );
  return [...sameCategory, ...others].slice(0, limit);
}

export function getPopularBlogs(limit = 3): BlogArticle[] {
  return ALL_BLOGS.filter((b) => b.featured).slice(0, limit);
}
