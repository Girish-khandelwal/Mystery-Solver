import { Link } from "react-router-dom";
import type { ComponentProps } from "react";
export default function LocalLink({
  href,
  ...props
}: Omit<ComponentProps<typeof Link>, "to"> & { href: string }) {
  return <Link to={href} {...props} />;
}
