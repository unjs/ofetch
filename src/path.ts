/* eslint-disable unicorn/prefer-at */
export type QueryValue =
  | string
  | number
  | boolean
  | QueryValue[]
  | Record<string, any>
  | null
  | undefined;
export type QueryObject = Record<string, QueryValue | QueryValue[]>;

/**
 * Removes the leading slash from the given path if it has one.
 */
export function withoutLeadingSlash(path?: string): string {
  if (!path || path === "/") {
    return "/";
  }

  return path[0] === "/" ? path.slice(1) : path;
}

/**
 * Removes the trailing slash from the given path if it has one.
 */
export function withoutTrailingSlash(path?: string): string {
  if (!path || path === "/") {
    return "/";
  }

  return path[path.length - 1] === "/" ? path.slice(0, -1) : path;
}

/**
 * Joins the given base URL and path, ensuring that there is only one slash between them.
 */
export function joinURL(base?: string, path?: string): string {
  if (!base || base === "/") {
    return path || "/";
  }

  if (!path || path === "/") {
    return base || "/";
  }

  const baseHasTrailing = base[base.length - 1] === "/";
  const pathHasLeading = path[0] === "/";
  if (baseHasTrailing && pathHasLeading) {
    return base + path.slice(1);
  }

  if (!baseHasTrailing && !pathHasLeading) {
    return `${base}/${path}`;
  }

  return base + path;
}

/**
 * Adds the base path to the input path, if it is not already present.
 */
export function withBase(input = "", base = ""): string {
  if (!base || base === "/") {
    return input;
  }

  const _base = withoutTrailingSlash(base);
  if (input.startsWith(_base)) {
    return input;
  }

  return joinURL(_base, input);
}

/**
 * Returns the URL with the given query parameters. If a query parameter is undefined, it is omitted.
 */
export function withQuery(input: string, query: QueryObject): string {
  const url = new URL(input, "http://localhost");
  const searchParams = new URLSearchParams(url.search);

  for (const [key, value] of Object.entries(query)) {
    if (value === undefined) {
      searchParams.delete(key);
    } else if (typeof value === "number" || typeof value === "boolean") {
      searchParams.set(key, String(value));
    } else if (!value) {
      searchParams.set(key, "");
    } else if (Array.isArray(value)) {
      for (const item of value) {
        searchParams.append(key, String(item));
      }
    } else if (typeof value === "object") {
      searchParams.set(key, JSON.stringify(value));
    } else {
      searchParams.set(key, String(value));
    }
  }

  url.search = searchParams.toString();
  let urlWithQuery = url.toString();

  if (urlWithQuery.startsWith("http://localhost")) {
    urlWithQuery = urlWithQuery.slice(16);
  }

  return urlWithQuery;
}
