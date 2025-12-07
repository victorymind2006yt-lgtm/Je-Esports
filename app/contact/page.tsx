"use client";

import Link from "next/link";
import {
  Mail,
  Phone,
  MessageCircle,
  Facebook,
  Instagram,
  Youtube,
  Send,
  ExternalLink
} from "lucide-react";

// TikTok Icon Component since it's not in Lucide
const TikTokIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
  </svg>
);

export default function ContactPage() {
  const contacts = [
    {
      icon: Mail,
      title: "General Support",
      description: "For general help and support.",
      value: "support@jeesports.online",
      href: "mailto:support@jeesports.online",
    },
    {
      icon: Mail,
      title: "Business Inquiries",
      description: "For partnerships and business-related matters.",
      value: "fazalrehman2006.work@gmail.com",
      href: "mailto:fazalrehman2006.work@gmail.com",
    },
    {
      icon: Mail,
      title: "Technical Support",
      description: "For technical issues and bug reports.",
      value: "ibrahm03185358@gmail.com",
      href: "mailto:ibrahm03185358@gmail.com",
    },
    {
      icon: Phone,
      title: "Phone Support",
      description: "For urgent matters.",
      value: "03165475717",
      href: "tel:03165475717",
    },
    {
      icon: MessageCircle,
      title: "WhatsApp Support",
      description: "For direct messaging.",
      value: "03185358454",
      href: "https://wa.me/923185358454",
    },
  ];

  const socials = [
    {
      icon: Facebook,
      label: "Facebook",
      href: "https://facebook.com", // Placeholder, user can update if needed
    },
    {
      icon: MessageCircle,
      label: "WhatsApp",
      href: "https://wa.me/923185358454",
    },
    {
      icon: Instagram,
      label: "Instagram",
      href: "https://instagram.com",
    },
    {
      icon: Youtube,
      label: "YouTube",
      href: "https://youtube.com",
    },
    {
      icon: TikTokIcon,
      label: "TikTok",
      href: "https://tiktok.com",
    },
  ];

  return (
    <div className="min-h-screen bg-[#050608] text-white px-4 py-8 md:px-8">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center space-y-4 pt-8">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Get In Touch</h1>
          <p className="text-muted text-lg max-w-2xl mx-auto">
            We're here to help and answer any question you might have. We look forward to hearing from you!
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Direct Contact Column */}
          <div className="rounded-3xl bg-[#080f0c] p-8 space-y-8 border border-white/5">
            <div className="space-y-2">
              <div className="flex items-center gap-2 mb-4">
                <Send className="w-6 h-6 text-white" />
                <h2 className="text-xl font-bold">Direct Contact</h2>
              </div>
              <p className="text-muted">
                For direct inquiries, you can reach us via email or phone.
              </p>
            </div>

            <div className="space-y-4">
              {contacts.map((contact, index) => (
                <a
                  key={index}
                  href={contact.href}
                  className="block p-4 rounded-xl bg-[#0d1412] border border-white/5 hover:border-emerald-500/30 transition-all group"
                >
                  <div className="flex items-start gap-4">
                    <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500 mt-1">
                      <contact.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">{contact.title}</h3>
                      <p className="text-xs text-muted mt-1">{contact.description}</p>
                      <p className="text-emerald-400 font-medium mt-1 break-all group-hover:text-emerald-300 transition-colors">
                        {contact.value}
                      </p>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </div>

          {/* Connect With Us Column */}
          <div className="rounded-3xl bg-[#080f0c] p-8 space-y-8 border border-white/5">
            <div className="space-y-2">
              <h2 className="text-xl font-bold">Connect With Us</h2>
              <p className="text-muted">
                Follow us on social media to stay updated with the latest news, tournaments, and announcements.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {socials.map((social, index) => (
                <Link
                  key={index}
                  href={social.href}
                  target="_blank"
                  className="flex flex-col items-center justify-center p-6 rounded-xl bg-[#0d1412] border border-white/5 hover:bg-[#121c19] hover:border-emerald-500/30 transition-all group gap-3"
                >
                  <social.icon className="w-8 h-8 text-muted group-hover:text-emerald-400 transition-colors" />
                  <span className="font-medium text-white group-hover:text-emerald-300 transition-colors">
                    {social.label}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
