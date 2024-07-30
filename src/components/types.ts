export interface Author {
  name: string;
  avatar: string;
}
  
  export interface Category {
  id: string;
  name: string;
}
  
  export interface Post {
  id: string;
  title: string;
  publishDate: string;
  author: Author;
  summary: string;
  categories: Category[];
}