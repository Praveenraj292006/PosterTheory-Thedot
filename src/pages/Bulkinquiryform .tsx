import React, { useLayoutEffect, useRef, useState } from 'react';
import { href, Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowLeft, MessageCircle, Check } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

/* ------------------------------------------------------------------
   Config — replace with the real business WhatsApp number.
   Format: country code + number, digits only, no + or spaces.
--------------------------------------------------------------------- */
const WHATSAPP_NUMBER = '918610254207';



const BUYER_TYPES = [
  'Individual', 'Business', 'Reseller', 'Influencer / Creator',
  'Event Organizer', 'Agency', 'Educational Institution', 'Other',
] as const;

const PRODUCTS = [
  'Posters', 'Custom Posters', 'Event Posters', 'Promotional Posters',
  'Wall Posters', 'Other',
] as const;

const QUANTITIES = [
  '0–50', '50–100', '100–250', '250–500', '500–1,000', '1,000–2,000', '2,000+',
] as const;

const CATEGORIES = [
  'Business / Branding', 'Events', 'Advertising / Promotions', 'Educational',
  'Motivational', 'Interior / Decor', 'Movie / Pop Culture', 'Custom', 'Other',
] as const;

const DESIGN_OPTIONS = [
  'I already have the design',
  'I need Poster Theory to provide the design',
  'I need design modifications',
  "I'm not sure — need assistance",
] as const;

const HEARD_OPTIONS = ['Instagram', 'Google', 'WhatsApp', 'Friend / Referral', 'Event', 'Other'] as const;

interface FormState {
  fullName: string;
  whatsapp: string;
  email: string;
  state: string;
  district: string;
  pin: string;
  buyerType: string;
  product: string;
  quantity: string;
  size: string;
  category: string;
  design: string;
  details: string;
  heard: string;
}

const initialForm: FormState = {
  fullName: '', whatsapp: '', email: '',  state: '', district: '', pin: '',
  buyerType: '', product: '', quantity: '', size: '', category: '',
  design: '', details: '', heard: '',
};

type RequiredKey = 'fullName' | 'whatsapp' | 'email' | 'pin';
const REQUIRED_FIELDS: RequiredKey[] = ['fullName', 'whatsapp', 'email', 'pin'];

type FormErrors = Partial<Record<keyof FormState, string>>;
type ChangeEvent = React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>;

/* ------------------------------------------------------------------
   Field — label + error wrapper shared by every input on the page.
--------------------------------------------------------------------- */
interface FieldProps {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}

function Field({ label, required, error, children }: FieldProps) {
  return (
    <label className="bulk-field flex flex-col gap-2">
      <span className="font-mono font-bold uppercase tracking-widest text-xs text-z-ink">
        {label}
        {required && <span className="text-z-ink/60"> *</span>}
      </span>
      {children}
      {error && <span className="font-mono text-[11px] text-red-600">{error}</span>}
    </label>
  );
}

const inputBase =
  'border-2 border-z-border bg-transparent text-z-ink font-mono text-sm px-4 py-3 transition-shadow focus:outline-none focus:shadow-[4px_4px_0px_0px_var(--color-z-shadow)]';

const selectBase =
  `${inputBase} appearance-none bg-[linear-gradient(45deg,transparent_50%,currentColor_50%),linear-gradient(135deg,currentColor_50%,transparent_50%)] bg-[position:calc(100%-20px)_calc(50%-3px),calc(100%-14px)_calc(50%-3px)] bg-[length:6px_6px,6px_6px] bg-no-repeat pr-10`;

