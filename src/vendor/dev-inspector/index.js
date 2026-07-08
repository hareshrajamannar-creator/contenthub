// src/react/DevInspector.tsx
import * as React3 from "react";

// src/core/inspectorCss.ts
var SKIP_VALUES = /* @__PURE__ */ new Set([
  "none",
  "normal",
  "auto",
  "initial",
  "inherit",
  "unset",
  "revert",
  "0px",
  "0",
  "0s",
  "0ms",
  "rgba(0, 0, 0, 0)",
  "transparent"
]);
function shouldInclude(value) {
  const v = value.trim();
  if (!v) return false;
  if (SKIP_VALUES.has(v)) return false;
  if (v === "opacity: 1" || v === "1") return false;
  return true;
}
function addProp(props, name, value) {
  if (shouldInclude(value)) {
    props.push({ name, value: value.trim() });
  }
}
function shorthandBox(prefix, style) {
  const top = style.getPropertyValue(`${prefix}-top`);
  const right = style.getPropertyValue(`${prefix}-right`);
  const bottom = style.getPropertyValue(`${prefix}-bottom`);
  const left = style.getPropertyValue(`${prefix}-left`);
  const props = [];
  if (top === right && right === bottom && bottom === left) {
    addProp(props, prefix, top);
  } else {
    addProp(props, `${prefix}-top`, top);
    addProp(props, `${prefix}-right`, right);
    addProp(props, `${prefix}-bottom`, bottom);
    addProp(props, `${prefix}-left`, left);
  }
  return props;
}
function borderProps(style) {
  const props = [];
  const width = style.borderTopWidth;
  const styleVal = style.borderTopStyle;
  const color = style.borderTopColor;
  const same = width === style.borderRightWidth && width === style.borderBottomWidth && width === style.borderLeftWidth && styleVal === style.borderRightStyle && styleVal === style.borderBottomStyle && styleVal === style.borderLeftStyle && color === style.borderRightColor && color === style.borderBottomColor && color === style.borderLeftColor;
  if (same && shouldInclude(width) && shouldInclude(styleVal)) {
    addProp(props, "border", `${width} ${styleVal} ${color}`.trim());
  } else {
    addProp(
      props,
      "border-top",
      `${style.borderTopWidth} ${style.borderTopStyle} ${style.borderTopColor}`.trim()
    );
    addProp(
      props,
      "border-right",
      `${style.borderRightWidth} ${style.borderRightStyle} ${style.borderRightColor}`.trim()
    );
    addProp(
      props,
      "border-bottom",
      `${style.borderBottomWidth} ${style.borderBottomStyle} ${style.borderBottomColor}`.trim()
    );
    addProp(
      props,
      "border-left",
      `${style.borderLeftWidth} ${style.borderLeftStyle} ${style.borderLeftColor}`.trim()
    );
  }
  const radius = style.borderRadius;
  if (shouldInclude(radius)) {
    addProp(props, "border-radius", radius);
  }
  return props;
}
function insetProps(style) {
  const props = [];
  if (style.position === "static") return props;
  addProp(props, "position", style.position);
  addProp(props, "top", style.top);
  addProp(props, "right", style.right);
  addProp(props, "bottom", style.bottom);
  addProp(props, "left", style.left);
  addProp(props, "z-index", style.zIndex);
  return props;
}
function formatElementLabel(el, rect) {
  const tag = el.tagName.toLowerCase();
  const id = el.id ? `#${el.id}` : "";
  const classList = el.classList;
  const firstClass = classList.length > 0 ? `.${classList[0].replace(/\s/g, ".")}` : "";
  const size = rect ? ` \xB7 ${Math.round(rect.width)}\xD7${Math.round(rect.height)}` : "";
  return `${tag}${id}${firstClass}${size}`;
}
function formatSelectorHint(el) {
  const tag = el.tagName.toLowerCase();
  const id = el.id ? `#${el.id}` : "";
  const dataSlot = el.getAttribute("data-slot");
  const slot = dataSlot ? `[data-slot="${dataSlot}"]` : "";
  const classList = el.classList;
  const firstClass = classList.length > 0 ? `.${classList[0]}` : "";
  return `${tag}${id}${slot}${firstClass}`;
}
function buildInspectorSpec(el) {
  const style = getComputedStyle(el);
  const rect = el.getBoundingClientRect();
  const layout = [];
  addProp(layout, "display", style.display);
  addProp(layout, "width", style.width);
  addProp(layout, "height", style.height);
  addProp(layout, "min-width", style.minWidth);
  addProp(layout, "min-height", style.minHeight);
  addProp(layout, "max-width", style.maxWidth);
  addProp(layout, "max-height", style.maxHeight);
  layout.push(...shorthandBox("padding", style));
  layout.push(...shorthandBox("margin", style));
  addProp(layout, "gap", style.gap);
  addProp(layout, "flex-direction", style.flexDirection);
  addProp(layout, "align-items", style.alignItems);
  addProp(layout, "justify-content", style.justifyContent);
  addProp(layout, "overflow", style.overflow);
  addProp(layout, "overflow-x", style.overflowX);
  addProp(layout, "overflow-y", style.overflowY);
  layout.push(...insetProps(style));
  const typography = [];
  addProp(typography, "font-family", style.fontFamily);
  addProp(typography, "font-size", style.fontSize);
  addProp(typography, "font-weight", style.fontWeight);
  addProp(typography, "line-height", style.lineHeight);
  addProp(typography, "letter-spacing", style.letterSpacing);
  addProp(typography, "color", style.color);
  addProp(typography, "text-align", style.textAlign);
  addProp(typography, "text-transform", style.textTransform);
  const background = [];
  addProp(background, "background-color", style.backgroundColor);
  addProp(background, "background-image", style.backgroundImage);
  addProp(background, "backdrop-filter", style.backdropFilter);
  const border = borderProps(style);
  const effects = [];
  addProp(effects, "box-shadow", style.boxShadow);
  if (style.opacity !== "1") {
    addProp(effects, "opacity", style.opacity);
  }
  addProp(effects, "filter", style.filter);
  const motion = [];
  const transition = style.transition;
  const isDefaultTransition = !transition || transition === "all" || transition.startsWith("all 0s") || transition === "none";
  if (!isDefaultTransition) {
    addProp(motion, "transition", transition);
  } else {
    addProp(motion, "transition-property", style.transitionProperty);
    addProp(motion, "transition-duration", style.transitionDuration);
    addProp(
      motion,
      "transition-timing-function",
      style.transitionTimingFunction
    );
    addProp(motion, "transition-delay", style.transitionDelay);
  }
  const animationName = style.animationName;
  if (animationName && animationName !== "none") {
    addProp(motion, "animation", style.animation);
    addProp(motion, "animation-name", animationName);
    addProp(motion, "animation-duration", style.animationDuration);
    addProp(
      motion,
      "animation-timing-function",
      style.animationTimingFunction
    );
  }
  const sections = [
    { title: "Layout", properties: layout },
    { title: "Typography", properties: typography },
    { title: "Background", properties: background },
    { title: "Border", properties: border },
    { title: "Effects", properties: effects },
    { title: "Transition", properties: motion }
  ].filter((s) => s.properties.length > 0);
  return {
    label: formatElementLabel(el, rect),
    selectorHint: formatSelectorHint(el),
    sections
  };
}
function sectionToCss(section) {
  return section.properties.map((p) => `  ${p.name}: ${p.value};`).join("\n");
}
function specToCss(spec) {
  const lines = [`/* ${spec.selectorHint} */`];
  for (const section of spec.sections) {
    lines.push("", `/* ${section.title} */`);
    for (const prop of section.properties) {
      lines.push(`${prop.name}: ${prop.value};`);
    }
  }
  return lines.join("\n").trim();
}

