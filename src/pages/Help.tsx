
import { ChevronDown, Mail, Phone, Clock } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import React, { useState, useEffect, useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { AnimatePresence, motion } from "motion/react";
import { X } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const FAQ_SECTIONS = [
  { section: 'GENERAL', id: 'general', items: [
    { q: 'What is Poster Theory?', a: 'Poster Theory is an online platform offering high-quality posters, framed artwork, and customized posters designed to suit your personal style and space.' },
    { q: 'Do I need an account to place an order?', a: 'No. You can place an order as a guest or create an account for faster checkout and order history access.' },
    { q: 'Do you ship across India?', a: 'Yes. We currently deliver across India. International shipping may be introduced in the future.' },
  ] },
  { section: 'PRODUCTS', id: 'products', items: [
    { q: 'What types of posters do you sell?', a: 'We offer Standard Posters, Customized Posters, Framed Posters, Wall Art Prints, and Premium Print Collections.' },
    { q: 'What sizes are available?', a: 'Available sizes — A3, A4, A5, A6, Polaroid, and Pocket — are displayed on each product page. Availability may vary by design.' },
    { q: 'Do posters come with frames?', a: 'Some products include framing options. Available frame options, if any, will be shown on the product page.' },
  ] },
  { section: 'CUSTOM_POSTERS', id: 'custom-posters', items: [
    { q: 'Can I upload my own image?', a: 'Yes. You can upload your own image when placing a custom poster order. We recommend a high-resolution image for the best print quality.' },
    { q: 'What image formats are supported?', a: 'We recommend high-quality JPG, JPEG, or PNG images. Supported formats and size limits are displayed on the upload page.' },
    { q: 'Will my poster look exactly like the preview?', a: 'We strive to match the preview as closely as possible. Minor variations in color, brightness, or finish may occur due to screen settings, printing processes, and paper material.' },
    { q: 'Can I change my image after placing the order?', a: 'Changes can only be made if production has not yet started. Once printing begins, modifications cannot be made.' },
    { q: 'Will my uploaded image be shared publicly?', a: 'No. Your image is used solely to produce your order and will be securely deleted once printing is completed.' },
  ] },
  { section: 'ORDERS', id: 'orders', items: [
    { q: 'How do I know my order is confirmed?', a: 'You will receive an order confirmation via email or SMS after your payment is successfully received.' },
    { q: 'Can I cancel my order?', a: 'Orders can only be cancelled before production begins. Once printing starts, cancellations and refunds are not possible.' },
    { q: 'Can I change my shipping address?', a: 'Address changes may be possible before dispatch. Contact our support team immediately if you need to update your address.' },
  ] },
  { section: 'SHIPPING', id: 'shipping', items: [
    { q: 'How long will delivery take?', a: 'Metro Cities: 2–5 business days. Tier 2 & 3 Cities: 3–7 business days. Remote Areas: 5–10 business days. Customized orders require additional production time.' },
    { q: 'How can I track my order?', a: 'Once shipped, you will receive a tracking number and shipping confirmation via email or SMS.' },
  ] },
  { section: 'PAYMENTS', id: 'payments', items: [
    { q: 'What payment methods do you accept?', a: 'We accept UPI, debit cards, credit cards, net banking, and other supported payment options available at checkout.' },
    { q: 'Is my payment information secure?', a: 'Yes. Payments are processed through secure, trusted gateways. Poster Theory does not store your card details, CVV, UPI PIN, or banking credentials.' },
  ] },
  { section: 'RETURNS_&_REFUNDS', id: 'returns', items: [
    { q: 'Can I return my order?', a: 'Returns are accepted only for damaged, defective, incorrect, or manufacturing-defective products, subject to our Return & Refund Policy.' },
    { q: 'Can I return a customized poster?', a: 'Customized posters cannot be returned unless they arrive damaged, defective, or incorrectly printed due to an error on our part.' },
    { q: 'What if I receive a damaged product?', a: 'Contact us within 48 hours of delivery with clear photographs of the product and packaging. Our team will assist with a replacement or resolution.' },
    { q: 'How long do refunds take?', a: 'Approved refunds are generally processed within 5–10 business days, depending on your bank or payment provider.' },
  ] },
];

function AccordionItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b-2 border-z-border">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex justify-between items-center py-5 text-left gap-4 group"
      >
        <span className="font-mono font-bold uppercase tracking-widest text-sm text-z-ink group-hover:text-z-muted transition-colors">
          {q}
        </span>
        <ChevronDown className={`w-5 h-5 shrink-0 text-z-ink transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <p className="pb-5 font-mono text-sm text-z-muted leading-relaxed tracking-wide">{a}</p>
      )}
    </div>
  );
}

export default function Help() {
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [selectedPolicy, setSelectedPolicy] = useState<string | null>(null);
  const { hash } = useLocation();

  const pageRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const faqRef = useRef<HTMLDivElement>(null);
  const supportRef = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
  if (!pageRef.current) return;

  const ctx = gsap.context(() => {

    // Initial states
    gsap.set(".help-reveal", {
      y: 80,
      opacity: 0,
    });

 gsap.set(".help-line", {
  width: "0%",
  opacity: 1,
});


const tl = gsap.timeline({
  scrollTrigger: {
    trigger: heroRef.current,
    start: "top 80%",
    toggleActions: "play none none reverse",
  },
});

tl.to(".help-line", {
  width: "100%",
  duration: 0.8,
  ease: "power4.inOut",
})
.to(".help-line", {
  width: "0%",
  duration: 0.7,
  ease: "power4.inOut",
});

    // Hero reveal
    const heroTl = gsap.timeline({
      scrollTrigger: {
        trigger: heroRef.current,
        start: "top 80%",
        toggleActions: "play none none reverse",
      },
    });

    heroTl
      .to(".help-eyebrow", {
        y: 0,
        opacity: 1,
        duration: 0.6,
        ease: "power4.out",
      })
      .to(
        ".help-title",
        {
          y: 0,
          opacity: 1,
          duration: 0.9,
          ease: "power4.out",
        },
        "-=0.3"
      )
      .to(
        ".help-line",
        {
          scaleX: 1,
          duration: 0.8,
          ease: "power4.inOut",
        },
        "-=0.4"
      );

    // FAQ sections
    gsap.utils.toArray(".help-section").forEach((section) => {
      gsap.fromTo(
        section,
        {
          y: 60,
          opacity: 0,
        },
        {
          y: 0,
          opacity: 1,
          duration: 0.7,
          ease: "power3.out",
          scrollTrigger: {
            trigger: section,
            start: "top 85%",
            toggleActions: "play none none reverse",
          },
        }
      );
    });

    // Sidebar cards
    gsap.utils.toArray(".help-card").forEach((card, index) => {
      gsap.fromTo(
        card,
        {
          y: 50,
          opacity: 0,
        },
        {
          y: 0,
          opacity: 1,
          duration: 0.7,
          delay: index * 0.1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: card,
            start: "top 85%",
            toggleActions: "play none none reverse",
          },
        }
      );
    });

  }, pageRef);

  return () => ctx.revert();
}, []);

  useEffect(() => {
    if (!hash) return;
    const id = hash.slice(1);
    setActiveSection(null);
    setTimeout(() => {
      const el = document.getElementById(id);
      if (el) {
        const offset = el.getBoundingClientRect().top + window.scrollY - 100;
        window.scrollTo({ top: offset, behavior: 'smooth' });
      }
    }, 50);
  }, [hash]);

  return (
    <div  ref={pageRef} className="pt-24 sm:pt-40 pb-32 min-h-screen">
      <div className="max-w-[1440px] mx-auto px-6">

        <header  ref={heroRef} className="mb-24 text-center border-b-4 border-z-border pb-16">
          <span className="help-reveal text-[14px] font-mono uppercase tracking-[0.5em] text-z-muted font-black mb-10 block underline decoration-4 underline-offset-8">
            HELP_CENTER
          </span>
          <h1 className="help-reveal help-title font-display font-bold text-6xl md:text-9xl tracking-tighter uppercase leading-[0.85] italic">
            HOW_CAN_WE<br />
            <span >HELP_YOU?</span>
          </h1>
          <div className="help-line h-1 bg-z-ink mt-8 max-w-[300px]" />
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">

          <div className="lg:col-span-2 space-y-16">
           {FAQ_SECTIONS.map((sec) => (
            <div
              key={sec.section}
              id={sec.id}
              className="help-section"
            >
                <button
                  onClick={() => setActiveSection(activeSection === sec.section ? null : sec.section)}
                  className="flex items-center gap-4 mb-6 group"
                >
                  <span className="text-[13px] font-mono font-black uppercase tracking-[0.4em] text-z-ink border-b-2 border-z-border pb-1 group-hover:text-z-muted transition-colors">
                    {sec.section}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-z-ink transition-transform duration-300 ${activeSection === sec.section || activeSection === null ? 'rotate-180' : ''}`}
                  />
                </button>
                {(activeSection === sec.section || activeSection === null) && (
                  <div className="border-t-2 border-z-border">
                    {sec.items.map((item) => (
                      <AccordionItem key={item.q} q={item.q} a={item.a} />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          <aside className="space-y-8 lg:sticky lg:top-32 self-start">
            <div className="help-card border-2 border-z-border p-8 shadow-[6px_6px_0px_0px_var(--color-z-shadow)]">
              <h2 className="font-display font-black uppercase tracking-widest text-lg italic mb-8 border-b-2 border-z-border pb-4">
                CONTACT_SUPPORT
              </h2>
              <ul className="space-y-6 font-mono text-sm font-bold uppercase tracking-widest">
                <li className="flex items-start gap-4">
                  <Mail className="w-5 h-5 shrink-0 mt-0.5" />
                  <a href="mailto:support@postertheory.in" className="text-z-muted hover:text-z-ink transition-colors break-all normal-case">
                    support@postertheory.in
                  </a>
                </li>
                <li className="flex items-start gap-4">
                  <Phone className="w-5 h-5 shrink-0 mt-0.5" />
                  <span className="text-z-muted">+91 XXXXXXXXXX</span>
                </li>
                <li className="flex items-start gap-4">
                  <Clock className="w-5 h-5 shrink-0 mt-0.5" />
                  <span className="text-z-muted">Mon – Sat<br />10:00 AM – 7:00 PM</span>
                </li>
              </ul>
            </div>

            <div className="help-card border-2 border-z-border p-8 shadow-[6px_6px_0px_0px_var(--color-z-shadow)]">
  <h2 className="font-display font-black uppercase tracking-widest text-lg italic mb-6 border-b-2 border-z-border pb-4">
    POLICIES
  </h2>

  <ul className="space-y-4 font-mono text-sm font-bold uppercase tracking-widest text-z-muted">
    {[
      "Terms & Conditions",
      "Privacy Policy",
      "Shipping Policy",
      "Return & Refund Policy",
      "Cancellation Policy",
    ].map((policy) => (
      <li key={policy}>
        <button
          type="button"
          onClick={() => setSelectedPolicy(policy)}
          className="hover:text-z-ink transition-colors flex items-center gap-2 text-left w-full"
        >
          <span className="w-1.5 h-1.5 bg-z-ink inline-block shrink-0" />
          {policy}
        </button>
      </li>
    ))}
  </ul>
</div>
          </aside>

        </div>
      </div>
       <PolicyModal
        policy={selectedPolicy}
        onClose={() => setSelectedPolicy(null)}
      />
    </div>
  );
}
function PolicyModal({
  policy,
  onClose,
}: {
  policy: string | null;
  onClose: () => void;
}) {
  return (
    <AnimatePresence>
      {policy && (
        <motion.div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* BACKDROP */}
          <motion.div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* MODAL */}
          <motion.div
            className="relative z-10 w-full max-w-[900px] max-h-[90vh] overflow-hidden border-2 border-z-border bg-z-paper shadow-[10px_10px_0px_0px_var(--color-z-shadow)]"
            initial={{ opacity: 0, y: 60, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.97 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            {/* HEADER */}
            <div className="flex items-center justify-between gap-4 border-b-2 border-z-border p-5 sm:p-7">
              <div>
                <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-z-muted mb-2">
                  POSTER_THEORY / LEGAL
                </p>

                <h2 className="font-display font-black text-2xl sm:text-4xl uppercase tracking-tighter text-z-ink">
                  {policy}
                </h2>
              </div>

              <button
                type="button"
                onClick={onClose}
                aria-label="Close policy"
                className="shrink-0 w-10 h-10 border-2 border-z-border flex items-center justify-center hover:bg-z-ink hover:text-z-paper transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* POLICY CONTENT */}
            <div className="overflow-y-auto max-h-[calc(90vh-120px)] p-5 sm:p-8 md:p-10">
              <PolicyContent policy={policy} />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
function PolicyContent({ policy }: { policy: string }) {
  const content: Record<string, React.ReactNode> = {
    "Terms & Conditions": (
      <>
        <PolicySection
          title="1. Acceptance of Terms"
          text="By using this website, you confirm that you are at least 18 years of age or are using the website under the supervision of a parent or legal guardian."
        />

        <PolicySection
          title="2. Products & Services"
          text="Poster Theory offers premium-quality posters, framed artwork, and customized poster printing services. Slight differences in color, size, or finish may occur due to screen settings, lighting conditions, printing processes, or manufacturing tolerances."
        />

        <PolicySection
          title="3. Custom Orders"
          text="Customers may upload their own images or artwork to create personalized posters. You confirm that you own the rights to the uploaded content or have permission to use it."
        />

        <PolicySection
          title="4. Pricing"
          text="All prices displayed on the website are listed in Indian Rupees (₹) unless otherwise specified. Prices may change without prior notice."
        />

        <PolicySection
          title="5. Orders"
          text="Once an order is successfully placed, you will receive an order confirmation. Poster Theory reserves the right to accept or reject orders."
        />

        <PolicySection
          title="6. Payment"
          text="We accept payments through secure payment gateways available on our website. Poster Theory does not store your complete debit card, credit card, or banking information."
        />

        <PolicySection
          title="7. Shipping & Delivery"
          text="Shipping timelines are estimates and may vary depending on your location, courier service, weather conditions, public holidays, or other unforeseen circumstances."
        />

        <PolicySection
          title="8. Returns & Refunds"
          text="Returns, replacements, and refunds are governed by our Return & Refund Policy. Customized products cannot be returned unless they arrive damaged, defective, or incorrect due to an error on our part."
        />

        <PolicySection
          title="18. Governing Law"
          text="These Terms & Conditions shall be governed by and interpreted in accordance with the laws of India."
        />
      </>
    ),

    "Privacy Policy": (
      <>
        <PolicySection
          title="1. Information We Collect"
          text="We may collect your full name, email address, mobile number, shipping address, billing address, payment information processed through payment partners, order history, account information, wishlist items, and custom poster information."
        />

        <PolicySection
          title="2. How We Use Your Information"
          text="We use your information to process orders, manage customer accounts, process payments, deliver orders, provide customer support, send order updates, improve our services, prevent fraud, and comply with legal obligations."
        />

        <PolicySection
          title="3. Uploaded Images & Custom Designs"
          text="You retain ownership of your original content. You grant Poster Theory permission to use uploaded content solely for producing and delivering your order."
        />

        <PolicySection
          title="4. Payment Security"
          text="Poster Theory does not store your complete debit card, credit card, UPI PIN, CVV, or online banking credentials."
        />

        <PolicySection
          title="5. Cookies"
          text="Our website uses cookies to improve functionality, remember preferences, keep you signed in, analyze website traffic, and improve user experience."
        />

        <PolicySection
          title="6. Sharing of Information"
          text="We do not sell, rent, or trade your personal information. Information may be shared with trusted third parties when necessary."
        />

        <PolicySection
          title="10. Your Rights"
          text="You may have the right to access, update, correct, or request deletion of your personal information, subject to applicable legal requirements."
        />
      </>
    ),

    "Shipping Policy": (
      <>
        <PolicySection
          title="1. Order Processing"
          text="Standard posters are typically processed within 1–3 business days. Custom posters are typically processed within 3–7 business days depending on customization complexity and order volume."
        />

        <PolicySection
          title="2. Shipping Locations"
          text="Poster Theory currently ships across India."
        />

        <PolicySection
          title="3. Delivery Time"
          text="Metro Cities: 2–5 business days. Tier 2 & Tier 3 Cities: 3–7 business days. Remote Areas: 5–10 business days."
        />

        <PolicySection
          title="4. Shipping Charges"
          text="Shipping charges, if applicable, will be calculated and displayed during checkout before payment."
        />

        <PolicySection
          title="5. Order Tracking"
          text="Once your order has been shipped, you will receive a shipping confirmation and tracking number."
        />

        <PolicySection
          title="9. Damaged Packages"
          text="If your package appears visibly damaged upon delivery, inspect it before accepting it and contact customer support within 48 hours."
        />

        <PolicySection
          title="11. Customized Poster Orders"
          text="Customized posters require additional production time. Processing begins after successful payment and submission of all required customization details."
        />
      </>
    ),

    "Return & Refund Policy": (
      <>
        <PolicySection
          title="1. Return Eligibility"
          text="Returns are accepted when you receive a damaged product, defective product, wrong product, or manufacturing defect."
        />

        <PolicySection
          title="Return Request Window"
          text="Return or replacement requests must be made within 48 hours of receiving your order. The product should remain unused and in its original condition."
        />

        <PolicySection
          title="2. Non-Returnable Items"
          text="Customized or personalized posters, products affected by incorrect customer-provided information, normal color variations, products damaged through misuse, and products returned without prior approval are not eligible for return or refund."
        />

        <PolicySection
          title="3. Customized Poster Orders"
          text="Customized posters cannot be returned or refunded unless the product arrives damaged, contains a printing error caused by Poster Theory, or the wrong customized design was printed due to our error."
        />

        <PolicySection
          title="5. Replacement Policy"
          text="If a claim is approved, Poster Theory may provide a replacement product or reprint depending on the nature of the issue and product availability."
        />

        <PolicySection
          title="6. Refund Policy"
          text="Refunds may be considered when a replacement cannot be provided, Poster Theory cannot fulfill the order, or a refund is otherwise approved by the support team."
        />

        <PolicySection
          title="7. Refund Processing Time"
          text="Approved refunds will generally be processed within 5–10 business days."
        />
      </>
    ),

    "Cancellation Policy": (
      <>
        <PolicySection
          title="1. Order Cancellation"
          text="Customers may request cancellation only if the order has not entered the production or printing stage."
        />

        <PolicySection
          title="2. Orders That Cannot Be Cancelled"
          text="Once printing or production has commenced, no cancellations, modifications, refunds, or exchanges will be accepted."
        />

        <PolicySection
          title="3. Customized Orders"
          text="Customers should carefully review the uploaded image, poster size, orientation, frame selection, and quantity before confirming their order."
        />

        <PolicySection
          title="4. How to Request a Cancellation"
          text="If production has not started, contact customer support with your Order ID, registered email address, contact number, and optionally the reason for cancellation."
        />

        <PolicySection
          title="5. Cancellation Refunds"
          text="If a cancellation is approved before production begins, the order will be cancelled and any eligible refund will generally be processed using the original payment method within 5–10 business days."
        />

        <PolicySection
          title="7. Changes to Orders"
          text="Customers may request changes only if production has not started. Once production begins, changes may not be possible."
        />
      </>
    ),
  };

  return (
    <div>
      <p className="font-mono text-[11px] sm:text-xs uppercase tracking-wide leading-7 text-z-muted mb-6">
        Please read this policy carefully before using our services or placing an order.
      </p>

      {content[policy]}
    </div>
  );
}
function PolicySection({
  title,
  text,
}: {
  title: string;
  text: string;
}) {
  return (
    <section className="border-b border-z-border/50 py-6 last:border-b-0">
      <h3 className="font-display font-black text-base sm:text-lg uppercase tracking-tight text-z-ink mb-3">
        {title}
      </h3>

      <p className="font-mono text-[11px] sm:text-xs leading-7 text-z-muted">
        {text}
      </p>
    </section>
  );
}
