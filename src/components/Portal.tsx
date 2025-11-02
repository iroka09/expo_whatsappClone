import React, { createContext, useContext, useState, useEffect } from "react";

const PortalContext = createContext(null);
export const usePortal = () => useContext(PortalContext);

type Types = "append" | "prepend"
const types: Types[] = ["append", "prepend"]


export default function RootWrapper({ children }) {
  const [nodes, setNodes] = useState([]);

  const register = (id: string, type: Types, ele: React.ReactNode) =>
    setNodes(prev => [...prev, { id, type, ele }]);

  const unregister = (id: string) =>
    setNodes(prev => prev.filter(x => x.id !== id));

  return (
    <PortalContext.Provider value={{ register, unregister }}>
      {nodes.filter(x=>x.type==="prepend").map(x => x.ele)}
      {children}
      {nodes.filter(x=>x.type==="append").map(x => x.ele)}
    </PortalContext.Provider>
  );
}

export function Portal({ children, type = "append" }: {
  children: React.ReactNode,
  type: Types
}) {
  if (!types.includes(type))
    throw TypeError(type + " is not one of these: " + types)
  const { register, unregister } = usePortal();
  const id = Math.random().toString() + Math.random().toString();
  useEffect(() => {
    register(id, type, children);
    return () => unregister(id);
  }, [children]);
  return null;
}