// src/core/types.ts
var INSPECTOR_ATTR = "data-dev-inspector";
var MEASURE_COLOR = "#3b82f6";
var MEASURE_HATCH = `repeating-linear-gradient(-45deg, ${MEASURE_COLOR}40 0, ${MEASURE_COLOR}40 1.5px, transparent 1.5px, transparent 6px)`;

// src/core/dom.ts
function isInsideInspector(target) {
  return target instanceof Element && Boolean(target.closest(`[${INSPECTOR_ATTR}]`));
}
function pickInspectableElement(x, y) {
  const stack = document.elementsFromPoint(x, y);
  for (const el of stack) {
    if (el.closest(`[${INSPECTOR_ATTR}]`)) continue;
    if (el === document.documentElement || el === document.body) continue;
    return el;
  }
  return null;
}
function rectFromElement(el) {
  const rect = el.getBoundingClientRect();
  return {
    top: rect.top,
    left: rect.left,
    width: rect.width,
    height: rect.height,
    label: `${el.tagName.toLowerCase()} \xB7 ${Math.round(rect.width)}\xD7${Math.round(rect.height)}`
  };
}
function boundingBoxFromElement(el) {
  const rect = el.getBoundingClientRect();
  return {
    x: Math.round(rect.x),
    y: Math.round(rect.y),
    width: Math.round(rect.width),
    height: Math.round(rect.height)
  };
}
var isMac = typeof navigator !== "undefined" && /mac|iphone|ipad|ipod/i.test(navigator.platform || navigator.userAgent);
function isCaptureGesture(event) {
  return event.altKey || event.metaKey;
}

