import Link from "next/link";
import { Shield, MapPin, Phone, Mail, Link as LinkIcon, Heart } from "lucide-react";
import { EMERGENCY_CONTACTS, NAV_LINKS } from "@/lib/constants";

export function Footer() {
  return (
    <footer className="relative border-t border-card-border mt-auto">
      {/* Gradient top accent */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

      <div className="container-wide py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="relative">
                <Shield className="w-7 h-7 text-primary" />
                <MapPin className="w-3 h-3 text-secondary absolute -bottom-0.5 -right-0.5" />
              </div>
              <div className="flex flex-col">
                <span className="font-heading text-lg font-bold leading-tight">
                  Safe<span className="text-primary">Travel</span>
                </span>
                <span className="text-[10px] text-muted leading-none tracking-widest uppercase">
                  Lanka
                </span>
              </div>
            </Link>
            <p className="text-sm text-muted leading-relaxed">
              AI-powered tourism safety platform providing real-time weather
              intelligence and disaster awareness for travelers in Sri Lanka.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-heading font-semibold text-text mb-4">Quick Links</h4>
            <ul className="space-y-2.5">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted hover:text-primary transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Emergency Contacts */}
          <div>
            <h4 className="font-heading font-semibold text-text mb-4 flex items-center gap-2">
              <Phone className="w-4 h-4 text-danger" />
              Emergency Contacts
            </h4>
            <ul className="space-y-2.5">
              {EMERGENCY_CONTACTS.map((contact) => (
                <li key={contact.number} className="text-sm">
                  <span className="text-muted">{contact.name}</span>
                  <br />
                  <a
                    href={`tel:${contact.number}`}
                    className="font-mono text-primary hover:text-primary-light transition-colors"
                  >
                    {contact.number}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact & Social */}
          <div>
            <h4 className="font-heading font-semibold text-text mb-4">Connect</h4>
            <ul className="space-y-3">
              <li>
                <a
                  href="mailto:contact@safetravellanka.lk"
                  className="flex items-center gap-2 text-sm text-muted hover:text-primary transition-colors"
                >
                  <Mail className="w-4 h-4" />
                  contact@safetravellanka.lk
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/itzRR/SafeTravel-Lanka"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-muted hover:text-primary transition-colors"
                >
                  <LinkIcon className="w-4 h-4" />
                  GitHub Repository
                </a>
              </li>
            </ul>

            <div className="mt-6 p-3 glass rounded-lg">
              <p className="text-xs text-muted">
                <span className="text-warning">&#9888;</span> In case of emergency, always call{" "}
                <span className="font-mono text-danger font-semibold">119</span> (Police) or{" "}
                <span className="font-mono text-danger font-semibold">110</span> (Ambulance)
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-card-border flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-dark">
            &copy; {new Date().getFullYear()} SafeTravel Lanka. Final Year Project - University Submission.
          </p>
          <p className="text-xs text-muted-dark flex items-center gap-1">
            Made with <Heart className="w-3 h-3 text-danger fill-danger" /> by the SafeTravel Team
          </p>
        </div>
      </div>
    </footer>
  );
}
