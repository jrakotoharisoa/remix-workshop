export const PlaylistIcon: React.FC<React.SVGAttributes<SVGElement>> = (
  props
) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M21 15V6"></path>
    <path d="M18.5 18a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z"></path>
    <path d="M12 12H3"></path>
    <path d="M16 6H3"></path>
    <path d="M12 18H3"></path>
  </svg>
);
