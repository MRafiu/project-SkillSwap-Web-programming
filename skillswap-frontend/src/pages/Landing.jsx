import Navbar from "../components/layout/Navbar.jsx";
import Footer from "../components/layout/Footer.jsx";
import HeroSection from "../components/landing/HeroSection.jsx";
import HowItWorks from "../components/landing/HowItWorks.jsx";
import FeaturedSkills from "../components/landing/FeaturedSkills.jsx";
import ReliabilityScore from "../components/landing/ReliabilityScore.jsx";
import Testimonials from "../components/landing/Testimonials.jsx";
import FinalCTA from "../components/landing/FinalCTA.jsx";

function Landing() {
  return (
    <div className="min-h-screen bg-white flex flex-col text-slate-900 selection:bg-blue-100 selection:text-blue-900">
      <Navbar />
      <main className="flex-1">
        <HeroSection />
        <HowItWorks />
        <FeaturedSkills />
        <ReliabilityScore />
        <Testimonials />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
}

export default Landing;