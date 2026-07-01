"use client";

import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

function IconBase({ className, children, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  );
}

export function BrandCloudIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M7 17a4 4 0 0 1-.94-7.88A5.5 5.5 0 0 1 16.9 8 4 4 0 1 1 17 17Z" />
      <path d="m10.5 13 1.5-1.7L13.5 13" />
      <path d="M12 11.3V17" />
    </IconBase>
  );
}

export function UploadArrowIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M12 17V7" />
      <path d="m8.5 10.5 3.5-3.5 3.5 3.5" />
      <path d="M5 19h14" />
    </IconBase>
  );
}

export function DocumentIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M8 3.75h6l4 4V20a1.75 1.75 0 0 1-1.75 1.75h-8.5A1.75 1.75 0 0 1 6 20V5.5A1.75 1.75 0 0 1 7.75 3.75Z" />
      <path d="M14 3.75V8h4" />
      <path d="M9.5 13h5" />
      <path d="M9.5 16.5h5" />
    </IconBase>
  );
}

export function EyeIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M2.4 12s3.4-6 9.6-6 9.6 6 9.6 6-3.4 6-9.6 6-9.6-6-9.6-6Z" />
      <circle cx="12" cy="12" r="2.8" />
    </IconBase>
  );
}

export function ChatIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M5.5 18.5 4 21l4.2-1.2A8.5 8.5 0 1 0 3.5 12c0 2.46 1.03 4.68 2.68 6.25Z" />
    </IconBase>
  );
}

export function SparkIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="m12 2 1.25 3.75L17 7l-3.75 1.25L12 12l-1.25-3.75L7 7l3.75-1.25L12 2Z" />
      <path d="m18.5 14 .8 2.2 2.2 .8-2.2 .8-.8 2.2-.8-2.2-2.2-.8 2.2-.8.8-2.2Z" />
      <path d="m5.5 14 .65 1.85L8 16.5l-1.85 .65L5.5 19l-.65-1.85L3 16.5l1.85-.65L5.5 14Z" />
    </IconBase>
  );
}

export function ZoomInIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <circle cx="11" cy="11" r="6.5" />
      <path d="M20 20l-4.2-4.2" />
      <path d="M11 8.2v5.6" />
      <path d="M8.2 11h5.6" />
    </IconBase>
  );
}

export function ZoomOutIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <circle cx="11" cy="11" r="6.5" />
      <path d="M20 20l-4.2-4.2" />
      <path d="M8.2 11h5.6" />
    </IconBase>
  );
}

export function CloseIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M6 6l12 12" />
      <path d="M18 6 6 18" />
    </IconBase>
  );
}

export function ArrowRightIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </IconBase>
  );
}

export function CheckCircleIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="m8.5 12 2.2 2.2 4.8-4.9" />
    </IconBase>
  );
}

export function SendIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="m21 3-9.5 18-1.8-6.7L3 12l18-9Z" />
      <path d="M21 3 9.7 14.3" />
    </IconBase>
  );
}
