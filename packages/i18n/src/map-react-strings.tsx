import { cloneElement, isValidElement, type ReactNode } from "react";

type AnyProps = Record<string, unknown> & { children?: ReactNode };

/**
 * Lowercase (or map) every string in a React tree.
 * Expands plain function components (footer links, Closing) so their labels
 * are included — children-only walks miss GitHub / cookie text.
 */
export function mapReactStrings(
  node: ReactNode,
  map: (text: string) => string,
): ReactNode {
  if (typeof node === "string") return map(node);
  if (typeof node === "number" || node === null || node === undefined) {
    return node;
  }

  if (Array.isArray(node)) {
    return node.map((child) => mapReactStrings(child, map));
  }

  if (!isValidElement<AnyProps>(node)) return node;

  const type = node.type;

  // Presentational function components (no hooks) — render then keep walking.
  if (typeof type === "function") {
    const rendered = (type as (props: AnyProps) => ReactNode)(node.props);

    return mapReactStrings(rendered, map);
  }

  if (node.props.children === undefined) return node;

  return cloneElement(node, {
    ...node.props,
    children: mapReactStrings(node.props.children, map),
  });
}
