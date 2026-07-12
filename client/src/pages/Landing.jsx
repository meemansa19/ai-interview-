import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  HiSparkles, HiMicrophone, HiVideoCamera, HiChartBar,
  HiArrowRight, HiDocumentText, HiBolt,
} from 'react-icons/hi2'

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.5, delay: i * 0.1 },
  }),
}

const features = [
  {
    icon: HiSparkles,
    title: 'AI-generated questions',
    desc: 'Technical, HR, behavioral, and coding questions tailored to your chosen topic and difficulty — generated fresh every session.',
  },
  {
    icon: HiMicrophone,
    title: 'Voice-based answers',
    desc: 'Speak your answers naturally. Speech-to-text captures your response, timed like a real interview room.',
  },
  {
    icon: HiVideoCamera,
    title: 'Webcam practice mode',
    desc: 'Record yourself answering to review body language and delivery, not just what you said.',
  },
  {
    icon: HiChartBar,
    title: 'Detailed feedback & scoring',
    desc: 'Every answer is evaluated for correctness, clarity, and depth — with a score, strengths, and weak areas.',
  },
  {
    icon: HiDocumentText,
    title: 'Downloadable reports',
    desc: 'Get a full PDF report after every session — shareable, printable, and great for tracking progress.',
  },
  {
    icon: HiBolt,
    title: 'Progress analytics',
    desc: 'Charts that show your score trend over time, so you know exactly what to work on next.',
  },
]

const steps = [
  { title: 'Choose your setup', desc: 'Pick a technology, difficulty level, and number of questions.' },
  { title: 'Answer in real time', desc: 'Respond by voice or text, with a timer running like a real interview.' },
  { title: 'Get instant feedback', desc: 'AI scores your answers and shows exactly what to improve.' },
]

const Landing = () => {
  return (
    <div className="min-h-screen bg-surface-950 overflow-x-hidden">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 backdrop-blur-xl bg-surface-950/70 border-b border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center shadow-glow-sm">
              <HiSparkles className="text-white text-sm" />
            </div>
            <span className="font-display font-bold text-lg text-white">PrepAI</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/login" className="text-white/70 hover:text-white text-sm font-medium px-4 py-2 transition-colors">
              Log in
            </Link>
            <Link to="/register" className="btn-primary !py-2.5 !px-5 text-sm">
              Get started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-24 pb-32 px-6">
        <div className="blob w-[500px] h-[500px] bg-brand-600 top-[-15%] left-1/2 -translate-x-1/2" />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div
            initial="hidden" animate="visible" custom={0} variants={fadeUp}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-card text-xs font-medium text-white/70 mb-8"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-accent-teal animate-pulse" />
            Powered by Google Gemini
          </motion.div>

          <motion.h1
            initial="hidden" animate="visible" custom={1} variants={fadeUp}
            className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-[1.05] tracking-tight"
          >
            Interview practice that<br />
            <span className="text-gradient">actually feels real.</span>
          </motion.h1>

          <motion.p
            initial="hidden" animate="visible" custom={2} variants={fadeUp}
            className="mt-6 text-lg sm:text-xl text-white/50 max-w-2xl mx-auto leading-relaxed"
          >
            Practice technical, HR, and behavioral interviews with an AI that asks real questions, listens to your voice, and tells you exactly what to fix.
          </motion.p>

          <motion.div
            initial="hidden" animate="visible" custom={3} variants={fadeUp}
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link to="/register" className="btn-primary text-base !px-8 !py-3.5">
              Start practicing free
              <HiArrowRight />
            </Link>
            <Link to="/login" className="btn-secondary text-base !px-8 !py-3.5">
              I have an account
            </Link>
          </motion.div>

        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-6 relative">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-100px' }} custom={0} variants={fadeUp}
            className="text-center mb-16"
          >
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-white">
              Everything a real interview has
            </h2>
            <p className="text-white/50 mt-3 max-w-xl mx-auto">
              Not just a question bank — a full simulation with voice, video, and feedback.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-50px' }} custom={i} variants={fadeUp}
                className="glass-card-hover p-6"
              >
                <div className="w-11 h-11 rounded-xl bg-brand-500/15 flex items-center justify-center mb-4">
                  <feature.icon className="text-brand-300 text-xl" />
                </div>
                <h3 className="font-display font-semibold text-white text-lg mb-2">{feature.title}</h3>
                <p className="text-white/50 text-sm leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 px-6 border-t border-white/[0.06] relative">
        <div className="max-w-5xl mx-auto">
          <motion.h2
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
            className="font-display text-3xl sm:text-4xl font-bold text-white text-center mb-16"
          >
            How it works
          </motion.h2>

          <div className="grid sm:grid-cols-3 gap-8 relative">
            {/* Connecting line for desktop */}
            <div className="hidden sm:block absolute top-6 left-[16.5%] right-[16.5%] h-px bg-gradient-to-r from-brand-600/0 via-brand-500/40 to-brand-600/0" />

            {steps.map((step, i) => (
              <motion.div
                key={step.title}
                initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-50px' }} custom={i} variants={fadeUp}
                className="relative text-center"
              >
                <div className="w-12 h-12 rounded-full bg-surface-900 border-2 border-brand-500 flex items-center justify-center mx-auto mb-5 relative z-10 font-display font-bold text-brand-300">
                  {i + 1}
                </div>
                <h3 className="font-display font-semibold text-white text-lg mb-2">{step.title}</h3>
                <p className="text-white/50 text-sm leading-relaxed max-w-xs mx-auto">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <motion.div
          initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
          className="max-w-4xl mx-auto glass-card p-12 text-center relative overflow-hidden"
        >
          <div className="blob w-72 h-72 bg-brand-600 top-[-30%] right-[-10%] opacity-20" />
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-white mb-4 relative z-10">
            Ready to walk in prepared?
          </h2>
          <p className="text-white/50 mb-8 relative z-10">Your next interview shouldn't be the first time you've said your answers out loud.</p>
          <Link to="/register" className="btn-primary text-base !px-8 !py-3.5 relative z-10 inline-flex">
            Start practicing free
            <HiArrowRight />
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/[0.06] py-10 px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center">
              <HiSparkles className="text-white text-xs" />
            </div>
            <span className="font-display font-semibold text-white/70 text-sm">PrepAI</span>
          </div>
          <p className="text-white/30 text-sm">© {new Date().getFullYear()} PrepAI. Built as a final year project.</p>
        </div>
      </footer>
    </div>
  )
}

export default Landing