declare module 'geoproximity' {
  export type MountProximityOptions = {
    basePath?: string;
    sample?: boolean | unknown;
    share?: boolean;
    cartoApiKey?: string;
    labels?: Record<string, string>;
  };

  export type ProximityHandle = {
    destroy: () => void;
    getState: () => unknown;
    setState: (state: unknown) => void;
    onChange: (listener: (state: unknown) => void) => () => void;
  };

  export function mountProximity(
    root: HTMLElement,
    options?: MountProximityOptions,
  ): ProximityHandle;

  export function invalidateProximity(root: HTMLElement): void;
}
