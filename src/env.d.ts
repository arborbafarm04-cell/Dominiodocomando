import type { PageMetadata } from "@wix/astro-pages";

/// <reference types="astro/client" />
/// <reference path="../.astro/types.d.ts" />

declare const Astro: Readonly<import("astro").AstroGlobal>;

declare global {
  interface SDKTypeMode {
    strict: true;
  }

  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }

  interface ImportMetaEnv {
    readonly BASE_NAME: string;
  }
}

declare module "react-router-dom" {
  export interface IndexRouteObject {
    routeMetadata?: PageMetadata;
  }
  export interface NonIndexRouteObject {
    routeMetadata?: PageMetadata;
  }
}

// Workaround for invalid property name in auto-generated entities/index.ts
// The _3D interface has a property named "3D" which is syntactically invalid
// This augmentation provides a valid accessor pattern
declare global {
  namespace EntityFix {
    interface _3D {
      ["3D"]?: any;
    }
  }
}
