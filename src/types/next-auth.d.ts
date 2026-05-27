import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      nip: string;
      role: string;
      bidang: string;
      subBidang: string;
      jenjangJabatan: string;
      tlGroup?: string;
    };
  }

  interface User {
    id: string;
    nip: string;
    role: string;
    bidang: string;
    subBidang: string;
    jenjangJabatan: string;
    tlGroup?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    nip: string;
    role: string;
    bidang: string;
    subBidang: string;
    jenjangJabatan: string;
    tlGroup?: string;
  }
}
