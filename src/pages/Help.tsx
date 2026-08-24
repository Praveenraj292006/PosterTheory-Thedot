import React, { useState, useEffect } from 'react';
import { ChevronDown, Mail, Phone, Clock } from 'lucide-react';
import { useLocation } from 'react-router-dom';

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
  const { hash } = useLocation();

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
    <div className="pt-24 sm:pt-40 pb-32 min-h-screen">
      <div className="max-w-[1440px] mx-auto px-6">

        <header className="mb-24 text-center border-b-4 border-z-border pb-16">
          <span className="text-[14px] font-mono uppercase tracking-[0.5em] text-z-muted font-black mb-10 block underline decoration-4 underline-offset-8">
            HELP_CENTER
          </span>
          <h1 className="font-display font-black text-6xl md:text-9xl tracking-tighter uppercase leading-[0.85] italic">
            HOW_CAN_WE<br />
            <span className="text-outline">HELP_YOU?</span>
          </h1>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">

          <div className="lg:col-span-2 space-y-16">
            {FAQ_SECTIONS.map((sec) => (
              <div key={sec.section} id={sec.id}>
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
            <div className="border-2 border-z-border p-8 shadow-[6px_6px_0px_0px_var(--color-z-shadow)]">
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

            <div className="border-2 border-z-border p-8 shadow-[6px_6px_0px_0px_var(--color-z-shadow)]">
              <h2 className="font-display font-black uppercase tracking-widest text-lg italic mb-6 border-b-2 border-z-border pb-4">
                POLICIES
              </h2>
              <ul className="space-y-4 font-mono text-sm font-bold uppercase tracking-widest text-z-muted">
                {[
                  ['Terms & Conditions', '#general'],
                  ['Privacy Policy', '#general'],
                  ['Shipping Policy', '#shipping'],
                  ['Return & Refund Policy', '#returns'],
                  ['Cancellation Policy', '#orders'],
                ].map(([label, href]) => (
                  <li key={label}>
                    <a href={href} className="hover:text-z-ink transition-colors flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-z-ink inline-block shrink-0" />
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </aside>

        </div>
      </div>
    </div>
  );
}
