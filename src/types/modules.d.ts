declare module 'clsx' {
  export type ClassValue = string | number | boolean | null | undefined | ClassValue[];
  export default function clsx(...args: ClassValue[]): string;
}

declare module 'tailwind-merge' {
  export default function twMerge(...classNames: string[]): string;
}
