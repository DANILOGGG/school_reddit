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
  likes?: { count: number }[];
  reposts?: { count: number }[];
  comments?: { count: number }[];
};

export type Comment = {
  id: string;
  post_id: string;
  created_at: string;
  body: string;
  is_anonymous: boolean;
  author_name: string | null;
  user_id: string;
  gif_url: string | null;
  profiles?: Profile | null;
  comment_likes?: { count: number }[];
};

export type FriendshipStatus = "none" | "pending_sent" | "pending_received" | "friends";

export type Friendship = {
  id: string;
  requester_id: string;
  addressee_id: string;
  status: "pending" | "accepted";
  created_at: string;
};

export type Message = {
  id: string;
  sender_id: string;
  receiver_id: string;
  body: string | null;
  shared_post_id: string | null;
  created_at: string;
  read_at: string | null;
  shared_post?: Post | null;
};
