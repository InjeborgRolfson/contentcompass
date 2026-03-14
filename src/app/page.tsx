import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Compass } from "lucide-react";

export default async function Home() {
  const session = await auth();

  if (session) {
    redirect("/favorites");
  }

  return (
    <div className="min-h-screen bg-indigo-50/50 flex flex-col items-center justify-center p-4">
      <div className="max-w-2xl w-full text-center space-y-8 bg-white p-12 rounded-[3rem] shadow-2xl shadow-indigo-100 border border-indigo-50">
        <div className="flex flex-col items-center">
          <div className="bg-indigo-600 p-6 rounded-[2rem] shadow-xl shadow-indigo-200 mb-8 animate-bounce duration-[3000ms]">
            <Compass className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-6xl font-black text-indigo-950 mb-4 tracking-tighter">
            ContentCompass
          </h1>
          <p className="text-xl text-indigo-900/60 font-medium leading-relaxed max-w-md mx-auto">
            Your personalized trajectory through books, films, podcasts, and more.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
          <Link
            href="/login"
            className="px-12 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black shadow-xl shadow-indigo-100 transition-all hover:-translate-y-1 active:scale-95 text-lg"
          >
            Login
          </Link>
          <Link
            href="/register"
            className="px-12 py-4 bg-white border-2 border-indigo-100 hover:border-indigo-600 text-indigo-600 rounded-2xl font-black transition-all hover:-translate-y-1 active:scale-95 text-lg"
          >
            Register
          </Link>
        </div>
      </div>
    </div>
  );
}