// src/core/measure.ts
function computeMeasureBands(s, t) {
  const sL = s.left;
  const sR = s.left + s.width;
  const sT = s.top;
  const sB = s.top + s.height;
  const tL = t.left;
  const tR = t.left + t.width;
  const tT = t.top;
  const tB = t.top + t.height;
  const sInsideT = sL >= tL && sR <= tR && sT >= tT && sB <= tB;
  const tInsideS = tL >= sL && tR <= sR && tT >= sT && tB <= sB;
  if (sInsideT || tInsideS) {
    const inner = sInsideT ? s : t;
    const outer = sInsideT ? t : s;
    const iL = inner.left;
    const iR = inner.left + inner.width;
    const iT = inner.top;
    const iB = inner.top + inner.height;
    const oL = outer.left;
    const oR = outer.left + outer.width;
    const oT = outer.top;
    const oB = outer.top + outer.height;
    return [
      {
        left: oL,
        top: iT,
        width: iL - oL,
        height: inner.height,
        distance: iL - oL
      },
      {
        left: iR,
        top: iT,
        width: oR - iR,
        height: inner.height,
        distance: oR - iR
      },
      {
        left: iL,
        top: oT,
        width: inner.width,
        height: iT - oT,
        distance: iT - oT
      },
      {
        left: iL,
        top: iB,
        width: inner.width,
        height: oB - iB,
        distance: oB - iB
      }
    ].filter((b) => b.distance >= 0.5);
  }
  const bands = [];
  const yA = Math.max(sT, tT);
  const yB = Math.min(sB, tB);
  const hasVOverlap = yB > yA;
  const bandTop = hasVOverlap ? yA : sT;
  const bandH = hasVOverlap ? yB - yA : s.height;
  if (sR <= tL) {
    bands.push({
      left: sR,
      top: bandTop,
      width: tL - sR,
      height: bandH,
      distance: tL - sR
    });
  } else if (tR <= sL) {
    bands.push({
      left: tR,
      top: bandTop,
      width: sL - tR,
      height: bandH,
      distance: sL - tR
    });
  }
  const xA = Math.max(sL, tL);
  const xB = Math.min(sR, tR);
  const hasHOverlap = xB > xA;
  const bandLeft = hasHOverlap ? xA : sL;
  const bandW = hasHOverlap ? xB - xA : s.width;
  if (sB <= tT) {
    bands.push({
      left: bandLeft,
      top: sB,
      width: bandW,
      height: tT - sB,
      distance: tT - sB
    });
  } else if (tB <= sT) {
    bands.push({
      left: bandLeft,
      top: tB,
      width: bandW,
      height: sT - tB,
      distance: sT - tB
    });
  }
  return bands.filter((b) => b.distance >= 0.5);
}
function findNeighborBands(el) {
  const parent = el.parentElement;
  if (!parent) return [];
  const R = el.getBoundingClientRect();
  if (R.width === 0 || R.height === 0) return [];
  const eps = 0.5;
  let right = null;
  let left = null;
  let top = null;
  let bottom = null;
  for (const sib of Array.from(parent.children)) {
    if (sib === el) continue;
    if (sib.closest(`[${INSPECTOR_ATTR}]`)) continue;
    const c = sib.getBoundingClientRect();
    if (c.width === 0 || c.height === 0) continue;
    const vTop = Math.max(R.top, c.top);
    const vBot = Math.min(R.bottom, c.bottom);
    const vOverlap = vBot - vTop;
    if (vOverlap > 0) {
      if (c.left >= R.right - eps) {
        const gap = c.left - R.right;
        if (gap >= eps && (!right || gap < right.distance)) {
          right = {
            left: R.right,
            top: vTop,
            width: gap,
            height: vOverlap,
            distance: gap
          };
        }
      } else if (c.right <= R.left + eps) {
        const gap = R.left - c.right;
        if (gap >= eps && (!left || gap < left.distance)) {
          left = {
            left: c.right,
            top: vTop,
            width: gap,
            height: vOverlap,
            distance: gap
          };
        }
      }
    }
    const hLeft = Math.max(R.left, c.left);
    const hRight = Math.min(R.right, c.right);
    const hOverlap = hRight - hLeft;
    if (hOverlap > 0) {
      if (c.top >= R.bottom - eps) {
        const gap = c.top - R.bottom;
        if (gap >= eps && (!bottom || gap < bottom.distance)) {
          bottom = {
            left: hLeft,
            top: R.bottom,
            width: hOverlap,
            height: gap,
            distance: gap
          };
        }
      } else if (c.bottom <= R.top + eps) {
        const gap = R.top - c.bottom;
        if (gap >= eps && (!top || gap < top.distance)) {
          top = {
            left: hLeft,
            top: c.bottom,
            width: hOverlap,
            height: gap,
            distance: gap
          };
        }
      }
    }
  }
  return [right, left, top, bottom].filter(Boolean);
}

