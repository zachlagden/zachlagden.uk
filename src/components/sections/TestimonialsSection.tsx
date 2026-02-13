import React from "react";

// TODO: Replace with real testimonials from admin panel (Phase 6)
const TESTIMONIALS = [
  {
    quote:
      "Zach built our entire platform from the ground up. Fast, reliable, and exactly what we needed.",
    name: "Alex Morgan",
    role: "Founder, StartupCo",
  },
  {
    quote:
      "One of the most capable developers I've worked with. He understands both the technical and business side.",
    name: "Sarah Chen",
    role: "CTO, TechVentures",
  },
  {
    quote:
      "Delivered a complex system on time with clean, maintainable code. Would work with again without question.",
    name: "James Porter",
    role: "Engineering Manager",
  },
];

export default function TestimonialsSection() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-24 sm:px-6 lg:px-8">
      <h2 className="font-heading text-3xl font-semibold text-text-primary">
        Testimonials
      </h2>

      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {TESTIMONIALS.map((testimonial) => (
          <div
            key={testimonial.name}
            className="rounded-lg border border-zinc-800 bg-zinc-900 p-6"
          >
            {/* Decorative quotation mark */}
            <span
              className="block text-4xl leading-none text-cyan-500/20 select-none"
              aria-hidden="true"
            >
              &ldquo;
            </span>

            <blockquote className="mt-2 text-sm italic leading-relaxed text-zinc-300">
              {testimonial.quote}
            </blockquote>

            <div className="mt-4">
              <p className="font-mono text-sm font-medium text-text-primary">
                {testimonial.name}
              </p>
              <p className="text-sm text-zinc-500">{testimonial.role}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
