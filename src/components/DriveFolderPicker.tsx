"use client";

import { useEffect, useState } from "react";
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

type FolderSelection = {
  id: string;
  name?: string;
};

type Props = {
  onFolderChosen?: (selection: FolderSelection) => void;
  pickerApiKey?: string;
  pickerAppId?: string;
  buttonLabel?: string;
  showSelectedPreview?: boolean;
  className?: string;
};

const FALLBACK_PICKER_API_KEY =
  process.env.NEXT_PUBLIC_GOOGLE_PICKER_API_KEY ?? "";

export function DriveFolderPicker({
  onFolderChosen,
  pickerApiKey,
  pickerAppId,
  buttonLabel = "Select Google Drive Folder",
  showSelectedPreview = true,
  className
}: Props) {
  const { data: session } = useSession();
  const [isReady, setIsReady] = useState(false);
  const [isOpening, setIsOpening] = useState(false);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const resolvedPickerApiKey = pickerApiKey || FALLBACK_PICKER_API_KEY;

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

    async function initPicker() {
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
          setIsReady(true);
        }
      } catch (scriptError) {
        if (!cancelled) {
          setError(
            scriptError instanceof Error
              ? scriptError.message
              : "Unable to load Google Picker"
          );
        }
      }
    }

    void initPicker();

    return () => {
      cancelled = true;
    };
  }, []);

  const openPicker = () => {
    if (!session?.accessToken) {
      setError("Google session is missing an access token for Picker.");
      setIsOpening(false);
      return;
    }

    if (!resolvedPickerApiKey) {
      setError("GOOGLE_PICKER_API_KEY is required for Google Picker.");
      setIsOpening(false);
      return;
    }

    if (!window.google?.picker) {
      setError("Google Picker is still loading. Please try again.");
      setIsOpening(false);
      return;
    }

    const foldersView = new window.google.picker.DocsView(
      window.google.picker.ViewId.FOLDERS
    )
      .setIncludeFolders(true)
      .setSelectFolderEnabled(true)
      .setMimeTypes("application/vnd.google-apps.folder");

    const builder = new window.google.picker.PickerBuilder()
      .setDeveloperKey(resolvedPickerApiKey)
      .setOAuthToken(session.accessToken)
      .addView(foldersView)
      .setCallback((data: PickerResponse) => {
        setIsOpening(false);

        if (data.action === window.google?.picker.Action.PICKED) {
          const folder = data.docs?.[0];
          const folderId = folder?.id;
          if (folderId) {
            console.log("Selected folderId:", folderId);
            setSelectedFolderId(folderId);
            const folderData = {
              id: folderId,
              name: folder?.name
            };
            localStorage.setItem('selectedFolder', JSON.stringify(folderData));
            onFolderChosen?.(folderData);
            setError(null);
          }
        }
      });

    builder.setOrigin?.(window.location.origin);

    if (pickerAppId) {
      builder.setAppId?.(pickerAppId);
    }

    const picker = builder.build();

    picker.setVisible(true);
  };

  const handleClick = () => {
    setError(null);
    setIsOpening(true);
    openPicker();
  };

  return (
    <div className={`space-y-3 ${className ?? ""}`.trim()}>
      <button
        className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-accent to-accent-secondary px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-accent/20 transition-all duration-200 hover:shadow-accent/35 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
        disabled={!session?.accessToken || !isReady || isOpening}
        onClick={handleClick}
        type="button"
      >
        {isOpening ? (
          <>
            <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            Opening Picker...
          </>
        ) : (
          <>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/>
            </svg>
            {buttonLabel}
          </>
        )}
      </button>
      {showSelectedPreview && selectedFolderId ? (
        <p className="text-sm text-secondary-text">
          Selected folder: <span className="font-mono text-primary-text">{selectedFolderId}</span>
        </p>
      ) : null}
      {error ? <p className="text-sm text-red-400">{error}</p> : null}
    </div>
  );
}
