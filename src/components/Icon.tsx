const paths = {
  home: "M3 10 12 3l9 7v10h-6v-6H9v6H3z",
  catalogue: "M3 5q5-2 9 1 4-3 9-1v14q-5-2-9 1-4-3-9-1zM12 6v14",
  progress: "M4 20V11m7 9V5m7 15v-7",
  globe: "M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0M3 12h18m-9-9q-8 9 0 18 8-9 0-18",
  arrow: "M4 12h15m-6-6 6 6-6 6",
  flag: "M5 21V4q4-3 8 0t7 0v10q-4 3-8 0t-7 0",
  compass: "m15 8-2 6-6 2 2-6zM21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0",
  target:
    "M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0m-5 0a4 4 0 1 1-8 0 4 4 0 0 1 8 0",
  road: "M4 21 9 3m11 18L15 3m-3 1v4m0 5v6",
  menu: "M4 6h16M4 12h16M4 18h16",
};
export type IconName = keyof typeof paths;
export function Icon({ name }: { name: IconName }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={paths[name]} />
    </svg>
  );
}
