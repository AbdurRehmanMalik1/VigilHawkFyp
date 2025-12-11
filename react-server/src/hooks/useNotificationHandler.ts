import { useEffect, useRef } from "react";
import socket from "../utils/socket";

type HandlerFunc = (incoming: any) => void;

export function useNotificationHandler(
  handler: HandlerFunc,
  dependencies: any[] = [],
  enabled = true
) {
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  useEffect(() => {
    if (!enabled) return; // don't attach listeners if disabled

    const wrappedHandler = (incoming: any) => {
      handlerRef.current(incoming);
    };

    socket.on("notification", wrappedHandler);
    socket.on("detection", wrappedHandler);

    return () => {
      socket.off("notification", wrappedHandler);
      socket.off("detection", wrappedHandler);
    };
  }, dependencies.concat(enabled));
}
