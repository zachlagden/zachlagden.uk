"use client";

import React from "react";
import { motion } from "framer-motion";
import { Mail, Send, CheckCircle } from "lucide-react";
import Section from "../ui/Section";
import { useForm, ValidationError } from "@formspree/react";
import { Contact } from "@/types/content";

interface ContactSectionProps {
  content: Contact;
}

const ContactSection = React.forwardRef<HTMLElement, ContactSectionProps>(
  ({ content }, ref) => {
    const [state, handleSubmit] = useForm(content.formspreeId);

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
              className="text-center bg-emerald-50 dark:bg-emerald-950 p-8 rounded-lg border border-emerald-100 dark:border-emerald-800"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <CheckCircle className="w-16 h-16 text-emerald-500 dark:text-emerald-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-emerald-800 dark:text-emerald-200 mb-2">
                Message Sent!
              </h3>
              <p className="text-emerald-700 dark:text-emerald-300">
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
                className="text-neutral-600 dark:text-neutral-400 mb-8 text-center"
                variants={itemVariants}
              >
                {content.introduction}
              </motion.p>

              <motion.form
                onSubmit={handleSubmit}
                className="space-y-6"
                variants={containerVariants}
              >
                <motion.div variants={itemVariants}>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1"
                  >
                    {content.formFields.name}
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    className="w-full px-4 py-3 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-[#1a1a1a] dark:text-[#e5e5e5] focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent transition-colors"
                    placeholder="Your name"
                  />
                </motion.div>

                <motion.div variants={itemVariants}>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1"
                  >
                    {content.formFields.email}
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    className="w-full px-4 py-3 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-[#1a1a1a] dark:text-[#e5e5e5] focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent transition-colors"
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
                    className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1"
                  >
                    {content.formFields.message}
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    rows={5}
                    className="w-full px-4 py-3 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-[#1a1a1a] dark:text-[#e5e5e5] focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent transition-colors"
                    placeholder="How can I help you?"
                  />
                  <ValidationError
                    prefix="Message"
                    field="message"
                    errors={state.errors}
                    className="text-red-500 text-sm mt-1"
                  />
                </motion.div>

                <motion.div
                  variants={itemVariants}
                  className="flex justify-end"
                >
                  <button
                    type="submit"
                    disabled={state.submitting}
                    className="inline-flex items-center gap-2 px-5 py-3 bg-black dark:bg-white text-white dark:text-black rounded-lg hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black dark:focus:ring-white disabled:opacity-70 disabled:cursor-not-allowed"
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
  },
);

ContactSection.displayName = "ContactSection";

export default ContactSection;
