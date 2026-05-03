// Custom Peso Icon Component
export const PesoIcon = ({ className, ...props }) => (
  <svg 
    className={className}
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
    {...props}
  >
    <path d="M8 3h6a5 5 0 0 1 0 10H8V3z" />
    <line x1="4" y1="9" x2="16" y2="9" />
    <line x1="4" y1="13" x2="12" y2="13" />
    <line x1="8" y1="3" x2="8" y2="21" />
  </svg>
);

export default PesoIcon;
