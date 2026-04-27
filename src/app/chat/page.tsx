import ChatPanel from "@/components/ChatPanel";

export const metadata = {
  title: "AgriBloom Assistant · AgriBloom",
  description: "Ask anything about crops, mandi prices, weather, pests, or fertilizer.",
};

export default function ChatPage() {
  return (
    <main className="min-h-screen bg-stone-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12 h-[calc(100vh-4rem)]">
        <header className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 mb-1">
            AgriBloom Assistant
          </h1>
          <p className="text-stone-600 text-sm sm:text-base">
            Powered by Gemini Flash. Asks the right module behind the scenes.
          </p>
        </header>
        <div className="h-[calc(100vh-12rem)] sm:h-[calc(100vh-14rem)]">
          <ChatPanel variant="page" />
        </div>
      </div>
    </main>
  );
}
