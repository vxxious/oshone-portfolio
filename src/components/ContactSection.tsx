import React, { useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { toast } from 'sonner';

interface FormErrors {
  name?: string;
  email?: string;
  message?: string;
}

const validateEmail = (email: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const ContactSection = () => {
  const [sent, setSent] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  const validate = (): FormErrors => {
    const errs: FormErrors = {};
    if (!name.trim()) errs.name = 'Name is required';
    else if (name.trim().length > 100) errs.name = 'Name must be under 100 characters';
    if (!email.trim()) errs.email = 'Email is required';
    else if (!validateEmail(email.trim())) errs.email = 'Please enter a valid email';
    else if (email.trim().length > 255) errs.email = 'Email is too long';
    if (!message.trim()) errs.message = 'Message is required';
    else if (message.trim().length > 1000) errs.message = 'Message must be under 1000 characters';
    return errs;
  };

  const handleBlur = (field: string) => {
    setTouched((t) => ({ ...t, [field]: true }));
    setErrors(validate());
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    setTouched({ name: true, email: true, message: true });

    if (Object.keys(errs).length > 0) {
      toast.error('Please fix the errors before sending.');
      return;
    }

    try {
      const subject = encodeURIComponent(`Message from ${name.trim()}`);
      const body = encodeURIComponent(`From: ${name.trim()} (${email.trim()})\n\n${message.trim()}`);
      window.location.href = `mailto:omohoshone5@gmail.com?subject=${subject}&body=${body}`;
      toast.success('Opening your mail client…');
      setSent(true);
      setTimeout(() => {
        setSent(false);
        setName('');
        setEmail('');
        setMessage('');
        setTouched({});
        setErrors({});
      }, 3000);
    } catch {
      toast.error('Something went wrong. Please try again.');
    }
  };

  return (
    <motion.section
      ref={ref}
      className="contact-section"
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      <h2 className="contact-heading">Get in Touch</h2>
      <p className="contact-subtitle">Have a project in mind or just want to say hi? Drop me a message.</p>
      <form className="contact-form" onSubmit={handleSubmit} noValidate>
        <div className="form-row">
          <div className="form-field">
            <input
              type="text"
              placeholder="Your name"
              className={`form-input ${touched.name && errors.name ? 'form-input-error' : touched.name && !errors.name && name ? 'form-input-valid' : ''}`}
              value={name}
              onChange={(e) => { setName(e.target.value); if (touched.name) setErrors(validate()); }}
              onBlur={() => handleBlur('name')}
              maxLength={100}
            />
            {touched.name && errors.name && <span className="form-error">{errors.name}</span>}
          </div>
          <div className="form-field">
            <input
              type="email"
              placeholder="Your email"
              className={`form-input ${touched.email && errors.email ? 'form-input-error' : touched.email && !errors.email && email ? 'form-input-valid' : ''}`}
              value={email}
              onChange={(e) => { setEmail(e.target.value); if (touched.email) setErrors(validate()); }}
              onBlur={() => handleBlur('email')}
              maxLength={255}
            />
            {touched.email && errors.email && <span className="form-error">{errors.email}</span>}
          </div>
        </div>
        <div className="form-field">
          <textarea
            placeholder="Your message..."
            className={`form-textarea ${touched.message && errors.message ? 'form-input-error' : touched.message && !errors.message && message ? 'form-input-valid' : ''}`}
            value={message}
            onChange={(e) => { setMessage(e.target.value); if (touched.message) setErrors(validate()); }}
            onBlur={() => handleBlur('message')}
            maxLength={1000}
            rows={4}
          />
          {touched.message && errors.message && <span className="form-error">{errors.message}</span>}
          {message.length > 0 && (
            <span className="form-char-count">{message.length}/1000</span>
          )}
        </div>
        <button type="submit" className="form-submit" disabled={sent}>
          {sent ? 'Opening mail client…' : 'Send Message →'}
        </button>
      </form>
    </motion.section>
  );
};

export default ContactSection;
