export type Profile = {
  id: string;
  nickname: string;
  avatar_url: string | null;
  created_at: string;
};

export type Post = {
  id: string;
  created_at: string;
  body: string;
  is_anonymous: boolean;
  author_name: string | null;
  image_url: string | null;
  report_count: number;
  user_id: string;
  profiles?: Profile | null;
};

export type Comment = {
  id: string;
  post_id: string;
  created_at: string;
  body: string;
  is_anonymous: boolean;
  author_name: string | null;
  user_id: string;
};
