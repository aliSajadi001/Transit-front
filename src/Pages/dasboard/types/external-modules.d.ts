/* Silence missing type declarations for third-party libs without .d.ts */

declare module "arabic-persian-reshaper" {
  export function reshape(input: string): string;
  export const PersianArabicReshaper: { convert(input: string): string };
  const defaultExport:
    | ((input: string) => string)
    | { reshape: (input: string) => string }
    | { PersianArabicReshaper: { convert(input: string): string } };
  export default defaultExport;
}

declare module "bidi-js" {
  export const bidi: {
    from_string(input: string): { write_reordered(): string };
  };
  const defaultExport:
    | ((input: string) => string)
    | { bidi: { from_string(input: string): { write_reordered(): string } } };
  export default defaultExport;
}
