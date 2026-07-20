import { motion } from "framer-motion";

// Wraps a line of text in an overflow-hidden mask; inner span slides up on load or in view.
export function MaskLine({
  children,
  delay = 0,
  duration = 0.9,
  ease = [0.7, 0, 0.2, 1],
  as = "span",
  className = "",
  inView = false,
}) {
  const Wrapper = as;
  const initial = { y: "110%" };
  const animate = { y: "0%" };
  return (
    <Wrapper className={`reveal-mask ${className}`}>
      {inView ? (
        <motion.span
          style={{ display: "inline-block", willChange: "transform" }}
          initial={initial}
          whileInView={animate}
          viewport={{ once: true, margin: "-10% 0px" }}
          transition={{ duration, delay, ease }}
        >
          {children}
        </motion.span>
      ) : (
        <motion.span
          style={{ display: "inline-block", willChange: "transform" }}
          initial={initial}
          animate={animate}
          transition={{ duration, delay, ease }}
        >
          {children}
        </motion.span>
      )}
    </Wrapper>
  );
}

export function FadeUp({ children, delay = 0, y = 24, className = "", once = true }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, margin: "-8% 0px" }}
      transition={{ duration: 0.9, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