// src/core/selectors.ts
function segmentForElement(el) {
  const tag = el.tagName.toLowerCase();
  const id = el.id ? `#${el.id}` : "";
  const type = el instanceof HTMLInputElement && el.type ? `[type="${el.type}"]` : "";
  const dataSlot = el.getAttribute("data-slot");
  const slot = dataSlot ? `[data-slot="${dataSlot}"]` : "";
  const classList = el.classList;
  const firstClass = classList.length > 0 ? `.${classList[0]}` : "";
  return `${tag}${id}${type}${slot}${firstClass}`;
}
function buildElementPath(el, maxDepth = 12) {
  const segments = [];
  let current = el;
  while (current && current !== document.documentElement) {
    segments.unshift(segmentForElement(current));
    if (current === document.body) break;
    current = current.parentElement;
    if (segments.length >= maxDepth) break;
  }
  if (segments[0] !== "body" && document.body.contains(el)) {
    segments.unshift("body");
  }
  return segments.join(" > ");
}

// src/format/markdown.ts
function formatAnnotationBlock(annotation, index) {
  const { boundingBox: box } = annotation;
  const lines = [
    `## Annotation ${index + 1} \u2014 ${annotation.element}`,
    `**Element:** ${annotation.element}`,
    `**Path:** \`${annotation.elementPath}\``,
    `**Position:** ${box.width}\xD7${box.height} at (${box.x}, ${box.y})`,
    `**Note:** ${annotation.comment}`
  ];
  if (annotation.cssSnippet) {
    lines.push("", "```css", annotation.cssSnippet, "```");
  }
  return lines.join("\n");
}
function formatAnnotationsMarkdown(annotations) {
  if (annotations.length === 0) return "";
  return annotations.map((annotation, index) => formatAnnotationBlock(annotation, index)).join("\n\n");
}
function formatSingleAnnotationMarkdown(annotation) {
  return formatAnnotationBlock(annotation, 0).replace(/^## Annotation 1 — /, "## ");
}

// src/react/AnnotationForm.tsx
import * as React from "react";

// scss-module:../styles/inspector.module.css#scss-module
var inspector_module_default = { "themeLight": "inspector__themeLight", "themeDark": "inspector__themeDark", "root": "inspector__root", "controls": "inspector__controls", "tooltip": "inspector__tooltip", "panel": "inspector__panel", "panelHeader": "inspector__panelHeader", "panelTitle": "inspector__panelTitle", "label": "inspector__label", "selectorHint": "inspector__selectorHint", "panelActions": "inspector__panelActions", "panelBody": "inspector__panelBody", "section": "inspector__section", "sectionHeader": "inspector__sectionHeader", "sectionTitle": "inspector__sectionTitle", "codeBlock": "inspector__codeBlock", "propName": "inspector__propName", "btn": "inspector__btn", "btnPrimary": "inspector__btnPrimary", "btnPrimaryActive": "inspector__btnPrimaryActive", "btnSm": "inspector__btnSm", "btnIcon": "inspector__btnIcon", "btnGhost": "inspector__btnGhost", "highlight": "inspector__highlight", "highlightLabel": "inspector__highlightLabel", "measureTarget": "inspector__measureTarget", "measureTargetLabel": "inspector__measureTargetLabel", "measureBand": "inspector__measureBand", "measureBandLabel": "inspector__measureBandLabel", "annotationForm": "inspector__annotationForm", "textarea": "inspector__textarea", "formActions": "inspector__formActions", "annotationList": "inspector__annotationList", "annotationListHeader": "inspector__annotationListHeader", "annotationListTitle": "inspector__annotationListTitle", "annotationItem": "inspector__annotationItem", "annotationItemElement": "inspector__annotationItemElement", "annotationItemNote": "inspector__annotationItemNote" };

// src/react/AnnotationForm.tsx
import { jsx, jsxs } from "react/jsx-runtime";
function AnnotationForm({
  onSave,
  onCancel
}) {
  const [comment, setComment] = React.useState("");
  const inputRef = React.useRef(null);
  React.useEffect(() => {
    inputRef.current?.focus();
  }, []);
  const handleSave = () => {
    const trimmed = comment.trim();
    if (!trimmed) return;
    onSave(trimmed);
    setComment("");
  };
  return /* @__PURE__ */ jsxs("div", { className: inspector_module_default.annotationForm, children: [
    /* @__PURE__ */ jsx(
      "textarea",
      {
        ref: inputRef,
        className: inspector_module_default.textarea,
        placeholder: "Describe the issue or desired change\u2026",
        value: comment,
        onChange: (e) => setComment(e.target.value),
        onKeyDown: (e) => {
          if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
            e.preventDefault();
            handleSave();
          }
        }
      }
    ),
    /* @__PURE__ */ jsxs("div", { className: inspector_module_default.formActions, children: [
      /* @__PURE__ */ jsx(
        "button",
        {
          type: "button",
          className: `${inspector_module_default.btn} ${inspector_module_default.btnSm}`,
          onClick: onCancel,
          children: "Cancel"
        }
      ),
      /* @__PURE__ */ jsx(
        "button",
        {
          type: "button",
          className: `${inspector_module_default.btn} ${inspector_module_default.btnSm} ${inspector_module_default.btnPrimary}`,
          onClick: handleSave,
          disabled: !comment.trim(),
          children: "Save annotation"
        }
      )
    ] })
  ] });
}

