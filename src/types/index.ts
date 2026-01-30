// Core application types for Lahra's Life

export interface User {
  id: string;
  email: string;
  displayName: string;
  avatar?: string;
  role: 'user' | 'admin' | 'moderator';
  preferences: UserPreferences;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserPreferences {
  notifications: {
    email: boolean;
    push: boolean;
    comments: boolean;
    newContent: boolean;
    polls: boolean;
  };
  privacy: {
    showProfile: boolean;
    allowMentions: boolean;
  };
}

export interface ContentSection {
  id: string;
  type: 'daily-activity' | 'closet' | 'outfit' | 'dining' | 'snacks' | 'fun-facts' | 'mena-watchlist';
  title: string;
  content: string;
  images: ContentImage[];
  metadata: Record<string, any>;
  isPublished: boolean;
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ContentImage {
  id: string;
  url: string;
  altText: string;
  caption?: string;
  order: number;
  metadata: {
    width: number;
    height: number;
    format: string;
    size: number;
  };
}

export interface Poll {
  id: string;
  question: string;
  description?: string;
  options: PollOption[];
  allowMultipleVotes: boolean;
  isActive: boolean;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface PollOption {
  id: string;
  text: string;
  image?: string;
  voteCount: number;
  order: number;
}

export interface Vote {
  id: string;
  pollId: string;
  optionId: string;
  userId: string;
  createdAt: Date;
}

export interface Comment {
  id: string;
  contentId: string;
  contentType: string;
  userId: string;
  user: User;
  content: string;
  parentId?: string;
  replies?: Comment[];
  likes: number;
  isModerated: boolean;
  isApproved: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Donation {
  id: string;
  amount: number;
  currency: string;
  isRecurring: boolean;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  paymentIntentId: string;
  donorInfo?: {
    name?: string;
    email?: string;
    message?: string;
    isAnonymous: boolean;
  };
  userId?: string;
  createdAt: Date;
  completedAt?: Date;
}

export interface DonationStats {
  totalAmount: number;
  totalDonations: number;
  totalDonors: number;
  averageAmount: number;
}

// Component prop types
export interface LayoutProps {
  children: React.ReactNode;
  showSidebar?: boolean;
  sidebarContent?: React.ReactNode;
}

export interface NavigationProps {
  currentSection: string;
  user?: User;
  onSectionChange: (section: string) => void;
}

export interface ContentSectionProps {
  title: string;
  content: ContentSection[];
  layout: 'grid' | 'list' | 'carousel';
  allowComments?: boolean;
  showLikes?: boolean;
}

export interface PollWidgetProps {
  poll: Poll;
  userVote?: Vote;
  onVote: (optionId: string) => Promise<void>;
  showResults?: boolean;
  allowMultipleVotes?: boolean;
}