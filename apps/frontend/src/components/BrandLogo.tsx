export function BrandLogo({ className }: { className?: string }) {
  // Plain <img>, not next/image: SVGs aren't raster-optimized and next/image
  // blocks SVG sources by default (dangerouslyAllowSVG) even for local files.
  // eslint-disable-next-line @next/next/no-img-element
  return <img src="/brand/farmatodo-logo.svg" alt="Farmatodo" className={className} />;
}
