// app/(portal)/dashboard/_components/support-channels.tsx
import { Instagram, Phone } from "lucide-react";

export default function SupportChannels() {
  return (
    <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-6">
      <h3 className="text-lg font-medium text-zinc-100 mb-4">
        Canais de Atendimento
      </h3>

      <div className="space-y-4">
        <a
          href="https://www.instagram.com/thprop_/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 text-zinc-400 hover:text-zinc-100 transition-colors"
        >
          <Instagram className="w-5 h-5" />
          @thprop_
        </a>
        <a
          href="https://api.whatsapp.com/send?phone=5562993776216"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 text-zinc-400 hover:text-zinc-100 transition-colors"
        >
          <Phone className="w-5 h-5" />
          Suporte via WhatsApp
        </a>
      </div>
    </div>
  );
}
