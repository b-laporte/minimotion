export interface ValueInterpolator<T = string> {
  getValue(easing: number): T;
}

export type ValueInterpolatorFactory<T = string> = (
  from: T,
  to: T,
  options?: {
    fromIsDom?: boolean;
    propName?: string;
    type?: string;
  }
) => ValueInterpolator<T> | null;
