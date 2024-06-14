interface ISocialProfile {
  backgroundImage?: {
    ipfs_cid?: string;
    url?: string;
  };
  description?: string;
  linktree?: {
    github?: string;
    twitter?: string;
    website?: string;
  };
  name?: string;
  image?: {
    ipfs_cid?: string;
    url?: string;
  };
  tags?: Record<string, ''>;
}

export default ISocialProfile;
