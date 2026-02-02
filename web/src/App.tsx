import "./services/api";
import { Button } from "@/components/ui/button";

function App() {
  return (
    <div className="min-h-screen bg-base-200 text-base-content">
      <div className="mx-auto flex min-h-screen w-full max-w-2xl items-center px-6 py-12">
        <div className="w-full rounded-3xl bg-base-100 p-10 shadow-xl">
          <Button>oks</Button>
        </div>
      </div>
    </div>
  );
}

export default App;