// src/react/CopyButton.tsx
import * as React2 from "react";

// src/react/icons.tsx
import { jsx as jsx2, jsxs as jsxs2 } from "react/jsx-runtime";
var stroke = 1.6;
function IconCrosshair({ size = 16, ...props }) {
  return /* @__PURE__ */ jsxs2(
    "svg",
    {
      width: size,
      height: size,
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: stroke,
      "aria-hidden": true,
      ...props,
      children: [
        /* @__PURE__ */ jsx2("circle", { cx: "12", cy: "12", r: "10" }),
        /* @__PURE__ */ jsx2("line", { x1: "22", y1: "12", x2: "18", y2: "12" }),
        /* @__PURE__ */ jsx2("line", { x1: "6", y1: "12", x2: "2", y2: "12" }),
        /* @__PURE__ */ jsx2("line", { x1: "12", y1: "6", x2: "12", y2: "2" }),
        /* @__PURE__ */ jsx2("line", { x1: "12", y1: "22", x2: "12", y2: "18" })
      ]
    }
  );
}
function IconCopy({ size = 14, ...props }) {
  return /* @__PURE__ */ jsxs2(
    "svg",
    {
      width: size,
      height: size,
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: stroke,
      "aria-hidden": true,
      ...props,
      children: [
        /* @__PURE__ */ jsx2("rect", { x: "9", y: "9", width: "13", height: "13", rx: "2", ry: "2" }),
        /* @__PURE__ */ jsx2("path", { d: "M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" })
      ]
    }
  );
}
function IconCheck({ size = 14, ...props }) {
  return /* @__PURE__ */ jsx2(
    "svg",
    {
      width: size,
      height: size,
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: stroke,
      "aria-hidden": true,
      ...props,
      children: /* @__PURE__ */ jsx2("polyline", { points: "20 6 9 17 4 12" })
    }
  );
}
function IconX({ size = 16, ...props }) {
  return /* @__PURE__ */ jsxs2(
    "svg",
    {
      width: size,
      height: size,
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: stroke,
      "aria-hidden": true,
      ...props,
      children: [
        /* @__PURE__ */ jsx2("line", { x1: "18", y1: "6", x2: "6", y2: "18" }),
        /* @__PURE__ */ jsx2("line", { x1: "6", y1: "6", x2: "18", y2: "18" })
      ]
    }
  );
}

// src/react/CopyButton.tsx
import { jsx as jsx3, jsxs as jsxs3 } from "react/jsx-runtime";
function CopyButton({
  text,
  label,
  onCopied
}) {
  const [copied, setCopied] = React2.useState(false);
  const handleCopy = React2.useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      onCopied?.(text);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
    }
  }, [onCopied, text]);
  return /* @__PURE__ */ jsxs3(
    "button",
    {
      type: "button",
      className: `${inspector_module_default.btn} ${inspector_module_default.btnSm}`,
      onClick: handleCopy,
      "aria-label": label,
      children: [
        copied ? /* @__PURE__ */ jsx3(IconCheck, {}) : /* @__PURE__ */ jsx3(IconCopy, {}),
        copied ? "Copied" : "Copy"
      ]
    }
  );
}

// src/react/AnnotationList.tsx
import { jsx as jsx4, jsxs as jsxs4 } from "react/jsx-runtime";
function AnnotationList({
  annotations,
  markdown,
  onCopy
}) {
  if (annotations.length === 0) return null;
  return /* @__PURE__ */ jsxs4("div", { className: inspector_module_default.annotationList, children: [
    /* @__PURE__ */ jsxs4("div", { className: inspector_module_default.annotationListHeader, children: [
      /* @__PURE__ */ jsxs4("p", { className: inspector_module_default.annotationListTitle, children: [
        "Annotations (",
        annotations.length,
        ")"
      ] }),
      /* @__PURE__ */ jsx4(
        CopyButton,
        {
          text: markdown,
          label: "Copy all annotations as markdown",
          onCopied: onCopy
        }
      )
    ] }),
    annotations.map((annotation) => /* @__PURE__ */ jsxs4("div", { className: inspector_module_default.annotationItem, children: [
      /* @__PURE__ */ jsx4("p", { className: inspector_module_default.annotationItemElement, children: annotation.element }),
      /* @__PURE__ */ jsx4("p", { className: inspector_module_default.annotationItemNote, children: annotation.comment })
    ] }, annotation.id))
  ] });
}

