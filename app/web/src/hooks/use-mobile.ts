import * as React from "react"

const breakpoint = 850

export function useIsMobile() {

  const [isMobile, setIsMobile] = React.useState(false);
  
  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${breakpoint}px)`);
    const update = () => setIsMobile(mql.matches);
    mql.addEventListener("change", update);
    setIsMobile(mql.matches);
    return () => mql.removeEventListener("change", update);
  }, []);
  
  return isMobile;
}
