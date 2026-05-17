"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";

declare global {
  interface Window {
    gapi?: {
      client?: {
        load: (api: string, callback: () => void) => void;
      };
      load: (api: string, callback: () => void) => void;
    };
    google?: {
      picker: {
        Action: {
          PICKED: string;
          CANCEL: string;
        };
        DocsView: new (viewId?: string) => PickerDocsView;
        PickerBuilder: new () => PickerBuilderInstance;
        ViewId: {
          FOLDERS: string;
        };
      };
    };
  }
}

type PickerDocsView = {
  setIncludeFolders: (value: boolean) => PickerDocsView;
  setSelectFolderEnabled: (value: boolean) => PickerDocsView;
  setMimeTypes: (value: string) => PickerDocsView;
};

type PickerBuilderInstance = {
  setDeveloperKey: (value: string) => PickerBuilderInstance;
  setOAuthToken: (value: string) => PickerBuilderInstance;
  setOrigin?: (value: string) => PickerBuilderInstance;
  setAppId?: (value: string) => PickerBuilderInstance;
  addView: (view: PickerDocsView) => PickerBuilderInstance;
  setCallback: (callback: (data: PickerResponse) => void) => PickerBuilderInstance;
  build: () => {
    setVisible: (value: boolean) => void;
  };
};

type PickerDocument = {
  id: string;
  name?: string;
};

type PickerResponse = {
  action: string;
  docs?: PickerDocument[];
};

type Props = {
  pickerApiKey: string;
  pickerAppId: string;
};

