import type { ReactElement } from "react";

const ROWS = [0, 1, 2, 3, 4];
const BARS = [0, 1, 2];

/** Five placeholder rows shown while the first page loads. Purely decorative. */
export function Skeleton(): ReactElement {
  return (
    <div className="ifd-skeleton" aria-hidden="true">
      {ROWS.map((row) => (
        <div key={row} className="ifd-skel-row">
          {BARS.map((bar) => (
            <div key={bar} className="ifd-skel-bar" />
          ))}
        </div>
      ))}
    </div>
  );
}
