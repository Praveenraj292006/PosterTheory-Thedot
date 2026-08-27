import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowRight, Check, MousePointer2, Package, ShoppingBag, Truck } from "lucide-react";

const processSteps = [
  {
    number: "01",
    title: "Browse",
    description: "Explore curated collections and find the poster that fits your space.",
    icon: MousePointer2,
    label: "DISCOVER",
  },
  {
    number: "02",
    title: "Choose",
    description: "Select your poster size, layout and finish before adding it to your cart.",
    icon: ShoppingBag,
    label: "CUSTOMIZE",
  },
  {
    number: "03",
    title: "Order",
    description: "Complete your order through our secure and simple checkout process.",
    icon: Check,
    label: "CHECKOUT",
  },
  {
    number: "04",
    title: "Delivered",
    description: "Your posters are carefully packed and shipped directly to your door.",
    icon: Truck,
    label: "DELIVERY",
  },
];

const posterSizes = [
  { name: "A3", width: "w-24", height: "h-32" },
  { name: "A4", width: "w-20", height: "h-28" },
  { name: "A5", width: "w-16", height: "h-22" },
];

export default function HowItWorks() {
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % processSteps.length);
    }, 4500);

    return () => clearInterval(timer);
  }, []);

  const currentStep = processSteps[activeStep];
  const Icon = currentStep.icon;

  return (
    <section className="relative overflow-hidden border-b-2 border-z-border bg-z-paper py-16 sm:py-24">
      
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6">

        {/* HEADER */}

        <div className="mb-12 flex flex-col gap-5 sm:mb-16 md:flex-row md:items-end md:justify-between">

          <div>

            <h2 className="font-[Bebas] text-5xl font-bold uppercase leading-[0.85] tracking-wide text-z-ink sm:text-6xl">
              How It Works
            </h2>
          </div>

         

        </div>


        {/* PROCESS NAVIGATION */}

        <div className="relative mb-12">

          {/* Background line */}

          <div className="absolute left-0 right-0 top-1/2 hidden h-[2px] -translate-y-1/2 bg-z-border/10 md:block" />

          {/* Animated progress */}

          <motion.div
            className="absolute left-0 top-1/2 hidden h-[2px] -translate-y-1/2 bg-z-ink md:block"
            animate={{
              width: `${(activeStep / (processSteps.length - 1)) * 100}%`,
            }}
            transition={{
              duration: 0.5,
              ease: "easeInOut",
            }}
          />

          <div className="relative grid grid-cols-4 gap-2 sm:gap-4">

            {processSteps.map((step, index) => {

              const StepIcon = step.icon;
              const isActive = activeStep === index;
              const isCompleted = index < activeStep;

              return (
                <button
                  key={step.number}
                  onClick={() => setActiveStep(index)}
                  className="group relative flex flex-col items-center text-center"
                >

                  <motion.div
                    animate={{
                      scale: isActive ? 1.12 : 1,
                      backgroundColor: isActive
                        ? "var(--color-z-ink)"
                        : "var(--color-z-paper)",
                    }}
                    transition={{ duration: 0.3 }}
                    className="relative z-10 flex h-12 w-12 items-center justify-center border-2 border-z-border sm:h-16 sm:w-16"
                  >

                    <StepIcon
                      className={`h-4 w-4 sm:h-5 sm:w-5 ${
                        isActive ? "text-z-paper" : "text-z-ink"
                      }`}
                    />

                    {isCompleted && !isActive && (
                      <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center bg-z-ink text-z-paper">
                        <Check className="h-2.5 w-2.5" />
                      </span>
                    )}

                  </motion.div>

                  <div className="mt-3 sm:mt-4">

                    <span
                      className={`block text-[8px] font-mono font-bold uppercase tracking-[0.2em] transition-colors sm:text-[10px] ${
                        isActive ? "text-z-ink" : "text-z-muted"
                      }`}
                    >
                      {step.number}
                    </span>

                    <span
                      className={`mt-1 block font-display text-[11px] font-bold uppercase tracking-tight transition-colors sm:text-sm ${
                        isActive ? "text-z-ink" : "text-z-muted"
                      }`}
                    >
                      {step.title}
                    </span>

                  </div>

                </button>
              );
            })}

          </div>

        </div>


        {/* MAIN INTERACTIVE AREA */}

        <div className="grid min-h-[420px] overflow-hidden border-2 border-z-border lg:grid-cols-[0.8fr_1.2fr]">

          {/* LEFT CONTENT */}

          <div className="relative flex flex-col justify-between border-b-2 border-z-border p-6 sm:p-10 lg:border-b-0 lg:border-r-2">

            <AnimatePresence mode="wait">

              <motion.div
                key={activeStep}
                initial={{ opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
              >

                <div className="mb-8 flex items-center justify-between">

                  <span className="font-mono text-[10px] font-bold uppercase tracking-[0.25em] text-z-muted">
                    Step // {currentStep.number}
                  </span>

                  <span className="border border-z-border px-2 py-1 text-[8px] font-mono font-bold uppercase tracking-widest text-z-ink">
                    {currentStep.label}
                  </span>

                </div>

                <h3 className="max-w-lg font-display text-5xl font-black uppercase leading-[0.8] tracking-tighter text-z-ink sm:text-7xl">
                  {currentStep.title}
                  <span className="text-z-muted">.</span>
                </h3>

                <p className="mt-6 max-w-md text-[11px] font-mono uppercase leading-relaxed tracking-wide text-z-muted sm:text-xs">
                  {currentStep.description}
                </p>

              </motion.div>

            </AnimatePresence>


            {/* STEP CONTROLS */}

            <div className="mt-10 flex items-center justify-between">

              <div className="flex gap-1">

                {processSteps.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveStep(index)}
                    aria-label={`Go to step ${index + 1}`}
                    className="p-1"
                  >
                    <span
                      className={`block h-1.5 w-8 transition-all duration-300 ${
                        activeStep === index
                          ? "bg-z-ink"
                          : "bg-z-border/20"
                      }`}
                    />
                  </button>
                ))}

              </div>

              <span className="font-mono text-[9px] uppercase tracking-widest text-z-muted">
                {String(activeStep + 1).padStart(2, "0")} / 04
              </span>

            </div>

          </div>


          {/* RIGHT VISUAL */}

          <div className="relative min-h-[320px] overflow-hidden bg-z-ink">

            {/* Grid */}

            <div
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage:
                  "linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)",
                backgroundSize: "40px 40px",
              }}
            />

            {/* Visual */}

            <AnimatePresence mode="wait">

              <motion.div
                key={activeStep}
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                transition={{ duration: 0.5 }}
                className="absolute inset-0 flex items-center justify-center"
              >

                {/* BROWSE */}

                {activeStep === 0 && (
                  <div className="relative h-64 w-full max-w-md">

                    {posterSizes.map((poster, index) => (
                      <motion.div
                        key={poster.name}
                        initial={{
                          opacity: 0,
                          y: 40,
                          rotate: index === 0 ? -8 : index === 1 ? 4 : 10,
                        }}
                        animate={{
                          opacity: 1,
                          y: 0,
                          rotate: index === 0 ? -8 : index === 1 ? 4 : 10,
                        }}
                        transition={{
                          delay: index * 0.15,
                          duration: 0.5,
                        }}
                        className={`absolute left-1/2 top-1/2 ${poster.width} ${poster.height} -translate-x-1/2 -translate-y-1/2 border-2 border-white bg-z-paper p-1 shadow-[8px_8px_0px_0px_rgba(255,255,255,0.15)]`}
                        style={{
                          marginLeft: `${(index - 1) * 75}px`,
                          marginTop: `${(index - 1) * 20}px`,
                        }}
                      >
                        <div className="flex h-full w-full items-end bg-z-border/10 p-2">
                          <span className="font-display text-xl font-black text-z-ink">
                            {poster.name}
                          </span>
                        </div>
                      </motion.div>
                    ))}

                  </div>
                )}


                {/* CHOOSE */}

                {activeStep === 1 && (
                  <div className="relative flex items-center justify-center">

                    <motion.div
                      animate={{
                        rotate: [0, -3, 3, 0],
                        y: [0, -8, 0],
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                      className="h-64 w-44 border-2 border-white bg-z-paper p-2 shadow-[12px_12px_0px_0px_rgba(255,255,255,0.15)]"
                    >

                      <div className="flex h-full w-full flex-col justify-between bg-z-border/10 p-4">

                        <span className="font-mono text-[8px] font-bold uppercase tracking-widest text-z-muted">
                          SELECT SIZE
                        </span>

                        <div>
                          <p className="font-display text-5xl font-black text-z-ink">
                            A4
                          </p>

                          <p className="mt-2 font-mono text-[8px] uppercase text-z-muted">
                            210 × 297 MM
                          </p>
                        </div>

                      </div>

                    </motion.div>

                    <motion.div
                      animate={{
                        x: [0, 8, 0],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                      }}
                      className="absolute -right-20 top-1/2 border-2 border-white bg-z-ink px-4 py-3"
                    >
                      <span className="font-mono text-[9px] font-bold uppercase tracking-widest text-white">
                        A4 SELECTED ✓
                      </span>
                    </motion.div>

                  </div>
                )}


                {/* ORDER */}

                {activeStep === 2 && (
                  <div className="flex flex-col items-center">

                    <motion.div
                      initial={{ y: -30, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      className="relative border-2 border-white bg-z-paper px-12 py-10"
                    >

                      <Package className="mx-auto h-12 w-12 text-z-ink" />

                      <p className="mt-5 font-display text-xl font-black uppercase text-z-ink">
                        ORDER CONFIRMED
                      </p>

                      <p className="mt-2 text-center font-mono text-[8px] uppercase tracking-widest text-z-muted">
                        PAYMENT RECEIVED
                      </p>

                    </motion.div>

                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: 220 }}
                      transition={{ delay: 0.3, duration: 0.7 }}
                      className="mt-8 h-[2px] bg-white"
                    />

                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.8 }}
                      className="mt-4 font-mono text-[9px] uppercase tracking-widest text-white/50"
                    >
                      PREPARING YOUR PRINT
                    </motion.p>

                  </div>
                )}


                {/* DELIVERY */}

                {activeStep === 3 && (
                  <div className="relative w-full max-w-lg px-8">

                    <motion.div
                      initial={{ x: -180 }}
                      animate={{ x: 180 }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        repeatDelay: 0.5,
                        ease: "easeInOut",
                      }}
                      className="absolute left-1/2 top-1/2 z-20 flex h-20 w-32 -translate-y-1/2 items-center justify-center  "
                    >
                      <Truck className="h-10 w-10 text-z-paper absolute top-0" />
                    </motion.div>

                    <div className="h-[3px] w-full bg-white/20" />

                    <div className="mt-6 flex justify-between font-mono text-[8px] uppercase tracking-widest text-white/50">
                      <span>POSTER THEORY</span>
                      <span>YOUR WALL</span>
                    </div>

                  </div>
                )}

              </motion.div>

            </AnimatePresence>


            {/* Corner label */}

            <div className="absolute bottom-5 left-5 font-mono text-[8px] uppercase tracking-[0.25em] text-white/30">
              POSTER_THEORY // PROCESS
            </div>

            <div className="absolute right-5 top-5 font-mono text-[8px] uppercase tracking-[0.25em] text-white/30">
              LIVE
            </div>

          </div>

        </div>

      </div>

    </section>
  );
}