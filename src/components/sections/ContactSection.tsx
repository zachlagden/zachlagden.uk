"use client";

import React from "react";
import { motion } from "framer-motion";
import { Mail, Send, CheckCircle } from "lucide-react";
import Section from "../ui/Section";
import { useForm, ValidationError } from "@formspree/react";

const ContactSection = React.forwardRef<HTMLElement>((props, ref) => {
  const [state, handleSubmit] = useForm("mqapzrgk");

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <Section
      id="contact"
      title="Get In Touch"
      icon={<Mail className="w-6 h-6" aria-hidden="true" />}
      ref={ref}
    >
      <div className="max-w-2xl mx-auto">
        {state.succeeded ? (
          <motion.div
            className="text-center bg-emerald-50 p-8 rounded-lg border border-emerald-100"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-emerald-800 mb-2">
              Message Sent!
            </h3>
            <p className="text-emerald-700">
              Thank you for reaching out. I&apos;ll get back to you as soon as
              possible.
            </p>
          </motion.div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-50px" }}
          >
            <motion.p
              className="text-neutral-600 mb-8 text-center"
              variants={itemVariants}
            >
              Interested in working together or have a question? Feel free to
              reach out!
            </motion.p>

            <motion.form
              onSubmit={handleSubmit}
              className="space-y-6"
              variants={containerVariants}
            >
              <motion.div variants={itemVariants}>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-neutral-700 mb-1"
                >
                  Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  className="w-full px-4 py-3 rounded-lg border border-neutral-200 focus:ring-2 focus:ring-black focus:border-transparent transition-colors"
                  placeholder="Your name"
                />
              </motion.div>

              <motion.div variants={itemVariants}>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-neutral-700 mb-1"
                >
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="w-full px-4 py-3 rounded-lg border border-neutral-200 focus:ring-2 focus:ring-black focus:border-transparent transition-colors"
                  placeholder="you@example.com"
                />
                <ValidationError
                  prefix="Email"
                  field="email"
                  errors={state.errors}
                  className="text-red-500 text-sm mt-1"
                />
              </motion.div>

              <motion.div variants={itemVariants}>
                <label
                  htmlFor="message"
                  className="block text-sm font-medium text-neutral-700 mb-1"
                >
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  required
                  rows={5}
                  className="w-full px-4 py-3 rounded-lg border border-neutral-200 focus:ring-2 focus:ring-black focus:border-transparent transition-colors"
                  placeholder="How can I help you?"
                />
                <ValidationError
                  prefix="Message"
                  field="message"
                  errors={state.errors}
                  className="text-red-500 text-sm mt-1"
                />
              </motion.div>

              <motion.div variants={itemVariants} className="flex justify-end">
                <button
                  type="submit"
                  disabled={state.submitting}
                  className="inline-flex items-center gap-2 px-5 py-3 bg-black text-white rounded-lg hover:bg-neutral-800 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {state.submitting ? (
                    <>Processing</>
                  ) : (
                    <>
                      Send Message
                      <Send className="w-4 h-4" />
                    </>
                  )}
                </button>
              </motion.div>
            </motion.form>
          </motion.div>
        )}
      </div>
    </Section>
  );
});

ContactSection.displayName = "ContactSection";

export default ContactSection;
