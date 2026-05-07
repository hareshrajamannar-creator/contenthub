import { forwardRef } from "react";
import svgPaths from "@/imports/svg-y1gexucine";
import { cn } from "@/app/components/ui/utils";

/** viewBox 19.5 / 18.75 */
const VIEW_W = 19.5;
const VIEW_H = 18.75;

/** ViewBox 19.5×18.75; default rail size matches Figma L1. */
export const BIRDEYE_LOGO_RAIL_PX = { w: 17.55, h: 16.875 } as const;

export type BirdeyeLogoMarkProps = {
  className?: string;
  /** Default true: decorative in rail / flyout. */
  "aria-hidden"?: boolean;
  /**
   * If set, height in px; width is derived from the viewBox aspect. Used for app entry
   * splash. Omit for default L1 rail dimensions.
   */
  sizePxHeight?: number;
  /**
   * Fill the parent box (e.g. motion `fixed` target); no explicit pixel `width`/`height`.
   */
  fitContainer?: boolean;
} & React.SVGAttributes<SVGSVGElement>;

export const BirdeyeLogoMark = forwardRef<SVGSVGElement, BirdeyeLogoMarkProps>(
  function BirdeyeLogoMark(
    { className, "aria-hidden": ariaHidden = true, sizePxHeight, fitContainer, ...rest },
    ref,
  ) {
    if (fitContainer) {
      return (
        <svg
          ref={ref}
          viewBox="0 0 19.5 18.75"
          fill="none"
          className={cn("block h-full w-full min-h-0 min-w-0 shrink-0", className)}
          preserveAspectRatio="xMidYMid meet"
          aria-hidden={ariaHidden}
          {...rest}
        >
          <path clipRule="evenodd" d={svgPaths.p23fcc000} fill="#2552ED" fillRule="evenodd" />
        </svg>
      );
    }

    const h = sizePxHeight !== undefined ? sizePxHeight : BIRDEYE_LOGO_RAIL_PX.h;
    const w = sizePxHeight !== undefined ? (VIEW_W / VIEW_H) * sizePxHeight : BIRDEYE_LOGO_RAIL_PX.w;

    return (
      <svg
        ref={ref}
        width={w}
        height={h}
        viewBox="0 0 19.5 18.75"
        fill="none"
        className={cn("shrink-0", className)}
        preserveAspectRatio="xMidYMid meet"
        aria-hidden={ariaHidden}
        {...rest}
      >
        <path clipRule="evenodd" d={svgPaths.p23fcc000} fill="#2552ED" fillRule="evenodd" />
      </svg>
    );
  },
);
