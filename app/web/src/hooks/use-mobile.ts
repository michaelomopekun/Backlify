import * as React from "react"

const breakpoint = 850

export function useIsMobile() {

  const [isMobile, setIsMobile] = React.useState(false);
  
  React.useEffect(() => {
  
    const mql = window.matchMedia(`(max-width: ${breakpoint - 1}px)`);
  
    const update = () => setIsMobile(mql.matches);
  
    mql.addEventListener("change", update);
  
    setIsMobile(mql.matches);
  
    return () => mql.removeEventListener("change", update);
  
  }, [breakpoint]);
  
  return isMobile;
}
