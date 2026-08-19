declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        name?: string | null | undefined;
        emailVerified: boolean;
        image?: string | null | undefined;
        role?: string | null | undefined;
        phone?: string | null | undefined;
        status?: string | null | undefined;
        createdAt: Date;
        updatedAt: Date;
      };
    }
  }
}

export {};
