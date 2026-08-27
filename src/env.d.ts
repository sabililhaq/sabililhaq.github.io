/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly PUBLIC_CARTO_API_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
