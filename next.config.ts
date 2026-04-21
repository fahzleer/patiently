import type { NextConfig } from "next";
import path from "path";

// Server-side stub — a Proxy that returns no-ops for any import.
// Firebase is "use client" only; all calls are inside useEffect and never
// run during SSR. The stub lets the server bundle resolve firebase/* imports
// without loading the actual browser SDK (which touches localStorage at
// module-init time and crashes under Bun's SSR environment).
const firebaseStub = path.join(process.cwd(), "src/lib/_firebase-stub.js");

const nextConfig: NextConfig = {
  webpack(config, { isServer }) {
    if (isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        "firebase/app": firebaseStub,
        "firebase/database": firebaseStub,
        "firebase/auth": firebaseStub,
        "firebase/firestore": firebaseStub,
        "firebase/storage": firebaseStub,
      };
    }
    return config;
  },
};

export default nextConfig;
