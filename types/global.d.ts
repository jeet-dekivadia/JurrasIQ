/// <reference types="react" />
/// <reference types="node" />

declare namespace JSX {
  interface IntrinsicElements {
    [elemName: string]: any;
  }
}

declare module "*.csv" {
  const content: string;
  export default content;
} 