"use client";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <div className="page empty">
      <h1>The file could not be opened.</h1>
      <p>
        An unexpected error interrupted the investigation. Your last database
        save is retained.
      </p>
      <button className="button primary" onClick={reset}>
        Try again
      </button>
    </div>
  );
}
