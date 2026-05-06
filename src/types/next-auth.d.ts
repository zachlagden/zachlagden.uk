import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      githubUsername?: string;
      isAdmin?: boolean;
    };
  }

  interface User {
    githubUsername?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    githubUsername?: string;
    isAdmin?: boolean;
  }
}
