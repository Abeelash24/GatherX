import { useState, useEffect } from 'react';
import { Mail, MapPin, Phone, Send, CheckCircle, AlertCircle } from 'lucide-react';
import { useToast } from '../context/ToastContext';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { addToast } = useToast();

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
    if (!formData.subject.trim()) newErrors.subject = 'Subject is required';
    if (!formData.message.trim()) newErrors.message = 'Message is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
      addToast('Message sent successfully! We will get back to you soon.', 'success');
    }, 1500);
  };

  return (
    <div className="animate-fade-in">
      <section className="relative py-20 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-900/20 via-dark-950 to-accent-900/10" />
        <div className="absolute inset-0 hero-radial-1" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full text-sm text-dark-300 mb-8 animate-slide-up">
            <span>Contact Us</span>
          </div>
          
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white mb-6 leading-tight animate-slide-up" style={{ animationDelay: '100ms' }}>
            Get in <span className="gradient-text">Touch</span>
          </h1>
          
          <p className="text-lg md:text-xl text-dark-400 max-w-2xl mx-auto animate-slide-up" style={{ animationDelay: '200ms' }}>
            Have questions, feedback, or partnership inquiries? We would love to hear from you.
          </p>
        </div>
      </section>

      <section className="py-20 md:py-28 bg-dark-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-8">Contact Information</h2>
              
              <div className="space-y-6">
                <div className="glass-card p-6 flex items-start gap-4">
                  <div className="p-3 bg-primary-500/10 rounded-xl">
                    <Mail className="w-6 h-6 text-primary-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold mb-1">Email</h3>
                    <p className="text-dark-400">contact@gatherx.io</p>
                    <p className="text-dark-400">support@gatherx.io</p>
                  </div>
                </div>

                <div className="glass-card p-6 flex items-start gap-4">
                  <div className="p-3 bg-primary-500/10 rounded-xl">
                    <Phone className="w-6 h-6 text-primary-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold mb-1">Phone</h3>
                    <p className="text-dark-400">+91 98765 43210</p>
                    <p className="text-dark-400">+91 87654 32109</p>
                  </div>
                </div>

                <div className="glass-card p-6 flex items-start gap-4">
                  <div className="p-3 bg-primary-500/10 rounded-xl">
                    <MapPin className="w-6 h-6 text-primary-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold mb-1">Location</h3>
                    <p className="text-dark-400">Bangalore, India</p>
                    <p className="text-dark-400">Global Platform</p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <div className="glass-card p-8">
                {submitted ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 mx-auto mb-6 bg-green-500/10 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-8 h-8 text-green-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">Message Sent!</h3>
                    <p className="text-dark-400 mb-6">Thank you for reaching out. We will get back to you within 24 hours.</p>
                    <button 
                      onClick={() => {
                        setSubmitted(false);
                        setFormData({ name: '', email: '', subject: '', message: '' });
                      }}
                      className="btn-primary"
                    >
                      Send Another Message
                    </button>
                  </div>
                ) : (
                  <>
                    <h2 className="text-2xl font-bold text-white mb-6">Send us a Message</h2>
                    
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-dark-300 mb-2">Full Name *</label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          className={`input-field ${errors.name ? 'border-red-500/50 focus:ring-red-500/50' : ''}`}
                          placeholder="Enter your full name"
                        />
                        {errors.name && <p className="mt-1.5 text-sm text-red-400">{errors.name}</p>}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-dark-300 mb-2">Email *</label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          className={`input-field ${errors.email ? 'border-red-500/50 focus:ring-red-500/50' : ''}`}
                          placeholder="Enter your email"
                        />
                        {errors.email && <p className="mt-1.5 text-sm text-red-400">{errors.email}</p>}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-dark-300 mb-2">Subject *</label>
                        <input
                          type="text"
                          name="subject"
                          value={formData.subject}
                          onChange={handleChange}
                          className={`input-field ${errors.subject ? 'border-red-500/50 focus:ring-red-500/50' : ''}`}
                          placeholder="What is this about?"
                        />
                        {errors.subject && <p className="mt-1.5 text-sm text-red-400">{errors.subject}</p>}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-dark-300 mb-2">Message *</label>
                        <textarea
                          name="message"
                          value={formData.message}
                          onChange={handleChange}
                          rows={5}
                          className={`input-field resize-none ${errors.message ? 'border-red-500/50 focus:ring-red-500/50' : ''}`}
                          placeholder="Tell us more..."
                        />
                        {errors.message && <p className="mt-1.5 text-sm text-red-400">{errors.message}</p>}
                      </div>

                      <button
                        type="submit"
                        disabled={submitting}
                        className="btn-primary w-full py-4"
                      >
                        {submitting ? (
                          <>
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                            Sending...
                          </>
                        ) : (
                          <>
                            <Send className="w-5 h-5 mr-2" />
                            Send Message
                          </>
                        )}
                      </button>
                    </form>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
