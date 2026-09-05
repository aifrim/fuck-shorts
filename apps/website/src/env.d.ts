/// <reference types="astro/client" />
/// <reference types="@cloudflare/workers-types" />

interface ImportMetaEnv {
  readonly PUBLIC_PETITION_START: string;
  readonly PUBLIC_SITE_ORIGIN?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

type Runtime = import("@astrojs/cloudflare").Runtime<Record<string, unknown>>;

declare namespace App {
  interface Locals extends Runtime {
    /** Cloudflare ExecutionContext when available. */
    cfContext?: ExecutionContext;
  }
}

/** Cloudflare / Astro binary module (ArrayBuffer of file bytes). */
declare module "*.bin" {
  const data: ArrayBuffer;
  export default data;
}