// src/react/CssPanel.tsx
import { jsx as jsx5, jsxs as jsxs5 } from "react/jsx-runtime";
function SectionBlock({
  section,
  onCopied
}) {
  const css = section.properties.map((p) => `${p.name}: ${p.value};`).join("\n");
  return /* @__PURE__ */ jsxs5("div", { className: inspector_module_default.section, children: [
    /* @__PURE__ */ jsxs5("div", { className: inspector_module_default.sectionHeader, children: [
      /* @__PURE__ */ jsx5("p", { className: inspector_module_default.sectionTitle, children: section.title }),
      /* @__PURE__ */ jsx5(
        CopyButton,
        {
          text: css,
          label: `Copy ${section.title} CSS`,
          onCopied
        }
      )
    ] }),
    /* @__PURE__ */ jsx5("pre", { className: inspector_module_default.codeBlock, children: section.properties.map((prop) => /* @__PURE__ */ jsxs5("div", { children: [
      /* @__PURE__ */ jsxs5("span", { className: inspector_module_default.propName, children: [
        prop.name,
        ":"
      ] }),
      " ",
      prop.value,
      ";"
    ] }, prop.name)) })
  ] });
}
function CssPanel({
  spec,
  onClose,
  onCopy,
  showAnnotationForm,
  annotationForm,
  annotationList
}) {
  const allCss = specToCss(spec);
  return /* @__PURE__ */ jsxs5("div", { className: inspector_module_default.panel, children: [
    /* @__PURE__ */ jsxs5("div", { className: inspector_module_default.panelHeader, children: [
      /* @__PURE__ */ jsxs5("div", { className: inspector_module_default.panelTitle, children: [
        /* @__PURE__ */ jsx5("p", { className: inspector_module_default.label, children: spec.label }),
        /* @__PURE__ */ jsx5("p", { className: inspector_module_default.selectorHint, children: spec.selectorHint })
      ] }),
      /* @__PURE__ */ jsxs5("div", { className: inspector_module_default.panelActions, children: [
        /* @__PURE__ */ jsx5(CopyButton, { text: allCss, label: "Copy all CSS", onCopied: onCopy }),
        /* @__PURE__ */ jsx5(
          "button",
          {
            type: "button",
            className: `${inspector_module_default.btn} ${inspector_module_default.btnIcon} ${inspector_module_default.btnGhost}`,
            onClick: onClose,
            "aria-label": "Close inspector panel",
            children: /* @__PURE__ */ jsx5(IconX, {})
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxs5("div", { className: inspector_module_default.panelBody, children: [
      spec.sections.map((section) => /* @__PURE__ */ jsx5(
        SectionBlock,
        {
          section,
          onCopied: onCopy
        },
        section.title
      )),
      annotationList,
      showAnnotationForm ? annotationForm : null
    ] })
  ] });
}

// src/react/MeasureOverlay.tsx
import { Fragment, jsx as jsx6 } from "react/jsx-runtime";
function MeasureOverlay({ bands }) {
  return /* @__PURE__ */ jsx6(Fragment, { children: bands.map((b, i) => /* @__PURE__ */ jsx6(
    "div",
    {
      className: inspector_module_default.measureBand,
      style: {
        top: b.top,
        left: b.left,
        width: b.width,
        height: b.height,
        backgroundImage: MEASURE_HATCH,
        outline: `1px dashed ${MEASURE_COLOR}80`
      },
      children: /* @__PURE__ */ jsx6("span", { className: inspector_module_default.measureBandLabel, children: Math.round(b.distance) })
    },
    i
  )) });
}

// src/react/hooks/usePersistedState.ts
import { useEffect as useEffect2, useState as useState3 } from "react";
function usePersistedState(key, defaultValue) {
  const [value, setValue] = useState3(() => {
    if (!key) return defaultValue;
    try {
      const raw = sessionStorage.getItem(key);
      return raw !== null ? JSON.parse(raw) : defaultValue;
    } catch {
      return defaultValue;
    }
  });
  useEffect2(() => {
    if (!key) return;
    try {
      sessionStorage.setItem(key, JSON.stringify(value));
    } catch {
    }
  }, [key, value]);
  return [value, setValue];
}

// src/react/DevInspector.tsx
import { jsx as jsx7, jsxs as jsxs6 } from "react/jsx-runtime";
function shouldCaptureClick(event, captureMode) {
  if (captureMode === "armed-click") return true;
  return isCaptureGesture(event);
}
function createAnnotation(el, spec, comment) {
  return {
    id: crypto.randomUUID(),
    comment,
    timestamp: Date.now(),
    element: spec.label,
    elementPath: buildElementPath(el),
    selectorHint: spec.selectorHint,
    boundingBox: boundingBoxFromElement(el),
    cssSnippet: specToCss(spec)
  };
}
function DevInspector({
  enabled = true,
  captureMode = "alt-click",
  storageKey = "dev_inspector_armed",
  zIndex = 9999,
  theme = "auto",
  onAnnotationAdd,
  onCopy,
  copyToClipboard = true
}) {
  const [armed, setArmed] = usePersistedState(storageKey, false);
  const [hoverRect, setHoverRect] = React3.useState(null);
  const [selectedEl, setSelectedEl] = React3.useState(null);
  const [selectedSpec, setSelectedSpec] = React3.useState(
    null
  );
  const [selectedRect, setSelectedRect] = React3.useState(
    null
  );
  const [measureRect, setMeasureRect] = React3.useState(
    null
  );
  const [neighborBands, setNeighborBands] = React3.useState([]);
  const [annotations, setAnnotations] = React3.useState([]);
  const [showAnnotationForm, setShowAnnotationForm] = React3.useState(false);
  const clearSelection = React3.useCallback(() => {
    setSelectedEl(null);
    setSelectedSpec(null);
    setSelectedRect(null);
    setMeasureRect(null);
    setShowAnnotationForm(false);
  }, []);
  const disarm = React3.useCallback(() => {
    setArmed(false);
    setHoverRect(null);
    setMeasureRect(null);
    setNeighborBands([]);
    clearSelection();
  }, [clearSelection, setArmed]);
  const refreshSelectedRect = React3.useCallback(() => {
    if (!selectedEl) return;
    setSelectedRect(rectFromElement(selectedEl));
  }, [selectedEl]);
  const handleCopy = React3.useCallback(
    async (text) => {
      onCopy?.(text);
      if (!copyToClipboard) return;
      try {
        await navigator.clipboard.writeText(text);
      } catch {
      }
    },
    [copyToClipboard, onCopy]
  );
  const handleSaveAnnotation = React3.useCallback(
    (comment) => {
      if (!selectedEl || !selectedSpec) return;
      const annotation = createAnnotation(selectedEl, selectedSpec, comment);
      setAnnotations((prev) => [...prev, annotation]);
      onAnnotationAdd?.(annotation);
      setShowAnnotationForm(false);
    },
    [onAnnotationAdd, selectedEl, selectedSpec]
  );
  React3.useEffect(() => {
    if (!enabled || !armed || selectedSpec) return;
    const onMove = (event) => {
      if (isInsideInspector(event.target)) {
        setHoverRect(null);
        setNeighborBands([]);
        return;
      }
      const el = pickInspectableElement(event.clientX, event.clientY);
      setHoverRect(el ? rectFromElement(el) : null);
      setNeighborBands(el ? findNeighborBands(el) : []);
    };
    const onPointerDown = (event) => {
      if (!shouldCaptureClick(event, captureMode)) return;
      if (isInsideInspector(event.target)) return;
      event.preventDefault();
      event.stopPropagation();
    };
    const onClick = (event) => {
      if (!shouldCaptureClick(event, captureMode)) return;
      if (isInsideInspector(event.target)) return;
      const el = pickInspectableElement(event.clientX, event.clientY);
      if (!el) return;
      event.preventDefault();
      event.stopPropagation();
      setSelectedEl(el);
      setSelectedSpec(buildInspectorSpec(el));
      setSelectedRect(rectFromElement(el));
      setHoverRect(null);
      setNeighborBands([]);
      setShowAnnotationForm(false);
    };
    document.addEventListener("mousemove", onMove);
    document.addEventListener("pointerdown", onPointerDown, true);
    document.addEventListener("click", onClick, true);
    return () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("pointerdown", onPointerDown, true);
      document.removeEventListener("click", onClick, true);
    };
  }, [armed, captureMode, enabled, selectedSpec]);
  React3.useEffect(() => {
    if (!enabled || !armed || !selectedSpec || !selectedEl) return;
    const onMove = (event) => {
      if (isInsideInspector(event.target)) {
        setMeasureRect(null);
        return;
      }
      const el = pickInspectableElement(event.clientX, event.clientY);
      if (!el || el === selectedEl) {
        setMeasureRect(null);
        return;
      }
      setMeasureRect(rectFromElement(el));
    };
    document.addEventListener("mousemove", onMove);
    return () => {
      document.removeEventListener("mousemove", onMove);
      setMeasureRect(null);
    };
  }, [armed, enabled, selectedEl, selectedSpec]);
  React3.useEffect(() => {
    if (!enabled || !armed) return;
    const onKeyDown = (event) => {
      if (event.key !== "Escape") return;
      if (showAnnotationForm) {
        setShowAnnotationForm(false);
        return;
      }
      if (selectedSpec) {
        clearSelection();
      } else {
        disarm();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [
    armed,
    clearSelection,
    disarm,
    enabled,
    selectedSpec,
    showAnnotationForm
  ]);
  React3.useEffect(() => {
    if (!selectedEl) return;
    const onLayout = () => refreshSelectedRect();
    window.addEventListener("scroll", onLayout, true);
    window.addEventListener("resize", onLayout);
    return () => {
      window.removeEventListener("scroll", onLayout, true);
      window.removeEventListener("resize", onLayout);
    };
  }, [refreshSelectedRect, selectedEl]);
  if (!enabled) return null;
  const activeRect = selectedRect ?? hoverRect;
  const measureBands = selectedRect && measureRect ? computeMeasureBands(selectedRect, measureRect) : [];
  const annotationsMarkdown = formatAnnotationsMarkdown(annotations);
  const themeClass = theme === "light" ? inspector_module_default.themeLight : theme === "dark" ? inspector_module_default.themeDark : "";
  const hintText = captureMode === "armed-click" ? "Click to inspect \xB7 Escape to exit" : `${isMac ? "\u2325 Option" : "Alt"} + click to inspect \xB7 click to interact`;
  return /* @__PURE__ */ jsxs6(
    "div",
    {
      ...{ [INSPECTOR_ATTR]: "" },
      className: `${inspector_module_default.root} ${themeClass}`.trim(),
      style: { zIndex },
      children: [
        armed && activeRect ? /* @__PURE__ */ jsx7(
          "div",
          {
            className: inspector_module_default.highlight,
            style: {
              top: activeRect.top,
              left: activeRect.left,
              width: activeRect.width,
              height: activeRect.height
            },
            children: /* @__PURE__ */ jsx7("span", { className: inspector_module_default.highlightLabel, children: activeRect.label })
          }
        ) : null,
        armed && measureRect ? /* @__PURE__ */ jsx7(
          "div",
          {
            className: inspector_module_default.measureTarget,
            style: {
              top: measureRect.top,
              left: measureRect.left,
              width: measureRect.width,
              height: measureRect.height
            },
            children: /* @__PURE__ */ jsxs6("span", { className: inspector_module_default.measureTargetLabel, children: [
              Math.round(measureRect.width),
              " \xD7 ",
              Math.round(measureRect.height)
            ] })
          }
        ) : null,
        armed ? /* @__PURE__ */ jsx7(MeasureOverlay, { bands: selectedRect ? measureBands : neighborBands }) : null,
        /* @__PURE__ */ jsxs6("div", { className: inspector_module_default.controls, children: [
          armed && !selectedSpec ? /* @__PURE__ */ jsx7("div", { className: inspector_module_default.tooltip, children: hintText }) : null,
          armed && selectedSpec ? /* @__PURE__ */ jsx7("div", { className: inspector_module_default.tooltip, children: "Hover any element to measure spacing" }) : null,
          armed && selectedSpec ? /* @__PURE__ */ jsx7(
            CssPanel,
            {
              spec: selectedSpec,
              onClose: clearSelection,
              onCopy: handleCopy,
              annotationList: /* @__PURE__ */ jsx7(
                AnnotationList,
                {
                  annotations,
                  markdown: annotationsMarkdown,
                  onCopy: handleCopy
                }
              ),
              showAnnotationForm,
              annotationForm: /* @__PURE__ */ jsx7(
                AnnotationForm,
                {
                  onSave: handleSaveAnnotation,
                  onCancel: () => setShowAnnotationForm(false)
                }
              )
            }
          ) : null,
          armed && selectedSpec && !showAnnotationForm ? /* @__PURE__ */ jsx7(
            "button",
            {
              type: "button",
              className: `${inspector_module_default.btn} ${inspector_module_default.btnSm}`,
              onClick: () => setShowAnnotationForm(true),
              children: "Add annotation"
            }
          ) : null,
          /* @__PURE__ */ jsxs6(
            "button",
            {
              type: "button",
              className: `${inspector_module_default.btn} ${armed ? `${inspector_module_default.btnPrimary} ${inspector_module_default.btnPrimaryActive}` : ""}`,
              onClick: () => {
                if (armed) {
                  disarm();
                } else {
                  setArmed(true);
                }
              },
              "aria-pressed": armed,
              children: [
                /* @__PURE__ */ jsx7(IconCrosshair, {}),
                armed ? "Inspecting" : "Inspect"
              ]
            }
          )
        ] })
      ]
    }
  );
}
export {
  DevInspector,
  INSPECTOR_ATTR,
  MEASURE_COLOR,
  boundingBoxFromElement,
  buildElementPath,
  buildInspectorSpec,
  computeMeasureBands,
  findNeighborBands,
  formatAnnotationsMarkdown,
  formatElementLabel,
  formatSelectorHint,
  formatSingleAnnotationMarkdown,
  isCaptureGesture,
  isInsideInspector,
  isMac,
  pickInspectableElement,
  rectFromElement,
  sectionToCss,
  specToCss
};
//# sourceMappingURL=index.js.map