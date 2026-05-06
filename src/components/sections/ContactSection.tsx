"use client";

import React from "react";
import { motion } from "framer-motion";
import { Mail, Send, CheckCircle } from "lucide-react";
import Section from "../ui/Section";
import { useForm, ValidationError } from "@formspree/react";
import { Contact } from "@/types/content";

interface ContactSectionProps {
  content: Contact;
  sectionIndex?: number;
}

const ContactSection = React.forwardRef<HTMLElement, ContactSectionProps>(
  ({ content, sectionIndex }, ref) => {
    const [state, handleSubmit] = useForm(content.formspreeId);

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
        sectionIndex={sectionIndex}
      >
        {state.succeeded ? (
          <motion.div
            className="text-center bg-emerald-50 p-8 rounded-lg border border-emerald-100 max-w-2xl mx-auto"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
            <h3 className="text-xl font-heading font-semibold text-emerald-800 mb-2">
              Message Sent!
            </h3>
            <p className="text-emerald-700">
              Thank you for reaching out. I&apos;ll get back to you as soon as
              possible.
            </p>
          </motion.div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-12 lg:gap-16 items-start">
            {/* Decorative left column — lg only */}
            <motion.div
              className="hidden lg:block lg:w-1/3 sticky top-32"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <span className="font-heading text-5xl xl:text-6xl font-extrabold tracking-tighter text-neutral-900/20 leading-tight block">
                Say
                <br />
                Hello.
              </span>
              <p className="text-neutral-500 mt-6 text-sm leading-relaxed">
                {content.introduction}
              </p>
            </motion.div>

            {/* Form — offset right */}
            <motion.div
              className="w-full lg:w-2/3"
              variants={containerVariants}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-50px" }}
            >
              {/* Mobile intro text */}
              <motion.p
                className="lg:hidden text-neutral-600 mb-8"
                variants={itemVariants}
              >
                {content.introduction}
              </motion.p>

              <motion.form
                onSubmit={handleSubmit}
                className="space-y-6 max-w-lg"
                variants={containerVariants}
              >
                <motion.div variants={itemVariants}>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-neutral-700 mb-1"
                  >
                    {content.formFields.name}
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
                    {content.formFields.email}
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
                    {content.formFields.message}
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

                <motion.div
                  variants={itemVariants}
                  className="flex justify-end"
                >
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
          </div>
        )}
      </Section>
    );
  },
);

ContactSection.displayName = "ContactSection";

export default ContactSection;
