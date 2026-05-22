import { createNavigation } from "next-intl/navigation";
export { useParams } from "next/navigation";
import { routing } from "./routing";

export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