export function PickerTestPanel({ pickerApiKey, pickerAppId }: Props) {
  const { data: session } = useSession();
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [pickerLoaded, setPickerLoaded] = useState(false);
  const [folderId, setFolderId] = useState<string | null>(null);
  const [status, setStatus] = useState("Ready");
  const [log, setLog] = useState<string[]>([]);

  const keyStatus = useMemo(
    () => (pickerApiKey ? "configured" : "missing"),
    [pickerApiKey]
  );
  const appStatus = useMemo(
    () => (pickerAppId ? "configured" : "optional/not set"),
    [pickerAppId]
  );

  useEffect(() => {
    let cancelled = false;

    const loadScript = (src: string) =>
      new Promise<void>((resolve, reject) => {
        const existing = document.querySelector(`script[src="${src}"]`);
        if (existing) {
          resolve();
          return;
        }

        const script = document.createElement("script");
        script.src = src;
        script.async = true;
        script.defer = true;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error(`Failed to load ${src}`));
        document.head.appendChild(script);
      });

    async function init() {
      try {
        await loadScript("https://apis.google.com/js/api.js");
        if (cancelled || !window.gapi) {
          return;
        }

        await new Promise<void>((resolve) => {
          if (window.gapi?.client?.load) {
            window.gapi.client.load("picker", resolve);
            return;
          }
          window.gapi?.load("client:picker", resolve);
        });

        if (!cancelled) {
          setScriptLoaded(true);
          setPickerLoaded(true);
          setLog((entries) => [...entries, "Google Picker scripts loaded"]);
        }
      } catch (error) {
        if (!cancelled) {
          setStatus(error instanceof Error ? error.message : "Failed to load Picker");
          setLog((entries) => [
            ...entries,
            error instanceof Error ? error.message : "Failed to load Picker"
          ]);
        }
      }
    }

    void init();

    return () => {
      cancelled = true;
    };
  }, []);

  const openPicker = () => {
    if (!session?.accessToken) {
      setStatus("Missing access token from NextAuth session");
      return;
    }

    if (!pickerApiKey) {
      setStatus("GOOGLE_PICKER_API_KEY is missing");
      return;
    }

    if (!window.google?.picker) {
      setStatus("Google Picker has not loaded yet");
      return;
    }

    const foldersView = new window.google.picker.DocsView(
      window.google.picker.ViewId.FOLDERS
    )
      .setIncludeFolders(true)
      .setSelectFolderEnabled(true)
      .setMimeTypes("application/vnd.google-apps.folder");

    const builder = new window.google.picker.PickerBuilder()
      .setDeveloperKey(pickerApiKey)
      .setOAuthToken(session.accessToken)
      .addView(foldersView)
      .setCallback((data: PickerResponse) => {
        if (data.action === window.google?.picker.Action.PICKED) {
          const nextFolderId = data.docs?.[0]?.id ?? null;
          setFolderId(nextFolderId);
          setStatus(nextFolderId ? "Folder selected" : "No folder returned");
          setLog((entries) => [
            ...entries,
            nextFolderId ? `folderId: ${nextFolderId}` : "Picker returned no folder"
          ]);
          if (nextFolderId) {
            console.log("Selected folderId:", nextFolderId);
          }
        } else {
          setStatus("Picker closed");
          setLog((entries) => [...entries, "Picker closed without selection"]);
        }
      });

    builder.setOrigin?.(window.location.origin);
    if (pickerAppId) {
      builder.setAppId?.(pickerAppId);
    }

    const picker = builder.build();
    setStatus("Picker opening");
    setLog((entries) => [
      ...entries,
      `Opening picker at ${window.location.origin}`,
      `Key present: ${pickerApiKey ? "yes" : "no"}`
    ]);
    picker.setVisible(true);
  };

  return (
    <section className="grid gap-6 rounded-[2rem] border border-white/10 bg-white/5 p-6 backdrop-blur-xl lg:grid-cols-[0.9fr_1.1fr]">
      <div className="space-y-4">
        <div>
          <p className="text-sm uppercase tracking-[0.35em] text-white/40">
            Picker Diagnostics
          </p>
          <h2 className="mt-3 text-3xl font-semibold text-white">
            Test the Google Picker by itself
          </h2>
        </div>
        <p className="text-sm leading-6 text-white/70">
          This page checks whether the API key is available, the Picker scripts load,
          and the folder selection flow returns a folderId.
        </p>

        <button
          className="rounded-full bg-mint px-5 py-3 text-sm font-semibold text-ink transition hover:bg-[#73e4b6] disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-white/50"
          disabled={!scriptLoaded || !session?.accessToken}
          onClick={openPicker}
          type="button"
        >
          Open Picker Test
        </button>

        <div className="space-y-2 rounded-3xl border border-white/10 bg-white/5 p-4 text-sm text-white/75">
          <p>
            `GOOGLE_PICKER_API_KEY`: <span className="text-white">{keyStatus}</span>
          </p>
          <p>
            `GOOGLE_PICKER_APP_ID`: <span className="text-white">{appStatus}</span>
          </p>
          <p>
            Script loaded: <span className="text-white">{scriptLoaded ? "yes" : "no"}</span>
          </p>
          <p>
            Picker ready: <span className="text-white">{pickerLoaded ? "yes" : "no"}</span>
          </p>
          <p>
            Session token:{" "}
            <span className="text-white">{session?.accessToken ? "present" : "missing"}</span>
          </p>
          <p>
            Current status: <span className="text-white">{status}</span>
          </p>
          <p>
            Selected folderId:{" "}
            <span className="font-mono text-white">{folderId ?? "none yet"}</span>
          </p>
        </div>
      </div>

      <div className="rounded-[1.75rem] border border-dashed border-white/15 bg-black/20 p-4">
        <p className="mb-3 text-sm uppercase tracking-[0.3em] text-white/40">Event Log</p>
        <div className="space-y-2 text-sm text-white/75">
          {log.length > 0 ? (
            log.map((entry, index) => (
              <div key={`${entry}-${index}`} className="rounded-2xl bg-white/5 px-4 py-3">
                {entry}
              </div>
            ))
          ) : (
            <div className="rounded-2xl bg-white/5 px-4 py-3 text-white/55">
              No events yet.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
