import { About } from "@/components/About";
import { AttentionMap } from "@/components/AttentionMap";
import { Chatbot } from "@/components/Chatbot";
import { Contact } from "@/components/Contact";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { Journey } from "@/components/Journey";
import { Loader } from "@/components/Loader";
import { TokenTicker } from "@/components/TokenTicker";

export default function Home() {
  return (
    <>
      <Loader />
      <Header />
      <main>
        <Hero />
        <TokenTicker />
        <About />
        <AttentionMap />
        <Journey />
        <Contact />
      </main>
      <Footer />
      <Chatbot />
    </>
  );
}
