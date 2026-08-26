"use client";

import Script from "next/script";
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react";

const TURNSTILE_SCRIPT_ID = "cloudflare-turnstile-api";
const TURNSTILE_SCRIPT_URL =
  "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

type TurnstileOptions = {
  sitekey: string;
  language?: string;
  theme?: "light" | "dark" | "auto";
  size?: "normal" | "compact" | "flexible";
  callback?: (token: string) => void;
  "error-callback"?: () => void;
  "expired-callback"?: () => void;
  "timeout-callback"?: () => void;
  "response-field"?: boolean;
  "response-field-name"?: string;
};

type TurnstileApi = {
  render: (container: HTMLElement, options: TurnstileOptions) => string;
  reset: (widgetId: string) => void;
  remove: (widgetId: string) => void;
};

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

export type TurnstileWidgetHandle = {
  reset: () => void;
};

type Props = {
  siteKey: string;
  language?: string;
  onTokenChange?: (token: string | null) => void;
  onError?: () => void;
};

export const TurnstileWidget = forwardRef<TurnstileWidgetHandle, Props>(
  function TurnstileWidget(
    { siteKey, language, onTokenChange, onError },
    forwardedRef,
  ) {
    const containerRef = useRef<HTMLDivElement>(null);
    const widgetIdRef = useRef<string | null>(null);
    const onTokenChangeRef = useRef(onTokenChange);
    const onErrorRef = useRef(onError);

    useEffect(() => {
      onTokenChangeRef.current = onTokenChange;
      onErrorRef.current = onError;
    }, [onError, onTokenChange]);

    const renderWidget = useCallback(() => {
      const container = containerRef.current;
      const turnstile = window.turnstile;

      if (!container || !turnstile || widgetIdRef.current) return;

      widgetIdRef.current = turnstile.render(container, {
        sitekey: siteKey,
        language,
        theme: "light",
        size: "flexible",
        "response-field": true,
        "response-field-name": "cf-turnstile-response",
        callback: (token) => onTokenChangeRef.current?.(token),
        "expired-callback": () => onTokenChangeRef.current?.(null),
        "timeout-callback": () => onTokenChangeRef.current?.(null),
        "error-callback": () => {
          onTokenChangeRef.current?.(null);
          onErrorRef.current?.();
        },
      });
    }, [language, siteKey]);

    useImperativeHandle(
      forwardedRef,
      () => ({
        reset() {
          const turnstile = window.turnstile;
          const widgetId = widgetIdRef.current;

          if (turnstile && widgetId) turnstile.reset(widgetId);
          onTokenChangeRef.current?.(null);
        },
      }),
      [],
    );

    useEffect(() => {
      renderWidget();

      return () => {
        const turnstile = window.turnstile;
        const widgetId = widgetIdRef.current;

        if (turnstile && widgetId) turnstile.remove(widgetId);
        widgetIdRef.current = null;
      };
    }, [renderWidget]);

    return (
      <>
        <Script
          id={TURNSTILE_SCRIPT_ID}
          src={TURNSTILE_SCRIPT_URL}
          strategy="afterInteractive"
          onReady={renderWidget}
        />
        <div ref={containerRef} className="min-h-[65px] w-full" />
      </>
    );
  },
);
