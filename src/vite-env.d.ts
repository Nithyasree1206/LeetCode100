/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_AUTH_API_KEY: string;
  readonly VITE_API_BASE: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
