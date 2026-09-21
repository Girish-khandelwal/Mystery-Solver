import Link from "next/link";
export default function NotFound() {
  return (
    <div className="page empty">
      <p className="eyebrow">FILE NOT FOUND</p>
      <h1>This lead goes nowhere.</h1>
      <p>The requested case file does not exist.</p>
      <Link className="button primary" href="/archive">
        Return to the archive
      </Link>
    </div>
  );
}