/* ------------------------------------------------------------------
   Success toast — same AnimatePresence pattern as PolicyModal in
   Help.tsx, sized down for an inline confirmation instead of a modal.
--------------------------------------------------------------------- */
function SuccessToast({ show }: { show: boolean }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 16 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 border-2 border-z-border bg-z-ink text-z-paper font-mono text-xs uppercase tracking-widest px-6 py-4 shadow-[6px_6px_0px_0px_var(--color-z-shadow)]"
        >
          <Check className="w-4 h-4 shrink-0" />
          Opened WhatsApp with your details — send the message to reach us.
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function BulkInquiryForm() {
  const pageRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);

  const [form, setForm] = useState<FormState>(initialForm);
  const [errors, setErrors] = useState<FormErrors>({});
  const [sent, setSent] = useState(false);
  const [pinLoading, setPinLoading] = useState(false);
  const [pinError, setPinError] = useState('');

  useLayoutEffect(() => {
    if (!pageRef.current) return;

    const ctx = gsap.context(() => {
      gsap.set('.bulk-form-reveal', { y: 60, opacity: 0 });
      gsap.set('.bulk-form-line', { width: '0%', opacity: 1 });

      const heroTl = gsap.timeline({
        scrollTrigger: {
          trigger: heroRef.current,
          start: 'top 85%',
          toggleActions: 'play none none reverse',
        },
      });

      heroTl
        .to('.bulk-form-eyebrow', { y: 0, opacity: 1, duration: 0.6, ease: 'power4.out' })
        .to('.bulk-form-title', { y: 0, opacity: 1, duration: 0.8, ease: 'power4.out' }, '-=0.3')
        .to('.bulk-form-sub', { y: 0, opacity: 1, duration: 0.6, ease: 'power4.out' }, '-=0.4')
        .to('.bulk-form-line', { width: '100%', duration: 0.7, ease: 'power4.inOut' }, '-=0.3')
        .to('.bulk-form-line', { width: '0%', duration: 0.6, ease: 'power4.inOut' });

      gsap.utils.toArray<HTMLElement>('.bulk-field-row').forEach((row, i) => {
        gsap.fromTo(
          row,
          { y: 36, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.6,
            delay: Math.min(i * 0.04, 0.3),
            ease: 'power3.out',
            scrollTrigger: { trigger: row, start: 'top 92%', toggleActions: 'play none none reverse' },
          }
        );
      });
    }, pageRef);

    return () => ctx.revert();
  }, []);

  useLayoutEffect(() => {
  if (form.pin.length !== 6) return;

  const timer = window.setTimeout(() => {
    lookupPinCode(form.pin);
  }, 400);

  return () => window.clearTimeout(timer);
}, [form.pin]);

  const update = (key: keyof FormState) => (e: ChangeEvent) => {
    const { value } = e.target;
    setForm((f) => ({ ...f, [key]: value }));
    if (errors[key]) setErrors((er) => ({ ...er, [key]: undefined }));
  };

  const lookupPinCode = async (pin: string) => {
  if (!/^\d{6}$/.test(pin)) {
    setPinError('');
    return;
  }

  setPinLoading(true);
  setPinError('');

  try {
    const response = await fetch(`https://api.postalpincode.in/pincode/${pin}`);
    const data = await response.json();

    const postOffice = data?.[0]?.PostOffice?.[0];

    if (!postOffice) {
      setPinError('PIN code not found');
      setForm((f) => ({ ...f, state: '', district: '' ,pin: ''}));
      return;
    }

    setForm((f) => ({
      ...f,
      state: postOffice.State || '',
      district: postOffice.District || '',
      pin: postOffice.PINCode || '',
    }));
  } catch {
    setPinError('Unable to find location');
  } finally {
    setPinLoading(false);
  }
};

const validateRequiredFields = () => {
  const nextErrors: FormErrors = {};

  if (!form.fullName.trim()) {
    nextErrors.fullName = 'Full name is required';
    console.log("Name error")
  }

  if (!form.whatsapp.trim()) {
    nextErrors.whatsapp = 'WhatsApp number is required';
     console.log("Wanum error");
  } else if (form.whatsapp.replace(/\D/g, '').length < 10) {
    nextErrors.whatsapp = 'Enter a valid WhatsApp number';
     console.log("Wanum2 error");
  }

  if (!form.email.trim()) {
    nextErrors.email = 'Email is required';
     console.log("email error")
  } else if (!/^\S+@\S+\.\S+$/.test(form.email)) {
    nextErrors.email = 'Enter a valid email';
    console.log("email error");
  }



  setErrors(nextErrors);

  return Object.keys(nextErrors).length === 0;
};
const handleWhatsAppQuote = () => {
  if (!validateRequiredFields()) return;

  

  const message = `NEW BULK POSTER INQUIRY — Poster Theory

Name: ${form.fullName}
WhatsApp: ${form.whatsapp}
Email: ${form.email}
District: ${form.district || '-'}
State: ${form.state || '-'}
PIN: ${form.pin || '-'}
Buyer type: ${form.buyerType || '-'}
Product required: ${form.product || '-'}
Quantity: ${form.quantity || '-'}
Preferred size: ${form.size || '-'}
Category / theme: ${form.category || '-'}
Design requirement: ${form.design || '-'}
Additional details: ${form.details || '-'}
Heard via: ${form.heard || '-'}`;

  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

  window.location.assign(whatsappUrl);
};

  const  handleFormSubmit = () => {
   if (!validateRequiredFields()) return;

  console.log('Bulk inquiry submitted:', form);

  setSent(true);

  window.setTimeout(() => {
    setSent(false);
  }, 5000);
  };

  return (
    <div ref={pageRef} className="pt-24 sm:pt-40 pb-32 min-h-screen">
      <div className="max-w-[900px] mx-auto px-6">
        <Link
          to="/bulk-inquiry"
          className="bulk-form-reveal bulk-form-eyebrow inline-flex items-center gap-2 font-mono font-bold uppercase tracking-widest text-xs text-z-muted hover:text-z-ink transition-colors mb-10"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Link>

        <header ref={heroRef} className="mb-16 border-b-4 border-z-border pb-12">
          <h1 className="bulk-form-reveal bulk-form-title font-display font-bold text-4xl md:text-6xl tracking-tighter uppercase leading-[0.95] italic">
            Bulk_inquiry_form
          </h1>
          <div className="bulk-form-line h-1 bg-z-ink mt-6 max-w-[220px]" />
          <p className="bulk-form-reveal bulk-form-sub mt-6 font-mono text-sm text-z-muted leading-7 max-w-[52ch]">
            Fill in what you know — we'll follow up on WhatsApp for anything missing.
            Fields marked * are required to send.
          </p>
        </header>

        <div className="space-y-8">
          <div className="bulk-field-row grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Field label="Full name" required error={errors.fullName}>
              <input
                className={inputBase}
                placeholder="Your name"
                value={form.fullName}
                onChange={update('fullName')}
              />
            </Field>
            <Field label="WhatsApp number" required error={errors.whatsapp}>
              <input
                className={inputBase}
                placeholder="+91 98765 43210"
                type="tel"
                value={form.whatsapp}
                onChange={update('whatsapp')}
              />
            </Field>
             <Field label="Email address" required error={errors.whatsapp}>
              <input
                className={inputBase}
                placeholder="postertheory@gmail.com"
                type="email"
                value={form.email}
                onChange={update('email')}
              />
            </Field>
          </div>

          <div className="bulk-field-row grid grid-cols-1 sm:grid-cols-3 gap-6">
  <Field label="PIN code" error={pinError}>
    <input
      className={inputBase}
      placeholder="600001"
      inputMode="numeric"
      maxLength={6}
      value={form.pin}
      onChange={(e) => {
        const value = e.target.value.replace(/\D/g, '').slice(0, 6);

        setForm((f) => ({
          ...f,
          pin: value,
          ...(value.length < 6
            ? { state: '', district: '' }
            : {}),
        }));

        setPinError('');
      }}
    />

    {pinLoading && (
      <span className="font-mono text-[10px] uppercase tracking-widest text-z-muted">
        Finding location...
      </span>
    )}
  </Field>

  <Field label="State">
    <input
      className={`${inputBase} bg-z-muted/5`}
      placeholder="Auto detected"
      value={form.state}
      readOnly
    />
  </Field>

  <Field label="District">
    <input
      className={`${inputBase} bg-z-muted/5`}
      placeholder="Auto detected"
      value={form.district}
      readOnly
    />
  </Field>
  
</div>

<div className="bulk-field-row">
  <Field label="Buyer type">
    <select className={selectBase} value={form.buyerType} onChange={update('buyerType')}>
      <option value="">Select</option>
      {BUYER_TYPES.map((s) => (
        <option key={s} value={s}>{s}</option>
      ))}
    </select>
  </Field>
</div>

          <div className="bulk-field-row grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Field label="Product required">
              <select className={selectBase} value={form.product} onChange={update('product')}>
                <option value="">Select product</option>
                {PRODUCTS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </Field>
            <Field label="Quantity required">
              <select className={selectBase} value={form.quantity} onChange={update('quantity')}>
                <option value="">Select quantity</option>
                {QUANTITIES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </Field>
          </div>

          <div className="bulk-field-row grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Field label="Preferred poster size">
              <input
                className={inputBase}
                placeholder="A6, A5, A4, A3, 30×19 inches, or custom size"
                value={form.size}
                onChange={update('size')}
              />
            </Field>
            <Field label="Poster category / theme">
              <select className={selectBase} value={form.category} onChange={update('category')}>
                <option value="">Select category</option>
                {CATEGORIES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </Field>
          </div>

          <div className="bulk-field-row">
            <Field label="Design requirement">
              <select className={selectBase} value={form.design} onChange={update('design')}>
                <option value="">Select an option</option>
                {DESIGN_OPTIONS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </Field>
          </div>

          <div className="bulk-field-row">
            <Field label="Additional details">
              <textarea
                className={`${inputBase} min-h-[120px] resize-y`}
                placeholder="Tell us about your requirements, references, special requests, or any questions."
                value={form.details}
                onChange={update('details')}
              />
            </Field>
          </div>

          <div className="bulk-field-row">
            <Field label="How did you hear about us?">
              <select className={selectBase} value={form.heard} onChange={update('heard')}>
                <option value="">Select</option>
                {HEARD_OPTIONS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </Field>
          </div>

          <div className="bulk-field-row pt-4 flex flex-col sm:flex-row gap-4">
  <button
    type="button"
    onClick={handleFormSubmit}
    className="inline-flex items-center justify-center gap-3 border-2 border-z-border bg-z-paper text-z-ink font-mono font-bold uppercase tracking-widest text-sm px-8 py-4 shadow-[6px_6px_0px_0px_var(--color-z-shadow)] transition-all hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[9px_9px_0px_0px_var(--color-z-shadow)]"
  >
    Submit Inquiry
  </button>

  <button
    type="button"
    onClick={handleWhatsAppQuote}
    className="inline-flex items-center justify-center gap-3 border-2 border-z-border bg-z-ink text-z-paper font-mono font-bold uppercase tracking-widest text-sm px-8 py-4 shadow-[6px_6px_0px_0px_var(--color-z-shadow)] transition-all hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[9px_9px_0px_0px_var(--color-z-shadow)]"
  >
    Get Quote on WhatsApp
    <MessageCircle className="w-4 h-4" />
  </button>
</div>
        </div>
      </div>

      <SuccessToast show={sent} />
    </div>
  );
}