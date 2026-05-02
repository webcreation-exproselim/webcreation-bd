import { useEffect, useState } from "react";
import { Download, X, Smartphone, Share } from "lucide-react";

const DISMISS_KEY = "wcbd_pwa_install_dismissed";
const DISMISS_DAYS = 7;

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function PWAInstallPrompt() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [show, setShow] = useState(false);
  const [iosShow, setIosShow] = useState(false);

  useEffect(() => {
    // Check dismissed
    const dismissed = localStorage.getItem(DISMISS_KEY);
    if (dismissed) {
      const ts = parseInt(dismissed, 10);
      if (Date.now() - ts < DISMISS_DAYS * 24 * 60 * 60 * 1000) return;
    }

    // Check if already installed (standalone mode)
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true;
    if (isStandalone) return;

    // iOS detection (iOS doesn't fire beforeinstallprompt)
    const ua = window.navigator.userAgent;
    const isIOS = /iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream;
    const isSafari = /^((?!chrome|android).)*safari/i.test(ua);

    if (isIOS && isSafari) {
      const t = setTimeout(() => setIosShow(true), 4000);
      return () => clearTimeout(t);
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
      setTimeout(() => setShow(true), 3000);
    };
    window.addEventListener("beforeinstallprompt", handler);

    const installed = () => {
      setShow(false);
      setIosShow(false);
      localStorage.setItem(DISMISS_KEY, Date.now().toString());
    };
    window.addEventListener("appinstalled", installed);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      window.removeEventListener("appinstalled", installed);
    };
  }, []);

  function dismiss() {
    setShow(false);
    setIosShow(false);
    localStorage.setItem(DISMISS_KEY, Date.now().toString());
  }

  async function install() {
    if (!deferred) return;
    await deferred.prompt();
    const choice = await deferred.userChoice;
    if (choice.outcome === "accepted" || choice.outcome === "dismissed") {
      dismiss();
      setDeferred(null);
    }
  }

  if (!show && !iosShow) return null;

  return (
    <div className="fixed bottom-24 right-4 left-4 sm:left-auto sm:bottom-24 sm:right-24 z-[9997] sm:max-w-sm animate-in slide-in-from-bottom-5 fade-in duration-500">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 p-4 relative">
          <button
            onClick={dismiss}
            className="absolute top-2 right-2 p-1.5 rounded-lg hover:bg-white/20 text-white"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center shrink-0">
              <Smartphone className="h-6 w-6 text-white" />
            </div>
            <div className="text-white">
              <div className="font-bold text-base">WCBD App ইনস্টল করুন</div>
              <div className="text-[11px] text-white/90">দ্রুত access, push notification</div>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-4">
          {iosShow ? (
            <div className="text-sm text-gray-700 space-y-2">
              <p className="font-semibold text-gray-900">iPhone-এ install করতে:</p>
              <div className="flex items-start gap-2">
                <span className="bg-blue-100 text-blue-700 rounded-full h-5 w-5 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">1</span>
                <span>নিচের <Share className="inline h-4 w-4 text-blue-600" /> Share বাটনে tap করুন</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="bg-blue-100 text-blue-700 rounded-full h-5 w-5 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">2</span>
                <span>"Add to Home Screen" সিলেক্ট করুন</span>
              </div>
              <button
                onClick={dismiss}
                className="w-full mt-3 py-2 rounded-lg bg-gray-100 text-gray-700 text-sm font-semibold hover:bg-gray-200"
              >
                বুঝেছি
              </button>
            </div>
          ) : (
            <>
              <p className="text-sm text-gray-700 mb-3">
                আপনার phone-এর home screen-এ এক tap-এ access করুন। সম্পূর্ণ free!
              </p>
              <div className="flex gap-2">
                <button
                  onClick={dismiss}
                  className="flex-1 py-2.5 rounded-lg bg-gray-100 text-gray-700 text-sm font-semibold hover:bg-gray-200 transition"
                >
                  পরে
                </button>
                <button
                  onClick={install}
                  className="flex-1 py-2.5 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-bold hover:opacity-90 transition flex items-center justify-center gap-1.5 shadow-lg shadow-blue-500/30"
                >
                  <Download className="h-4 w-4" />
                  Install
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
